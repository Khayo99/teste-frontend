import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { EyeOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { login, register, type AuthApiError } from './api/auth-api'
import { useAuthStore } from './auth-store'
import { loginSchema, registerSchema } from './lib/auth-validation'
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
        className="auth-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-6 sm:py-8"
        role="presentation"
        onMouseDown={event => {
          if (event.target === event.currentTarget) close()
        }}
      >
        <section
          className="auth-card relative flex w-full max-w-[365px] flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
        >
          {onClose && (
            <Button
              aria-label="Fechar autenticação"
              className="auth-close absolute right-3 top-3 z-10 grid size-7 place-items-center p-0"
              variant="ghost"
              type="button"
              onClick={close}
            >
              <X className="size-[18px]" />
            </Button>
          )}
          <div className="auth-header shrink-0 text-center">
            <p className="auth-logo" aria-label="Kurio">KURIO</p>
            <h1 id="auth-title" className="sr-only">
              {isRegister ? 'Criar conta' : 'Entrar'}
            </h1>
            <p className="auth-heading">
              {isRegister
                ? 'Criar perfil de colecionador'
                : 'Entrar'}
            </p>
          </div>
          <form
            className="auth-form"
            onSubmit={event => {
              event.preventDefault()
              mutation.mutate()
            }}
            noValidate
          >
            {errors.form && (
              <div
                role="alert"
                className="auth-error"
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
                className="auth-forgot block h-auto w-full p-0 text-right hover:underline"
                variant="ghost"
                type="button"
              >
                Esqueceu a senha?
              </Button>
            )}
            <Button
              className="auth-submit w-full font-bold"
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
          <div className="auth-socials">
            <div className="auth-divider">
              <span />
              <p>
                Ou continue com
              </p>
              <span />
            </div>
            <div className="auth-social-buttons">
              <SocialButton provider="Google" />
              <SocialButton provider="Facebook" />
            </div>
          </div>
          <p className="auth-switch">
            {isRegister ? 'Já tem uma conta? ' : 'Novo na Kurio? '}
            <Link to={isRegister ? '/login' : '/register'} search={{ returnTo: search.returnTo }}>
              {isRegister ? 'Entre' : 'Crie uma conta'}
            </Link>
          </p>
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
          className="auth-input"
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
      className="auth-social-button w-full gap-3"
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
    <svg aria-hidden="true" className="size-5" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6L40.1 6.2C35.93 2.3 30.42 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.01 6.22C12.46 13.72 17.78 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.64-.15-3.22-.42-4.73H24v9.2h12.91c-.58 2.96-2.26 5.47-4.8 7.15l7.73 6c4.51-4.18 7.14-10.36 7.14-17.62Z" />
      <path fill="#FBBC05" d="M10.57 28.56A14.45 14.45 0 0 1 9.8 24c0-1.58.27-3.11.77-4.56l-8.01-6.22A23.94 23.94 0 0 0 0 24c0 3.86.92 7.53 2.56 10.78l8.01-6.22Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.73-6c-2.13 1.43-4.86 2.28-8.17 2.28-6.22 0-11.54-4.22-13.43-9.91l-8.01 6.22C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  )
}
