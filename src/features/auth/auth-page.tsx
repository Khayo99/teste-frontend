import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { EyeOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { login, register, type AuthApiError } from './api/auth-api'
import { useAuthStore } from './auth-store'
import { loginSchema, registerSchema } from './lib/auth-validation'
import googleGreen from '@/assets/auth/asset-5.svg'
import googleBlue from '@/assets/auth/asset-6.svg'
import googleYellow from '@/assets/auth/asset-7.svg'
import googleBlueDark from '@/assets/auth/asset-8.svg'
import googleOrange from '@/assets/auth/asset-13.svg'
import facebookIcon from '@/assets/auth/asset-9.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HomePage } from '@/features/home/home-page'

type Mode = 'login' | 'register'
type FormValues = Record<string, string>

export function AuthPage({ mode, background = true, onClose, returnTo }: { mode: Mode; background?: boolean; onClose?: () => void; returnTo?: string }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as {
    returnTo: string | undefined
  }
  const { setSession } = useAuthStore()
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const destination = returnTo ?? search.returnTo
  const close = () => {
    onClose?.()
    if (!onClose) void navigate({ to: destination?.startsWith('/') ? destination : '/' })
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const schema = isRegister ? registerSchema : loginSchema
      const parsed = schema.safeParse(values)
      if (!parsed.success) {
        const next: Record<string, string> = {}
        for (const issue of parsed.error.issues)
          next[String(issue.path[0])] = issue.message
        setErrors(next)
        throw new Error('validation')
      }
      setErrors({})
      return isRegister
        ? register(parsed.data as Parameters<typeof register>[0])
        : login(parsed.data as Parameters<typeof login>[0])
    },
    onSuccess: session => {
      setSession(session)
      if (onClose) {
        onClose()
        if (destination && destination !== window.location.pathname) void navigate({ to: destination })
      } else void navigate({ to: destination?.startsWith('/') ? destination : '/' })
    },
    onError: error => {
      if (error.message === 'validation') return
      const apiError = error as AuthApiError
      setErrors(apiError.fieldErrors)
      if (!isRegister && !apiError.fieldErrors.email)
        setErrors({ form: 'E-mail ou senha inválidos.' })
    }
  })

  const update = (key: string, value: string) =>
    setValues(current => ({ ...current, [key]: value }))

  return (
    <>
      {background && <HomePage />}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/10 px-4 py-8 sm:py-[8vh]"
        role="presentation"
        onMouseDown={event => {
          if (event.target === event.currentTarget) close()
        }}
      >
        <section
          className="relative flex h-[600px] w-full max-w-[500px] flex-col overflow-hidden bg-surface-card shadow-2xl shadow-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
        >
          <Button
            aria-label="Fechar autenticação"
            className="absolute right-3 top-3 z-10 grid size-6 place-items-center p-0"
            variant="ghost"
            type="button"
            onClick={close}
          >
            <X className="size-[18px]" />
          </Button>
          <div className="shrink-0 px-12 pb-0 pt-12 text-center">
            <div className="flex justify-center gap-2 text-xl leading-4 font-medium">
              <Link
                className={
                  isRegister ? 'text-text-primary' : 'text-text-accent'
                }
                to="/login"
                search={{ returnTo: search.returnTo }}
              >
                Entrar
              </Link>
              <span className="text-text-coral">|</span>
              <Link
                className={
                  isRegister ? 'text-text-accent' : 'text-text-primary'
                }
                to="/register"
                search={{ returnTo: search.returnTo }}
              >
                Criar conta
              </Link>
            </div>
            <h1 id="auth-title" className="sr-only">
              {isRegister ? 'Criar conta' : 'Entrar'}
            </h1>
            <p className="mt-10 text-[13px] leading-4 text-text-primary">
              {isRegister
                ? 'Crie sua conta para explorar o marketplace.'
                : 'Entre para gerenciar sua carteira, coleção e perfil de criador.'}
            </p>
          </div>
          <form
            className="space-y-3 px-20 pt-6"
            onSubmit={event => {
              event.preventDefault()
              mutation.mutate()
            }}
            noValidate
          >
            {errors.form && (
              <div
                role="alert"
                className="rounded border border-error bg-error/10 p-3 text-xs text-error"
              >
                {errors.form}
              </div>
            )}
            {isRegister && (
              <Field
                id="name"
                label="Nome"
                value={values.name}
                error={errors.name}
                onChange={update}
              />
            )}
            <Field
              id="email"
              label="E-mail"
              type="email"
              placeholder="contato@email.com"
              value={values.email}
              error={errors.email}
              onChange={update}
            />
            <Field
              id="password"
              label="Senha"
              type="password"
              placeholder="************"
              value={values.password}
              error={errors.password}
              onChange={update}
            />
            {isRegister && (
              <Field
                id="confirmPassword"
                label="Confirmar senha"
                type="password"
                value={values.confirmPassword}
                error={errors.confirmPassword}
                onChange={update}
              />
            )}
            {!isRegister && (
              <Button
                className="-mt-1 block h-auto w-full p-0 text-right text-[10px] hover:underline"
                variant="ghost"
                type="button"
              >
                Esqueceu a senha?
              </Button>
            )}
            <Button
              className="mt-3 h-[45px] w-full text-base font-bold leading-4"
              disabled={mutation.isPending}
              type="submit"
            >
              {mutation.isPending
                ? 'Aguarde…'
                : isRegister
                  ? 'Criar conta'
                  : 'Entrar'}
            </Button>
          </form>
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-3 px-6">
              <span className="h-px flex-1 bg-border" />
              <p className="text-[13px] leading-4 text-text-primary">
                Ou continue com
              </p>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col gap-3 px-20">
              <SocialButton provider="Google" />
              <SocialButton provider="Facebook" />
            </div>
          </div>
          <div className="mt-auto h-[10px] shrink-0 bg-primary" />
        </section>
      </div>
    </>
  )
}

function Field({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  onChange
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  error?: string
  onChange: (id: string, value: string) => void
}) {
  const errorId = `${id}-error`
  return (
    <div>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder ?? label}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={event => onChange(id, event.target.value)}
        />
        {type === 'password' && (
          <EyeOff
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-secondary"
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-[10px] text-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

function SocialButton({ provider }: { provider: 'Google' | 'Facebook' }) {
  return (
    <Button
      className="h-10 w-full gap-3 text-[13px] leading-4"
      variant="outline"
      type="button"
    >
      {provider === 'Google' ? (
        <GoogleIcon />
      ) : (
        <img alt="" className="size-5" src={facebookIcon} />
      )}
      Continuar com {provider}
    </Button>
  )
}

function GoogleIcon() {
  return (
    <span aria-hidden="true" className="relative block size-5">
      <img alt="" className="absolute bottom-0 left-[1px]" src={googleGreen} />
      <img alt="" className="absolute left-1/2 top-[7px]" src={googleBlue} />
      <img alt="" className="absolute left-0 top-[5px]" src={googleYellow} />
      <img alt="" className="absolute right-0 top-[7px]" src={googleBlueDark} />
      <img alt="" className="absolute left-[1px] top-0" src={googleOrange} />
    </span>
  )
}
