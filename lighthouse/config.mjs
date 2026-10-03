/**
 * Reproducible Lighthouse audit contract for the production preview.
 * Lighthouse's built-in mobile and desktop presets are deliberately used
 * unchanged; this file only defines our routes, samples, and acceptance gate.
 */
export const auditConfig = {
  baseUrl: 'http://127.0.0.1:4173',
  host: '127.0.0.1',
  port: 4173,
  mockScenario: 'success',
  outputDirectory: 'reports/lighthouse',
  runsPerTarget: 3,
  targets: [
    { id: 'home', path: '/' },
    { id: 'nft-detail', path: '/nft/emerald-ape-042' }
  ],
  profiles: ['mobile', 'desktop'],
  thresholds: {
    performance: 0.9,
    accessibility: 0.95,
    'best-practices': 0.95,
    seo: 0.9
  }
}
