import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse, { desktopConfig } from 'lighthouse'
import { auditConfig } from '../lighthouse/config.mjs'

const execFileAsync = promisify(execFile)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = path.join(root, auditConfig.outputDirectory)
const categories = Object.keys(auditConfig.thresholds)
const requestedTarget = process.env.AUDIT_TARGET
const requestedProfile = process.env.AUDIT_PROFILE
const requestedRun = process.env.AUDIT_RUN
const summarizeOnly = process.env.AUDIT_SUMMARIZE_ONLY === 'true'
const selectedTargets = requestedTarget
  ? auditConfig.targets.filter(target => target.id === requestedTarget)
  : auditConfig.targets
const selectedProfiles = requestedProfile
  ? auditConfig.profiles.filter(profile => profile === requestedProfile)
  : auditConfig.profiles
const selectedRuns = requestedRun
  ? [Number(requestedRun)]
  : Array.from({ length: auditConfig.runsPerTarget }, (_, index) => index + 1)
const partialAudit =
  summarizeOnly ||
  selectedTargets.length !== auditConfig.targets.length ||
  selectedProfiles.length !== auditConfig.profiles.length ||
  selectedRuns.length !== auditConfig.runsPerTarget

function percentileMedian(values) {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

function formatScore(value) {
  return Math.round(value * 100)
}

function formatMilliseconds(value) {
  return `${Math.round(value)} ms`
}

function formatCls(value) {
  return value.toFixed(3)
}

function findFailureCauses(samples, medians) {
  const failedCategories = categories.filter(
    category => medians[category] < auditConfig.thresholds[category]
  )
  const causes = new Map()

  for (const sample of samples) {
    for (const [auditId, audit] of Object.entries(sample.lhr.audits)) {
      if (!failedCategories.includes('performance') && audit.score !== 0) continue
      if (audit.details?.type !== 'opportunity' || !audit.displayValue) continue
      causes.set(auditId, `${audit.title}: ${audit.displayValue}`)
    }
  }

  return [...causes.values()].slice(0, 3)
}

async function commandVersion(command, args = ['--version']) {
  try {
    const { stdout } = await execFileAsync(command, args, { cwd: root })
    return stdout.trim()
  } catch {
    return 'unavailable'
  }
}

async function gitSha() {
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
      cwd: root
    })
    return stdout.trim()
  } catch {
    return 'unavailable'
  }
}

function startPreview() {
  const child = spawn(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'preview', '--', '--host', auditConfig.host, '--port', String(auditConfig.port), '--strictPort'],
    {
      cwd: root,
      env: { ...process.env, VITE_MOCK_SCENARIO: auditConfig.mockScenario },
      stdio: ['ignore', 'pipe', 'pipe']
    }
  )

  let output = ''
  child.stdout.on('data', chunk => { output += chunk.toString() })
  child.stderr.on('data', chunk => { output += chunk.toString() })

  return { child, output: () => output }
}

async function waitForPreview(preview) {
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(auditConfig.baseUrl, { redirect: 'manual' })
      if (response.ok) return
    } catch {
      // The server may not have bound the socket yet.
    }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`vite preview did not become available.\n${preview.output()}`)
}

async function runAudit(target, profile, run) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] })
  const directory = path.join(outputDirectory, target.id, profile)
  const basename = `run-${run}`
  const url = new URL(target.path, auditConfig.baseUrl).toString()
  await mkdir(directory, { recursive: true })

  try {
    const result = await lighthouse(
      url,
      {
        port: chrome.port,
        output: ['html', 'json'],
        logLevel: 'error',
        onlyCategories: categories,
        disableStorageReset: false
      },
      profile === 'desktop' ? desktopConfig : undefined
    )
    if (!result?.lhr || !result.report) throw new Error('Lighthouse returned no report')

    const reports = Array.isArray(result.report) ? result.report : [result.report]
    await writeFile(path.join(directory, `${basename}.html`), reports[0])
    await writeFile(path.join(directory, `${basename}.json`), reports[1])
    return result.lhr
  } finally {
    await chrome.kill()
  }
}

async function readSavedResults() {
  const results = []
  for (const target of auditConfig.targets) {
    for (const profile of auditConfig.profiles) {
      for (let run = 1; run <= auditConfig.runsPerTarget; run += 1) {
        const filename = path.join(outputDirectory, target.id, profile, `run-${run}.json`)
        try {
          results.push({
            target: target.id,
            profile,
            run,
            lhr: JSON.parse(await readFile(filename, 'utf8'))
          })
        } catch {
          throw new Error(`Missing Lighthouse report: ${filename}`)
        }
      }
    }
  }
  return results
}

function createSummary(results, metadata) {
  const rows = []
  let passes = true

  for (const target of auditConfig.targets) {
    for (const profile of auditConfig.profiles) {
      const samples = results.filter(
        result => result.target === target.id && result.profile === profile
      )
      const medians = Object.fromEntries(
        categories.map(category => [
          category,
          percentileMedian(samples.map(sample => sample.lhr.categories[category].score))
        ])
      )
      const lcp = percentileMedian(samples.map(sample => sample.lhr.audits['largest-contentful-paint'].numericValue))
      const cls = percentileMedian(samples.map(sample => sample.lhr.audits['cumulative-layout-shift'].numericValue))
      const tbt = percentileMedian(samples.map(sample => sample.lhr.audits['total-blocking-time'].numericValue))
      const categoryStatus = categories.map(category => {
        const passed = medians[category] >= auditConfig.thresholds[category]
        if (!passed) passes = false
        return `${formatScore(medians[category])}${passed ? ' ✓' : ' ✗'}`
      })
      const causes = findFailureCauses(samples, medians)

      rows.push({
        target,
        profile,
        medians,
        lcp,
        cls,
        tbt,
        categoryStatus,
        causes
      })
    }
  }

  const markdown = [
    '# Lighthouse audit report',
    '',
    `Generated: ${metadata.generatedAt}`,
    '',
    '## Median results',
    '',
    '| Route | Profile | Performance ≥90 | Accessibility ≥95 | Best Practices ≥95 | SEO ≥90 | LCP | CLS | TBT |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...rows.map(row =>
      `| \`${row.target.path}\` | ${row.profile} | ${row.categoryStatus[0]} | ${row.categoryStatus[1]} | ${row.categoryStatus[2]} | ${row.categoryStatus[3]} | ${formatMilliseconds(row.lcp)} | ${formatCls(row.cls)} | ${formatMilliseconds(row.tbt)} |`
    ),
    '',
    `Overall gate: **${passes ? 'PASS' : 'FAIL'}**`,
    '',
    '## Conditions',
    '',
    `- Production build: \`npm run build\` with \`VITE_MOCK_SCENARIO=${auditConfig.mockScenario}\`.`,
    `- Server: \`vite preview --host ${auditConfig.host} --port ${auditConfig.port} --strictPort\`.`,
    `- Samples: ${auditConfig.runsPerTarget} clean-browser navigations per route/profile; Lighthouse storage reset is enabled.`,
    '- Profiles: Lighthouse built-in mobile and desktop presets, unmodified.',
    '- Assets, fonts, MSW and application features are loaded normally; there is no audit-only application behavior.',
    ...(passes
      ? []
      : [
          '',
          '## Results below target',
          '',
          ...rows
            .filter(row => row.causes.length > 0)
            .map(
              row =>
                `- \`${row.target.path}\` (${row.profile}): ${row.causes.join('; ')}.`
            ),
          '- Inspect the linked HTML report for the full audit evidence before accepting an exception.'
        ]),
    '',
    '## Environment',
    '',
    `- Git SHA: ${metadata.gitSha}`,
    `- Platform: ${metadata.platform} (${metadata.arch})`,
    `- Node: ${metadata.node}`,
    `- npm: ${metadata.npm}`,
    `- Vite: ${metadata.vite}`,
    `- Lighthouse: ${metadata.lighthouse}`,
    `- Chrome user agent: ${metadata.userAgent}`,
    '',
    '## Raw reports',
    '',
    ...rows.flatMap(row => {
      const relative = path.posix.join(row.target.id, row.profile)
      return [`- \`${relative}/run-1.{html,json}\`, \`${relative}/run-2.{html,json}\`, \`${relative}/run-3.{html,json}\``]
    }),
    ''
  ].join('\n')

  return { markdown, passes }
}

async function main() {
  if (requestedTarget && selectedTargets.length === 0)
    throw new Error(`Unknown AUDIT_TARGET: ${requestedTarget}`)
  if (requestedProfile && selectedProfiles.length === 0)
    throw new Error(`Unknown AUDIT_PROFILE: ${requestedProfile}`)
  if (requestedRun && (!Number.isInteger(selectedRuns[0]) || selectedRuns[0] < 1 || selectedRuns[0] > auditConfig.runsPerTarget))
    throw new Error(`AUDIT_RUN must be between 1 and ${auditConfig.runsPerTarget}`)

  if (!partialAudit) await rm(outputDirectory, { recursive: true, force: true })
  await mkdir(outputDirectory, { recursive: true })

  if (!summarizeOnly) {
    await new Promise((resolve, reject) => {
      const build = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
        cwd: root,
        env: { ...process.env, VITE_MOCK_SCENARIO: auditConfig.mockScenario },
        stdio: 'inherit'
      })
      build.on('error', reject)
      build.on('exit', code => code === 0 ? resolve() : reject(new Error(`npm run build exited with ${code}`)))
    })
  }

  if (!summarizeOnly) {
    const preview = startPreview()
    try {
      await waitForPreview(preview)
      for (const target of selectedTargets) {
        for (const profile of selectedProfiles) {
          for (const run of selectedRuns) {
            console.log(`Lighthouse: ${target.id} / ${profile} / run ${run}`)
            await runAudit(target, profile, run)
          }
        }
      }
    } finally {
      preview.child.kill('SIGTERM')
    }
  }

  if (partialAudit && !summarizeOnly) return
  const results = await readSavedResults()
  const firstReport = results[0]?.lhr
  const metadata = {
    generatedAt: new Date().toISOString(),
    gitSha: await gitSha(),
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    npm: await commandVersion('npm'),
    vite: await commandVersion('npx', ['vite', '--version']),
    lighthouse: await commandVersion('npx', ['lighthouse', '--version']),
    userAgent: firstReport?.environment?.hostUserAgent ?? 'unavailable'
  }
  const summary = createSummary(results, metadata)
  await writeFile(path.join(outputDirectory, 'summary.md'), summary.markdown)
  console.log(summary.markdown)
  if (!summary.passes) process.exitCode = 1
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
