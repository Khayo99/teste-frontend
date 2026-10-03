import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  getProfile,
  getWallets,
  type Profile,
  type Wallet
} from '@/features/account/account-api'
import { getCartQuote } from '@/features/cart/cart-api'
import { useCartStore, type CartItem } from '@/features/cart/cart-store'
import {
  createOrder,
  getOrders,
  type CheckoutDetails,
  type Order
} from '@/features/orders/orders-api'
import { queryKeys } from '@/lib/query-keys'
import { realtimeClient } from '@/lib/realtime'
import { useAuthStore } from '@/features/auth/auth-store'
import modalConfirmationIcon from '@/assets/orders/modal-confirmation.svg'
import modalCloseIcon from '@/assets/orders/modal-close.svg'

const detailsSchema = z.object({
  displayName: z.string().min(2, 'Informe o nome de exibição.'),
  username: z.string().min(3, 'Informe o nome de usuário.'),
  profileName: z.string().min(2, 'Informe o nome do perfil.'),
  network: z.string().min(1, 'Selecione uma rede.'),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{8,}$/, 'Use um endereço 0x válido.'),
  walletType: z.string().min(1, 'Selecione uma carteira.'),
  email: z.email('Informe um e-mail válido.'),
  ens: z.string().min(1, 'Informe o nome ENS.')
})

const blankDetails: CheckoutDetails = {
  displayName: '',
  username: '',
  profileName: '',
  network: '',
  walletAddress: '',
  walletType: '',
  email: '',
  ens: '',
  secondaryAddress: '',
  referralCode: '',
  note: ''
}
const attemptStorageKey = (userId: string) => `kurio.checkout.attempt.${userId}`
const receiptStorageKey = (userId: string, orderId: string) =>
  `kurio.checkout.receipt.${userId}.${orderId}`
const currency = (value?: string) =>
  value ? `${Number(value).toFixed(3)} ETH` : '—'

export function CheckoutPage() {
  const user = useAuthStore(state => state.user!)
  const { items, coupon, removePurchasedQuantity, syncQuote } = useCartStore()
  const client = useQueryClient()
  const profile = useQuery({
    queryKey: queryKeys.profile(user.id),
    queryFn: getProfile,
    staleTime: 60_000
  })
  const wallets = useQuery({
    queryKey: queryKeys.wallets(user.id),
    queryFn: getWallets,
    staleTime: 60_000
  })
  const [details, setDetails] = useState<CheckoutDetails>(blankDetails)
  const [connected, setConnected] = useState(false)
  const [reviewedFingerprint, setReviewedFingerprint] = useState('')
  const [notice, setNotice] = useState('')
  const [attempt, setAttempt] = useState(
    () =>
      localStorage.getItem(attemptStorageKey(user.id)) ?? crypto.randomUUID()
  )
  const [order, setOrder] = useState<Order | null>(null)
  const [receiptItems, setReceiptItems] = useState<typeof items>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [recoveredOrderId, setRecoveredOrderId] = useState('')
  const revision = useMemo(
    () =>
      JSON.stringify(
        items.map(({ id, editionId, quantity, priceEth, stock }) => ({
          id,
          editionId,
          quantity,
          priceEth,
          stock
        }))
      ),
    [items]
  )
  const quote = useQuery({
    queryKey: queryKeys.quote(user.id, `checkout:${revision}:${coupon ?? ''}`),
    queryFn: ({ signal }) => getCartQuote(items, coupon, signal),
    retry: false
  })
  const orders = useQuery({
    queryKey: queryKeys.orders(user.id),
    queryFn: getOrders,
    retry: false,
    staleTime: 0
  })
  const fingerprint = useMemo(
    () =>
      quote.data
        ? JSON.stringify({
            items: quote.data.items,
            coupon: quote.data.coupon,
            totals: quote.data.totals
          })
        : '',
    [quote.data]
  )

  useEffect(() => {
    localStorage.setItem(attemptStorageKey(user.id), attempt)
  }, [attempt, user.id])
  useEffect(() => {
    if (!orders.data || recoveredOrderId) return
    const recovered = orders.data.find(
      candidate => candidate.idempotencyKey === attempt
    )
    if (!recovered) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- recovery is driven by the remote order record.
    setRecoveredOrderId(recovered.id)
    setOrder(recovered)
    if (recovered.status !== 'confirmed') return
    const snapshot = readReceiptSnapshot(user.id, recovered.id)
    setReceiptItems(
      snapshot.length ? snapshot : items.map(item => ({ ...item }))
    )
    setShowConfirmation(true)
    recovered.receipt.items.forEach(line =>
      removePurchasedQuantity(line.id, line.editionId, line.quantity ?? 0)
    )
    localStorage.removeItem(attemptStorageKey(user.id))
  }, [
    attempt,
    items,
    orders.data,
    recoveredOrderId,
    removePurchasedQuantity,
    user.id
  ])
  useEffect(() => {
    if (quote.data) syncQuote(quote.data.items)
  }, [quote.data, syncQuote])
  useEffect(() => {
    if (!profile.data) return
    // The remote profile is the source for the one-time draft seed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetails(current =>
      current.displayName
        ? current
        : fromProfile(profile.data, wallets.data?.[0])
    )
  }, [profile.data, wallets.data])
  useEffect(() => {
    if (reviewedFingerprint && reviewedFingerprint !== fingerprint) {
      // A server-originated quote update intentionally invalidates local review.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReviewedFingerprint('')
      setNotice(
        'A cotação foi atualizada. Revise o novo total antes de confirmar.'
      )
    }
  }, [fingerprint, reviewedFingerprint])
  useEffect(() => {
    const refresh = () => void quote.refetch()
    realtimeClient.on('nft.updated', refresh)
    return () => {
      realtimeClient.off('nft.updated', refresh)
    }
  }, [quote])
  useEffect(() => {
    const update = (event: {
      orderId: string
      userId: string
      status: Order['status']
      version: number
      reason?: string
      transactionReference?: string
    }) => {
      if (event.userId !== user.id) return
      setOrder(current =>
        current?.id === event.orderId && event.version > current.version
          ? { ...current, ...event }
          : current
      )
      void client.invalidateQueries({ queryKey: queryKeys.orders(user.id) })
    }
    realtimeClient.on('order.updated', update)
    return () => {
      realtimeClient.off('order.updated', update)
    }
  }, [client, user.id])

  const submit = useMutation({
    mutationFn: () => {
      const parsed = detailsSchema.safeParse(details)
      if (!parsed.success) throw new Error(parsed.error.issues[0].message)
      if (!connected)
        throw new Error('Conecte a carteira simulada para continuar.')
      if (!quote.data) throw new Error('A cotação atual não está disponível.')
      return createOrder(items, coupon, quote.data, attempt, parsed.data)
    },
    onSuccess: value => {
      setOrder(value)
      if (value.status === 'confirmed') {
        const snapshot = items.map(item => ({ ...item }))
        localStorage.setItem(
          receiptStorageKey(user.id, value.id),
          JSON.stringify(snapshot)
        )
        setReceiptItems(snapshot)
        setShowConfirmation(true)
        value.receipt.items.forEach(line =>
          removePurchasedQuantity(line.id, line.editionId, line.quantity ?? 0)
        )
        localStorage.removeItem(attemptStorageKey(user.id))
      }
    },
    onError: async () => {
      // A transport timeout can occur after the simulated service has accepted the idempotent attempt.
      try {
        const recovered = (await getOrders()).find(
          candidate => candidate.idempotencyKey === attempt
        )
        if (recovered) setOrder(recovered)
      } catch {
        // The existing error state remains actionable when order recovery is unavailable.
      }
    }
  })

  if (order && (order.status !== 'confirmed' || !showConfirmation))
    return (
      <OrderState
        order={order}
        onRetry={() => {
          setAttempt(crypto.randomUUID())
          setOrder(null)
        }}
      />
    )
  const formReady = detailsSchema.safeParse(details).success
  const reviewQuote = () => {
    if (!quote.data) return
    setReviewedFingerprint(fingerprint)
    setNotice('Cotação revisada. Agora confirme a compra para enviar o pedido.')
  }
  return (
    <main className="checkout-page" aria-labelledby="checkout-title">
      <p className="checkout-breadcrumb">Início / Mercado / Pagamento</p>
      <div className="checkout-grid">
        <section>
          <h1 id="checkout-title" className="text-body-17-bold">
            Perfil do colecionador
          </h1>
          <form
            className="checkout-form"
            onSubmit={event => {
              event.preventDefault()
              reviewQuote()
              submit.mutate()
            }}
            noValidate
          >
            <div className="checkout-fields">
              <Field
                label="Nome de exibição"
                required
                value={details.displayName}
                onChange={value =>
                  setDetails({ ...details, displayName: value })
                }
              />
              <Field
                label="Nome de usuário"
                required
                value={details.username}
                onChange={value => setDetails({ ...details, username: value })}
              />
              <Choice
                label="Rede"
                required
                value={details.network}
                onChange={value => setDetails({ ...details, network: value })}
                options={['Ethereum', 'Polygon', 'Solana']}
                placeholder="Selecione uma rede"
              />
              <Field
                label="Nome do perfil"
                required
                value={details.profileName}
                onChange={value =>
                  setDetails({ ...details, profileName: value })
                }
              />
              <Field
                label="Endereço da carteira"
                required
                placeholder="Endereço 0x da carteira"
                value={details.walletAddress}
                onChange={value =>
                  setDetails({ ...details, walletAddress: value })
                }
              />
              <Field
                label="ENS ou carteira secundária"
                value={details.secondaryAddress ?? ''}
                onChange={value =>
                  setDetails({ ...details, secondaryAddress: value })
                }
              />
              <Choice
                label="Tipo de carteira"
                required
                value={details.walletType}
                onChange={value =>
                  setDetails({ ...details, walletType: value })
                }
                options={walletOptions(wallets.data)}
                placeholder="Selecione uma carteira"
              />
              <Field
                label="Código de indicação"
                value={details.referralCode ?? ''}
                onChange={value =>
                  setDetails({ ...details, referralCode: value })
                }
              />
              <Field
                label="E-mail"
                required
                type="email"
                value={details.email}
                onChange={value => setDetails({ ...details, email: value })}
              />
              <Field
                label="Nome ENS"
                required
                prefix=".eth"
                value={details.ens}
                onChange={value => setDetails({ ...details, ens: value })}
              />
            </div>
            <label className="checkout-other">
              <input
                type="checkbox"
                checked={connected}
                onChange={event => {
                  setConnected(event.target.checked)
                  setNotice(
                    event.target.checked
                      ? 'Carteira simulada conectada.'
                      : 'Carteira desconectada.'
                  )
                }}
              />{' '}
              Usar outra carteira?
            </label>
            <label className="checkout-label" htmlFor="collector-note">
              Observação do colecionador (opcional)
            </label>
            <textarea
              id="collector-note"
              className="checkout-note"
              value={details.note}
              onChange={event =>
                setDetails({ ...details, note: event.target.value })
              }
            />
          </form>
        </section>
        <aside className="checkout-summary" aria-label="Resumo do pedido">
          <h2 className="text-body-17-bold">Seus NFTs</h2>
          <p className="checkout-subtotal-label">Subtotal</p>
          {quote.isLoading ? (
            <ReceiptSkeleton />
          ) : (
            items.map(item => (
              <ReceiptLine key={`${item.id}-${item.editionId}`} item={item} />
            ))
          )}
          <p className="checkout-coupon">
            Tem um código promocional? Aplique aqui
          </p>
          <Totals quote={quote.data} />
          <h2 className="checkout-wallet-title">Carteira e rede</h2>
          <div
            className="checkout-wallets"
            role="radiogroup"
            aria-label="Carteira compatível"
          >
            {[
              'METAMASK · WALLETCONNECT · COINBASE',
              'MetaMask',
              'Coinbase Wallet'
            ].map((name, index) => (
              <label key={name} className="checkout-wallet">
                <input
                  type="radio"
                  name="wallet"
                  checked={
                    connected &&
                    (index === 1 || (index === 0 && !details.walletType))
                  }
                  onChange={() => {
                    setConnected(true)
                    if (index > 0) setDetails({ ...details, walletType: name })
                  }}
                />{' '}
                {name}
              </label>
            ))}
          </div>
          <button
            type="button"
            className="checkout-wallet-refuse"
            onClick={() => {
              setConnected(false)
              setNotice(
                'A carteira simulada recusou a conexão. Selecione uma carteira para tentar novamente.'
              )
            }}
          >
            Simular recusa de conexão
          </button>
          <Button
            className="checkout-confirm"
            type="button"
            onClick={() => {
              reviewQuote()
              submit.mutate()
            }}
            disabled={
              !items.length ||
              quote.isFetching ||
              !quote.data ||
              !connected ||
              !formReady
            }
          >
            {submit.isPending ? 'Enviando…' : 'Confirmar compra'}
          </Button>
          {(quote.isError || submit.isError) && (
            <p role="alert" className="checkout-error">
              {quote.isError
                ? 'A cotação não pôde ser atualizada. Tente novamente.'
                : (submit.error?.message ??
                  'Não foi possível confirmar a compra.')}
            </p>
          )}
          {notice && (
            <p role="status" className="checkout-status">
              {notice}
            </p>
          )}
        </aside>
      </div>
      {order?.status === 'confirmed' && showConfirmation && (
        <OrderConfirmationModal
          order={order}
          items={receiptItems}
          onClose={() => setShowConfirmation(false)}
          onExplore={() =>
            setNotice('A referência da transação é simulada neste ambiente.')
          }
        />
      )}
    </main>
  )
}

function fromProfile(profile: Profile, wallet?: Wallet): CheckoutDetails {
  return {
    ...blankDetails,
    displayName: profile.displayName,
    username: profile.username,
    profileName: wallet?.profileName ?? profile.displayName,
    network: wallet?.network ?? 'Ethereum',
    walletAddress: wallet?.address ?? '0x8aC4bE7d912a0000',
    walletType: wallet?.type ?? 'MetaMask',
    email: profile.email,
    ens: profile.ens || profile.username,
    secondaryAddress: wallet?.secondaryAddress ?? '',
    referralCode: wallet?.referralCode ?? ''
  }
}
function walletOptions(wallets?: Wallet[]) {
  return [
    ...new Set([
      ...(wallets?.map(wallet => wallet.type) ?? []),
      'MetaMask',
      'Coinbase Wallet'
    ])
  ]
}
function Field({
  label,
  required,
  prefix,
  onChange,
  ...props
}: {
  label: string
  required?: boolean
  prefix?: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  const id = `checkout-${label.replaceAll(' ', '-').toLowerCase()}`
  return (
    <div>
      <label className="checkout-label" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true">*</span>}
      </label>
      <div className="checkout-input-wrap">
        <Input
          id={id}
          {...props}
          onChange={event => onChange(event.target.value)}
        />
        {prefix && <span className="checkout-prefix">{prefix}</span>}
      </div>
    </div>
  )
}
function Choice({
  label,
  required,
  value,
  onChange,
  options,
  placeholder
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
}) {
  const id = `checkout-${label.replaceAll(' ', '-').toLowerCase()}`
  return (
    <div>
      <label className="checkout-label" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true">*</span>}
      </label>
      <Select
        id={id}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="checkout-select"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  )
}
function ReceiptLine({
  item
}: {
  item: {
    image: string
    name: string
    tokenId: string
    quantity: number
    priceEth: string
  }
}) {
  return (
    <article className="receipt-line">
      <img src={item.image} alt={`Arte ${item.name}`} />
      <div>
        <strong>{item.name}</strong>
        <small>ID do token: {item.tokenId}</small>
      </div>
      <span>(x {item.quantity})</span>
      <b>{currency((Number(item.priceEth) * item.quantity).toFixed(18))}</b>
    </article>
  )
}
function ReceiptSkeleton() {
  return (
    <div className="receipt-skeleton" aria-label="Carregando resumo do pedido">
      <span />
      <span />
      <span />
    </div>
  )
}
function Totals({
  quote
}: {
  quote?: {
    totals: {
      subtotalEth: string
      discountEth: string
      networkFeeEth: string
      totalEth: string
    }
  }
}) {
  return (
    <dl className="checkout-totals">
      <div>
        <dt>Subtotal</dt>
        <dd>{currency(quote?.totals.subtotalEth)}</dd>
      </div>
      <div>
        <dt>Desconto do lançamento</dt>
        <dd>(-) {currency(quote?.totals.discountEth)}</dd>
      </div>
      <div>
        <dt>Taxa de rede</dt>
        <dd>{currency(quote?.totals.networkFeeEth)}</dd>
      </div>
      <div className="checkout-total">
        <dt>Total</dt>
        <dd>{currency(quote?.totals.totalEth)}</dd>
      </div>
    </dl>
  )
}
function receiptCurrency(value: number | string) {
  return `${Number(value).toFixed(3)} ETH`
}
function readReceiptSnapshot(userId: string, orderId: string): CartItem[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(receiptStorageKey(userId, orderId)) ?? '[]'
    )
    return Array.isArray(value) ? (value as CartItem[]) : []
  } catch {
    return []
  }
}
function receiptDate(value: string) {
  const date = new Date(value)
  return `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString('en-US', { month: 'short' })}, ${date.getFullYear()}`
}
function OrderConfirmationModal({
  order,
  items,
  onClose,
  onExplore
}: {
  order: Order
  items: Array<{
    id: string
    editionId: string
    image: string
    name: string
    tokenId: string
    quantity: number
    priceEth: string
  }>
  onClose: () => void
  onExplore: () => void
}) {
  const closeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeButton.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])
  const transaction = order.transactionReference ?? order.id
  return (
    <div className="order-confirmation-backdrop">
      <section
        className="order-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-confirmation-title"
      >
        <button
          ref={closeButton}
          type="button"
          className="order-confirmation-close"
          aria-label="Fechar confirmação"
          onClick={onClose}
        >
          <img src={modalCloseIcon} alt="" />
        </button>
        <header className="order-confirmation-header">
          <img
            className="order-confirmation-icon"
            src={modalConfirmationIcon}
            alt=""
          />
          <h1 id="order-confirmation-title">
            Seus NFTs agora estão na sua carteira
          </h1>
        </header>
        <div className="order-confirmation-meta">
          <span>
            ID da transação
            <br />
            <strong>
              {transaction.slice(0, 6)}…{transaction.slice(-4)}
            </strong>
          </span>
          <span>
            Data
            <br />
            <strong>{receiptDate(order.createdAt)}</strong>
          </span>
          <span>
            Total
            <br />
            <strong>{receiptCurrency(order.receipt.totals.totalEth)}</strong>
          </span>
          <span>
            Wallet
            <br />
            <strong>MetaMask</strong>
          </span>
        </div>
        <div className="order-confirmation-details">
          <h2>Detalhes da transação</h2>
          <div className="order-confirmation-columns">
            <span>NFTs</span>
            <span>Edições</span>
            <span>Subtotal</span>
          </div>
          <div className="order-confirmation-items">
            {items.map(item => {
              const quoted = order.receipt.items.find(
                line => line.id === item.id && line.editionId === item.editionId
              )
              return (
                <article
                  key={`${item.id}-${item.editionId}`}
                  className="order-confirmation-item"
                >
                  <img src={item.image} alt={`Arte ${item.name}`} />
                  <div>
                    <strong>{item.name}</strong>
                    <small>ID do token: {item.tokenId}</small>
                  </div>
                  <span>x {quoted?.quantity ?? item.quantity}</span>
                  <b>
                    {receiptCurrency(
                      Number(quoted?.priceEth ?? item.priceEth) *
                        (quoted?.quantity ?? item.quantity)
                    )}
                  </b>
                </article>
              )
            })}
          </div>
          <dl className="order-confirmation-totals">
            <div>
              <dt>Taxa de rede</dt>
              <dd>{receiptCurrency(order.receipt.totals.networkFeeEth)}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{receiptCurrency(order.receipt.totals.totalEth)}</dd>
            </div>
          </dl>
        </div>
        <footer className="order-confirmation-footer">
          <p>
            Transação confirmada na Ethereum. Acompanhe os detalhes pelo
            explorador.
          </p>
          <Button type="button" onClick={onExplore}>
            Ver no Etherscan
          </Button>
        </footer>
      </section>
    </div>
  )
}
function OrderState({ order, onRetry }: { order: Order; onRetry: () => void }) {
  const confirmed = order.status === 'confirmed'
  const title = confirmed
    ? 'Pedido confirmado'
    : order.status === 'declined'
      ? 'Pagamento recusado'
      : 'Pedido pendente'
  const description =
    order.reason ??
    (confirmed
      ? 'Sua transação simulada foi confirmada.'
      : 'Estamos recuperando o status da sua compra.')

  return (
    <main className="checkout-result" aria-labelledby="checkout-result-title">
      <h1 id="checkout-result-title">{title}</h1>
      <p className="checkout-result-description">{description}</p>
      <dl className="checkout-result-identifiers">
        <div>
          <dt>Pedido</dt>
          <dd>{order.id}</dd>
        </div>
        {order.transactionReference && (
          <div>
            <dt>Transação</dt>
            <dd>{order.transactionReference}</dd>
          </div>
        )}
      </dl>
      <Totals quote={order.receipt} />
      {confirmed ? (
        <Link to="/orders" className="checkout-result-link">
          Ver pedidos
        </Link>
      ) : (
        <Button onClick={onRetry}>Tentar novamente</Button>
      )}
    </main>
  )
}
