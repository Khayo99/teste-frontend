import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  EyeOff,
  LogOut,
  MapPin,
  ShoppingCart,
  UserRound,
  Heart,
  Activity,
  Download,
  TriangleAlert,
  ImagePlus
} from 'lucide-react'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuthStore } from '@/features/auth/auth-store'
import { logout } from '@/features/auth/api/auth-api'
import {
  changePassword,
  getProfile,
  getWallets,
  saveProfile,
  saveWallet,
  type Profile,
  type Wallet
} from './account-api'
import { queryKeys } from '@/lib/query-keys'

const profileSchema = z.object({
  displayName: z.string().min(2, 'Informe seu nome de exibição.'),
  username: z.string().min(3, 'Use ao menos 3 caracteres.'),
  email: z.email('Informe um e-mail válido.'),
  ens: z.string().optional(),
  walletAlias: z.string().min(2, 'Informe o apelido da carteira.')
})
const walletSchema = z.object({
  displayName: z.string().min(2, 'Informe um nome.'),
  alias: z.string().min(2, 'Informe o apelido.'),
  network: z.string().min(1, 'Selecione uma rede.'),
  profileName: z.string().min(2, 'Informe o nome do perfil.'),
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{8,}$/, 'Use um endereço 0x válido.'),
  type: z.string().min(1, 'Selecione o tipo.'),
  referralCode: z.string().min(1, 'Informe o código de indicação.'),
  email: z.email('Informe um e-mail válido.'),
  ens: z.string().min(1, 'Informe o nome ENS.')
})
const blankWallet: Wallet = {
  id: 'primary',
  displayName: '',
  alias: '',
  network: '',
  profileName: '',
  address: '',
  secondaryAddress: '',
  type: '',
  referralCode: '',
  email: '',
  ens: ''
}

export function AccountPage({ section }: { section: 'profile' | 'wallets' }) {
  return (
    <section className="-mt-16 min-h-value-820 pb-16">
      <div className="grid gap-7 xl:grid-cols-account">
        <AccountSidebar section={section} />
        {section === 'profile' ? <ProfileForm /> : <WalletsForm />}
      </div>
    </section>
  )
}

function AccountSidebar({ section }: { section: 'profile' | 'wallets' }) {
  const { clear, token } = useAuthStore()
  const navigate = useNavigate()
  const nav = [
    {
      label: 'Dados do perfil',
      icon: UserRound,
      to: '/profile' as const,
      active: section === 'profile'
    },
    {
      label: 'Carteiras',
      icon: MapPin,
      to: '/wallets' as const,
      active: section === 'wallets'
    }
  ]
  const inactive = [
    { label: 'Atividade', icon: ShoppingCart },
    { label: 'Lista de interesse', icon: Heart },
    { label: 'Ofertas', icon: Activity },
    { label: 'Arquivos baixados', icon: Download },
    { label: 'Suporte', icon: TriangleAlert }
  ]
  return (
    <aside className="h-fit bg-surface-card py-2">
      <h2 className="px-3 py-2 text-body-18-bold-compact">Meu perfil</h2>
      {nav.map(({ label, icon: Icon, to, active }) => (
        <Link
          key={label}
          to={to}
          className={`flex h-value-45 items-center gap-4 border-l-6 px-4 text-body-15 ${active ? 'border-primary text-text-accent' : 'border-transparent text-text-accent hover:bg-surface-raised'}`}
        >
          <Icon className="size-5" />
          {label}
        </Link>
      ))}
      {inactive.map(({ label, icon: Icon }) => (
        <span
          key={label}
          className="flex h-value-45 items-center gap-3 px-value-22 text-body-15 text-text-accent"
        >
          <Icon className="size-value-18" />
          {label}
        </span>
      ))}
      <div className="mt-1 border-t border-border" />
      <Button
        variant="ghost"
        type="button"
        className="mt-1 flex h-10 w-full justify-start gap-2 px-4 text-body-15-bold-list"
        onClick={() => {
          const currentToken = token
          void navigate({ to: '/' }).then(() => {
            clear()
            if (currentToken) void logout(currentToken).catch(() => undefined)
          })
        }}
      >
        <LogOut className="size-5" />
        Sair
      </Button>
    </aside>
  )
}

function ProfileForm() {
  const queryClient = useQueryClient()
  const { updateUser, user } = useAuthStore()
  const profile = useQuery({
    queryKey: queryKeys.profile(user!.id),
    queryFn: getProfile,
    staleTime: 60_000
  })
  const [values, setValues] = useState<Profile | null>(null)
  const [password, setPassword] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  })
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')
  const avatarInput = useRef<HTMLInputElement>(null)
  const form =
    values ??
    (profile.data
      ? {
          ...profile.data,
          walletAlias: profile.data.walletAlias || 'Carteira principal'
        }
      : undefined)
  const update = (key: keyof Profile, value: string) =>
    setValues({
      ...(form ?? {
        displayName: '',
        username: '',
        email: '',
        ens: '',
        walletAlias: ''
      }),
      [key]: value
    })
  const save = useMutation({
    mutationFn: async ({
      profile: data,
      password: passwordValues
    }: {
      profile: Profile
      password: typeof password
    }) => {
      const parsed = profileSchema.safeParse(data)
      if (!parsed.success) throw new Error(parsed.error.issues[0].message)
      const changingPassword = Object.values(passwordValues).some(Boolean)
      if (changingPassword) {
        if (!passwordValues.currentPassword)
          throw new Error('Informe a senha atual para alterá-la.')
        if (passwordValues.password.length < 8)
          throw new Error('A nova senha deve ter pelo menos 8 caracteres.')
        if (passwordValues.password !== passwordValues.confirmPassword)
          throw new Error('As senhas não coincidem.')
        await changePassword(passwordValues)
      }
      return saveProfile(data)
    },
    onMutate: () => {
      setFormError('')
      setNotice('')
    },
    onSuccess: data => {
      updateUser(data.user)
      void queryClient.invalidateQueries({
        queryKey: queryKeys.profile(user!.id)
      })
      setValues(data.profile)
      setPassword({ currentPassword: '', password: '', confirmPassword: '' })
      setNotice('Perfil salvo com sucesso.')
    },
    onError: error => setFormError(error.message)
  })
  if (!form) return <FormSkeleton />
  return (
    <main className="min-w-0">
      <h1 className="text-body-16-bold">Perfil do colecionador</h1>
      {formError && (
        <p
          role="alert"
          className="mt-4 max-w-value-862 rounded border border-error bg-error/10 p-3 text-sm text-error"
        >
          {formError}
        </p>
      )}
      <form
        className="mt-8 max-w-value-862"
        onSubmit={e => {
          e.preventDefault()
          save.mutate({ profile: form, password })
        }}
        noValidate
      >
        <div className="grid gap-x-7 gap-y-7 md:grid-cols-2">
          <Field
            label="Nome de exibição"
            required
            value={form.displayName}
            onChange={v => update('displayName', v)}
          />
          <Field
            label="Nome de usuário"
            required
            value={form.username}
            onChange={v => update('username', v)}
          />
          <Field
            label="E-mail"
            required
            type="email"
            value={form.email}
            onChange={v => update('email', v)}
          />
          <Field
            label="Nome ENS"
            required
            value={form.ens}
            prefix=".eth"
            onChange={v => update('ens', v)}
          />
          <Field
            label="Apelido da carteira"
            required
            value={form.walletAlias}
            onChange={v => update('walletAlias', v)}
          />
          <div>
            <label className="mb-2 block text-body-14-compact">Avatar</label>
            <div className="flex items-center gap-5">
              <span className="grid size-value-50 place-items-center overflow-hidden rounded-full border border-border bg-surface-raised text-primary">
                {form.avatar ? (
                  <img
                    src={form.avatar}
                    alt="Pré-visualização do avatar"
                    className="size-full object-cover"
                  />
                ) : (
                  <ImagePlus className="size-6" />
                )}
              </span>
              <input
                ref={avatarInput}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                aria-label="Selecionar avatar"
                onChange={event => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => update('avatar', String(reader.result))
                  reader.readAsDataURL(file)
                }}
              />
              <Button
                type="button"
                className="h-10 px-6 text-body-14-bold-compact"
                onClick={() => avatarInput.current?.click()}
              >
                Alterar
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 px-0 text-body-14-compact"
                disabled={!form.avatar}
                onClick={() => update('avatar', '')}
              >
                Remover
              </Button>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              PNG, JPG ou WebP.
            </p>
          </div>
        </div>
        <PasswordFields
          values={password}
          onChange={(key, value) =>
            setPassword(current => ({ ...current, [key]: value }))
          }
        />
        <div className="mt-8 flex items-center gap-4">
          <Button
            className="h-10 w-value-131 text-body-14-bold-compact text-ink"
            type="submit"
            disabled={save.isPending}
          >
            {save.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
          {notice && (
            <p role="status" className="text-sm text-success">
              {notice}
            </p>
          )}
        </div>
      </form>
    </main>
  )
}

function PasswordFields({
  values,
  onChange
}: {
  values: Record<string, string>
  onChange: (key: string, value: string) => void
}) {
  const [visible, setVisible] = useState(false)
  return (
    <section className="mt-8 max-w-value-417">
      <h2 className="text-body-16-bold">Alterar senha</h2>
      <div className="mt-6 space-y-5">
        {[
          ['currentPassword', 'Senha atual'],
          ['password', 'Nova senha'],
          ['confirmPassword', 'Confirmar nova senha']
        ].map(([key, label]) => (
          <div key={key}>
            <label className="mb-2 block text-body-14-compact" htmlFor={key}>
              {label}
            </label>
            <div className="relative">
              <Input
                id={key}
                type={visible ? 'text' : 'password'}
                value={values[key]}
                onChange={e => onChange(key, e.target.value)}
              />
              <button
                aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary"
              >
                <EyeOff className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function WalletsForm() {
  const client = useQueryClient()
  const userId = useAuthStore(state => state.user!.id)
  const wallets = useQuery({
    queryKey: queryKeys.wallets(userId),
    queryFn: getWallets,
    staleTime: 60_000
  })
  const [values, setValues] = useState<Wallet | null>(null)
  const [position, setPosition] = useState<'primary' | 'secondary'>('primary')
  const [notice, setNotice] = useState('')
  const form = values ?? wallets.data?.find(wallet => wallet.id === position) ?? { ...blankWallet, id: position }
  const update = (key: keyof Wallet, value: string) =>
    setValues({ ...form, [key]: value })
  const save = useMutation({
    mutationFn: (data: Wallet) => {
      const parsed = walletSchema.safeParse(data)
      if (!parsed.success) throw new Error(parsed.error.issues[0].message)
      if (data.id === 'secondary' && wallets.data?.some(wallet => wallet.id === 'primary' && wallet.address === data.address))
        throw new Error('A carteira secundária precisa ter um endereço diferente.')
      return saveWallet(data)
    },
    onSuccess: wallet => {
      setValues(wallet)
      void client.invalidateQueries({ queryKey: queryKeys.wallets(userId) })
      setNotice('Carteira salva com sucesso.')
    }
  })
  return (
    <main className="min-w-0">
      <div className="flex max-w-value-862 items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-body-17-bold">Carteira {position === 'primary' ? 'principal' : 'secundária'}</h1>
          <p className="text-body-14-compact text-text-secondary">
            Estas carteiras ficam disponíveis no pagamento e para receber NFTs
            comprados.
          </p>
        </div>
        <Button
          variant="ghost"
          type="button"
          className="h-4 px-0 text-body-16-medium"
          onClick={() => { setPosition('secondary'); setValues(wallets.data?.find(wallet => wallet.id === 'secondary') ?? { ...form, id: 'secondary', alias: '' }) }}
        >
          Adicionar
        </Button>
      </div>
      <form
        className="mt-8 max-w-value-862"
        onSubmit={e => {
          e.preventDefault()
          save.mutate(form)
        }}
        noValidate
      >
        <div className="grid grid-cols-1 gap-x-7 gap-y-6 md:grid-cols-2">
          <Field
            label="Nome de exibição"
            required
            value={form.displayName}
            onChange={v => update('displayName', v)}
          />
          <Field
            label="Apelido da carteira"
            required
            value={form.alias}
            onChange={v => update('alias', v)}
          />
          <SelectField
            label="Rede"
            required
            value={form.network}
            options={['Ethereum', 'Polygon', 'Arbitrum']}
            onChange={v => update('network', v)}
          />
          <Field
            label="Nome do perfil"
            required
            value={form.profileName}
            onChange={v => update('profileName', v)}
          />
          <Field
            label="Endereço da carteira"
            required
            placeholder="Endereço 0x da carteira"
            value={form.address}
            onChange={v => update('address', v)}
          />
          <Field
            label=""
            placeholder="ENS ou carteira secundária (opcional)"
            value={form.secondaryAddress ?? ''}
            onChange={v => update('secondaryAddress', v)}
          />
          <SelectField
            label="Tipo de carteira"
            required
            value={form.type}
            options={['MetaMask', 'Coinbase Wallet', 'WalletConnect']}
            onChange={v => update('type', v)}
          />
          <Field
            label="Código de indicação"
            required
            value={form.referralCode}
            onChange={v => update('referralCode', v)}
          />
          <Field
            label="E-mail"
            required
            type="email"
            value={form.email}
            onChange={v => update('email', v)}
          />
          <Field
            label="Nome ENS"
            required
            prefix=".eth"
            value={form.ens}
            onChange={v => update('ens', v)}
          />
        </div>
        <div className="mt-8 flex gap-4">
          <Button
            type="submit"
            className="h-10 text-body-14-bold-compact text-ink"
            disabled={save.isPending}
          >
            {save.isPending ? 'Salvando…' : 'Salvar carteira'}
          </Button>
          {notice && (
            <p role="status" className="self-center text-sm text-success">
              {notice}
            </p>
          )}
          {save.error && (
            <p role="alert" className="self-center text-sm text-error">
              {save.error.message}
            </p>
          )}
        </div>
      </form>
      <div className="mt-8 max-w-value-862">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-body-18-bold-compact">Carteira secundária</h2>
            <p className="mt-2 text-body-14-compact text-text-secondary">
              {wallets.data?.some(wallet => wallet.id === 'secondary') ? 'Carteira secundária cadastrada.' : 'Você ainda não adicionou uma carteira secundária.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="h-4 gap-2 px-0 text-body-15-medium"
              type="button"
              onClick={() => setValues({ ...form, id: 'secondary', address: '', alias: `${form.alias} secundária` })}
            >
              <span className="size-4 rounded-full border-2 border-primary" />
              Igual à carteira principal
            </Button>
            <Button variant="ghost" type="button" className="h-4 px-0 text-body-16-medium" onClick={() => { setPosition('secondary'); setValues(wallets.data?.find(wallet => wallet.id === 'secondary') ?? { ...form, id: 'secondary', alias: '' }) }}>
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

function Field({
  label,
  required,
  value,
  onChange,
  type = 'text',
  placeholder,
  prefix
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  prefix?: string
}) {
  const id = label
    ? `account-${label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')}`
    : undefined
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-2 block text-body-14-compact">
          {label}
          {required && <span className="ml-1 text-text-coral">*</span>}
        </label>
      )}
      <div className={prefix ? 'flex gap-2' : ''}>
        {prefix && (
          <span className="flex h-10 items-center rounded-value-3 border border-border px-3 text-sm">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          className="rounded-value-3"
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
function SelectField({
  label,
  required,
  value,
  options,
  onChange
}: {
  label: string
  required?: boolean
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const id = `account-${label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')}`
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-body-14-compact">
        {label}
        {required && <span className="ml-1 text-text-coral">*</span>}
      </label>
      <Select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-10 w-full rounded-value-3 border border-border px-3 text-sm text-text-secondary"
      >
        <option value="">Selecione uma {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option}>{option}</option>
        ))}
      </Select>
    </div>
  )
}
function FormSkeleton() {
  return (
    <div
      className="h-value-600 animate-pulse rounded bg-surface-card"
      aria-label="Carregando perfil"
    />
  )
}
