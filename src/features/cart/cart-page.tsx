import { useEffect, useState } from 'react'
import Decimal from 'decimal.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import relatedApe from '@/assets/cart/related-ape.png'
import relatedBaron from '@/assets/cart/related-baron.png'
import relatedGolden from '@/assets/cart/related-golden.png'
import mobileEmeraldApe from '@/assets/cart/mobile/emerald-ape.png'
import mobileVioletNomad from '@/assets/cart/mobile/violet-nomad.png'
import mobileIvoryBaron from '@/assets/cart/mobile/ivory-baron.png'
import mobileGoldenBeat from '@/assets/cart/mobile/golden-beat.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CartApiError, getCartQuote, validateCoupon } from '@/features/cart/cart-api'
import type { CartQuote } from '@/features/cart/cart-api'
import { useCartStore } from '@/features/cart/cart-store'
import type { CartItem } from '@/features/cart/cart-store'
import { subscribeToNftUpdates } from '@/lib/realtime'
import { useAuthStore } from '@/features/auth/auth-store'
import { queryKeys } from '@/lib/query-keys'

const formatEth = (value: string) => `${new Decimal(value).toFixed(2)} ETH`
const suggestions = [
  { image: relatedApe, name: 'Cosmic Bloom #118', price: '1.29 ETH' },
  { image: relatedApe, name: 'Violet Nomad #314', price: '1.39 ETH' },
  { image: relatedBaron, name: 'Ivory Baron #088', price: '1.79 ETH' },
  { image: relatedGolden, name: 'Golden Beat #207', price: '0.99 ETH' },
  { image: relatedGolden, name: 'Golden Signal #160', price: '0.39 ETH' }
]

const displayName = (id: string, name: string) =>
  `${name} ${id === 'emerald-ape-042' ? '#042' : id === 'violet-nomad-314' ? '#314' : '#088'}`

const mobileImages: Record<string, string> = {
  'emerald-ape-042': mobileEmeraldApe,
  'violet-nomad-314': mobileVioletNomad,
  'ivory-baron-088': mobileIvoryBaron,
  'golden-beat-207': mobileGoldenBeat
}

function MobileCart({
  couponText,
  couponMutation,
  couponFeedback,
  coupon,
  isQuoteLoading,
  items,
  navigate,
  quote,
  removeCoupon,
  removeItem,
  setCouponFeedback,
  setCouponText,
  totals,
  updateQuantity
}: {
  coupon: string | null
  couponFeedback: string | null
  couponMutation: { isError: boolean; isPending: boolean; mutate: (code: string) => void }
  couponText: string
  isQuoteLoading: boolean
  items: CartItem[]
  navigate: ReturnType<typeof useNavigate>
  quote: { isError: boolean; isFetching: boolean }
  removeCoupon: () => void
  removeItem: (id: string, editionId: string) => void
  setCouponFeedback: (value: string | null) => void
  setCouponText: (value: string) => void
  totals: CartQuote['totals'] | undefined
  updateQuantity: (id: string, editionId: string, quantity: number) => void
}) {
  return <main className="-mx-4 min-h-screen bg-ink pt-3 sm:hidden">
    <section className="px-7" aria-labelledby="mobile-cart-title">
      <header className="flex h-11 items-center">
        <Link aria-label="Voltar ao mercado" className="grid size-value-35 place-items-center rounded-full bg-surface-card text-text-accent shadow-cart-back focus-visible:outline-2 focus-visible:outline-primary" to="/">
          <span aria-hidden="true" className="text-value-25 leading-none">‹</span>
        </Link>
        <h1 className="ml-value-61 text-value-20 font-bold leading-6 text-foreground" id="mobile-cart-title">Carrinho de NFTs</h1>
      </header>
      {items.length === 0 ? <div className="mt-3 rounded-value-14 bg-surface-card p-6 text-center shadow-cart-card"><p className="text-body-16-bold text-foreground">Seu carrinho está vazio</p><Link className="mt-3 inline-block text-body-14-medium text-text-accent" to="/">Explorar NFTs</Link></div> : <ul className="mt-3 flex flex-col gap-5" aria-label="Itens do carrinho">
        {items.map(item => <li className="relative flex h-value-100 overflow-hidden rounded-value-14 bg-surface-card shadow-cart-card" key={`${item.id}:${item.editionId}`}>
          <img alt={`NFT ${displayName(item.id, item.name)}`} className="size-value-100 shrink-0 object-cover" src={mobileImages[item.id] ?? item.image} />
          <div className="min-w-0 pt-3 pl-value-9">
            <p className="truncate pr-1 text-value-15 font-bold leading-value-18 text-foreground">{displayName(item.id, item.name)}</p>
            <p className="mt-1 text-value-14 leading-4 text-secondary">Edição {item.editionLabel}</p>
            <p className="mt-4 text-value-18 font-bold leading-5 text-text-accent">{formatEth(new Decimal(item.priceEth).mul(item.quantity).toString())}</p>
          </div>
          <div className="absolute right-3 top-value-38 flex items-center gap-2" role="group" aria-label={`Quantidade de ${item.name}, edição ${item.editionLabel}`}>
            <Button aria-label={`Diminuir quantidade de ${item.name}`} className="grid size-6 place-items-center rounded-full bg-primary p-0 text-ink shadow-none focus-visible:outline-2 focus-visible:outline-foreground" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.editionId, item.quantity - 1)} type="button"><Minus className="size-4 stroke-value-3" /></Button>
            <output aria-live="polite" className="w-3 text-center text-value-16 font-bold leading-6 text-foreground">{item.quantity}</output>
            <Button aria-label={`Aumentar quantidade de ${item.name}`} className="grid size-6 place-items-center rounded-full border border-primary bg-surface-card p-0 text-primary shadow-none focus-visible:outline-2 focus-visible:outline-primary" disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.editionId, item.quantity + 1)} type="button" variant="outline"><Plus className="size-4 stroke-value-3" /></Button>
          </div>
          <Button aria-label={`Remover ${item.name} do carrinho`} className="absolute bottom-2 right-3 size-6 rounded-full p-0 text-secondary hover:text-text-accent focus-visible:outline-2 focus-visible:outline-primary" onClick={() => removeItem(item.id, item.editionId)} type="button" variant="ghost"><Trash2 className="size-4" /></Button>
        </li>)}
      </ul>}
    </section>
    <aside aria-labelledby="mobile-wallet-summary-title" className="mt-6 min-h-value-360 rounded-t-value-40 bg-surface-card px-6 pt-6 pb-28">
      <h2 className="sr-only" id="mobile-wallet-summary-title">Resumo do pagamento</h2>
      <label className="sr-only" htmlFor="mobile-coupon">Código promocional</label>
      <div className="flex h-value-50 overflow-hidden rounded-full border border-border bg-ink shadow-cart-coupon">
        <Input className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 text-value-14 text-foreground placeholder:text-secondary focus-visible:ring-0" disabled={couponMutation.isPending} id="mobile-coupon" onChange={event => setCouponText(event.target.value)} placeholder="Código promocional" value={couponText} />
        <Button className="h-full w-value-97 shrink-0 rounded-full bg-primary text-value-15 font-bold text-ink hover:bg-primary-light" disabled={!couponText.trim() || couponMutation.isPending} onClick={() => couponMutation.mutate(couponText)} type="button">Aplicar</Button>
      </div>
      {couponFeedback && <p className={couponMutation.isError ? 'mt-2 text-value-12 text-error' : 'mt-2 text-value-12 text-success'} role="status">{couponFeedback}</p>}
      {quote.isError && <p className="mt-2 text-value-12 text-error" role="alert">Não foi possível atualizar a cotação.</p>}
      {isQuoteLoading ? <div aria-label="Carregando resumo do carrinho" className="mt-7 space-y-4" role="status"><div className="skeleton h-5 rounded" /><div className="skeleton h-5 rounded" /><div className="skeleton h-5 rounded" /><div className="skeleton mt-7 h-6 rounded" /></div> : <><dl className="mt-7 space-y-4 text-value-15 leading-5 text-foreground"><div className="flex justify-between"><dt>Subtotal</dt><dd>{totals ? formatEth(totals.subtotalEth) : '—'}</dd></div><div className="flex justify-between"><dt>Desconto do lançamento</dt><dd>{totals ? `(-) ${formatEth(totals.discountEth)}` : '—'}</dd></div><div className="flex justify-between"><dt>Taxa de rede</dt><dd>{totals ? formatEth(totals.networkFeeEth) : '—'}</dd></div></dl><div className="mt-7 flex justify-between text-value-18 font-bold leading-6 text-foreground"><span>Total</span><span className="text-text-accent">{totals ? formatEth(totals.totalEth) : '—'}</span></div><Link className="mt-4 block text-center text-value-14 text-text-accent" to="/">Continuar explorando</Link></>}
      {coupon && <Button aria-label="Remover cupom" className="mt-2 h-auto p-0 text-value-12 text-secondary hover:text-foreground" onClick={() => { removeCoupon(); setCouponFeedback('Cupom removido.') }} type="button" variant="ghost">Remover cupom</Button>}
      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-card/95 px-6 py-4 backdrop-blur sm:hidden">
        <Button className="h-value-50 w-full rounded-full text-value-15 font-bold" disabled={!items.length || !totals || quote.isFetching || items.some(item => item.quantity <= 0)} onClick={() => void navigate({ to: '/checkout' })} type="button">Conectar e finalizar</Button>
      </footer>
    </aside>
  </main>
}

export function CartPage() {
  const navigate = useNavigate()
  const userId = useAuthStore(state => state.user?.id ?? null)
  const { items, coupon, removeCoupon, removeItem, setCoupon, syncNftUpdate, syncQuote, updateQuantity } = useCartStore()
  const [couponText, setCouponText] = useState('')
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null)
  const [realtimeNotice, setRealtimeNotice] = useState<string | null>(null)
  const cartKey = JSON.stringify({ coupon, items: items.map(({ id, editionId, quantity, priceEth, stock }) => ({ id, editionId, quantity, priceEth, stock })) })
  const quote = useQuery({ queryKey: queryKeys.quote(userId, cartKey), queryFn: ({ signal }) => getCartQuote(items, coupon, signal), retry: false, staleTime: 0 })
  const refetchQuote = quote.refetch

  useEffect(() => { if (quote.data) syncQuote(quote.data.items) }, [quote.data, syncQuote])
  useEffect(() => subscribeToNftUpdates(event => {
    if (!syncNftUpdate(event)) return
    setRealtimeNotice('Um NFT do seu carrinho mudou de preço ou disponibilidade. O resumo foi atualizado.')
    void refetchQuote()
  }), [refetchQuote, syncNftUpdate])

  const couponMutation = useMutation({
    mutationFn: validateCoupon,
    onSuccess: ({ code }) => { setCoupon(code); setCouponText(''); setCouponFeedback(`Cupom ${code} aplicado.`) },
    onError: error => setCouponFeedback(error instanceof CartApiError ? error.message : 'Não foi possível validar o cupom.')
  })
  const totals = quote.data?.totals
  const isQuoteLoading = quote.isLoading && !quote.data

  return <>
    {realtimeNotice && <p className="mx-auto mb-4 max-w-6xl rounded border border-primary bg-surface-card px-4 py-3 text-body-14-medium text-foreground" role="status">{realtimeNotice}</p>}
    <MobileCart coupon={coupon} couponFeedback={couponFeedback} couponMutation={couponMutation} couponText={couponText} isQuoteLoading={isQuoteLoading} items={items} navigate={navigate} quote={quote} removeCoupon={removeCoupon} removeItem={removeItem} setCouponFeedback={setCouponFeedback} setCouponText={setCouponText} totals={totals} updateQuantity={updateQuantity} />
    <main className="-mt-16 hidden flex-col gap-24 sm:flex">
    <section>
      <nav aria-label="Breadcrumb" className="text-body-15-bold-compact text-foreground"><Link to="/">Início</Link> / <span>Mercado</span> / <span aria-current="page">Carrinho</span></nav>
      <div className="mt-3 grid gap-10 xl:grid-cols-cart-layout xl:justify-between xl:gap-0">
        <section aria-labelledby="cart-items-title" className="min-w-0 xl:w-value-782">
          <div className="hidden h-7 grid-cols-cart-items items-start justify-between border-b border-border pb-3 text-body-16-bold-compact text-foreground sm:grid"><h1 id="cart-items-title">NFTs</h1><span>Preço</span><span>Edições</span><span>Total</span><span aria-hidden="true" /></div>
          {items.length === 0 ? <div className="mt-3 rounded-md bg-surface-card p-8 text-center"><h1 id="cart-items-title" className="text-body-16-bold text-foreground">Seu carrinho está vazio</h1><Link className="mt-3 inline-block text-body-14-medium text-text-accent hover:text-primary" to="/">Explorar NFTs</Link></div> : <ul className="mt-3 flex flex-col gap-3" aria-label="Itens do carrinho">
            {items.map(item => <li className="grid min-h-value-70 gap-3 bg-surface-card p-2 sm:grid-cols-cart-items sm:items-center sm:justify-between sm:p-0 sm:pr-6" key={`${item.id}:${item.editionId}`}>
              <div className="flex min-w-0 items-center gap-4"><img alt="" className="size-value-70 shrink-0 rounded-md object-cover" src={item.image} /><div className="min-w-0"><p className="truncate text-body-16-bold-compact text-foreground">{displayName(item.id, item.name)}</p><p className="mt-1 text-body-14-compact text-secondary">ID do token: {item.tokenId}</p>{item.stock === 0 && <p className="mt-1 text-value-10 text-error">Edição indisponível</p>}</div></div>
              <p className="text-body-16-bold-compact text-text-secondary"><span className="sm:hidden">Preço: </span>{formatEth(item.priceEth)}</p>
              <div className="flex items-center gap-3" role="group" aria-label={`Quantidade de ${item.name}, edição ${item.editionLabel}`}><Button aria-label={`Diminuir quantidade de ${item.name}`} className="size-5 rounded-full border-ink bg-primary p-0 text-ink" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.editionId, item.quantity - 1)} type="button" variant="outline"><Minus className="size-3" /></Button><output aria-live="polite" className="w-3 text-center text-value-17 leading-6 text-foreground">{item.quantity}</output><Button aria-label={`Aumentar quantidade de ${item.name}`} className="size-5 rounded-full border-ink bg-primary p-0 text-ink" disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.editionId, item.quantity + 1)} type="button" variant="outline"><Plus className="size-3" /></Button></div>
              <p className="text-body-16-bold-compact text-text-accent"><span className="sm:hidden">Total: </span>{formatEth(new Decimal(item.priceEth).mul(item.quantity).toString())}</p>
              <Button aria-label={`Remover ${item.name} do carrinho`} className="size-6 p-0 text-secondary hover:text-text-accent" onClick={() => removeItem(item.id, item.editionId)} type="button" variant="ghost"><Trash2 className="size-4" /></Button>
            </li>)}
          </ul>}
        </section>
        <aside aria-labelledby="wallet-summary-title" className="min-h-value-388 xl:w-value-332"><h2 id="wallet-summary-title" className="h-7 border-b border-border pb-3 text-body-15-bold-compact text-foreground">Resumo da carteira</h2><label className="mt-6 block text-body-14-bold-compact text-foreground" htmlFor="coupon">Código promocional</label><div className="mt-2 flex h-10 overflow-hidden rounded-md"><Input className="h-10 min-w-0 flex-1 rounded-r-none border-border bg-surface-dark px-2 text-body-14-compact" disabled={couponMutation.isPending} id="coupon" onChange={event => setCouponText(event.target.value)} placeholder="Digite o código promocional..." value={couponText} /><Button className="h-10 w-value-102 shrink-0 rounded-l-none px-1 text-body-14-bold-compact" disabled={!couponText.trim() || couponMutation.isPending} onClick={() => couponMutation.mutate(couponText)} type="button">Aplicar</Button></div>
          {coupon && <div className="mt-2 flex items-center justify-between text-value-10 text-success"><span>{coupon} aplicado</span><Button aria-label="Remover cupom" className="size-4 p-0 text-secondary hover:text-foreground" onClick={() => { removeCoupon(); setCouponFeedback('Cupom removido.') }} type="button" variant="ghost"><X className="size-3" /></Button></div>}
          {couponFeedback && <p className={couponMutation.isError ? 'mt-1 text-value-9 text-error' : 'mt-1 text-value-9 text-success'} role="status">{couponFeedback}</p>}
          {quote.isError && <p className="mt-2 text-value-10 text-error" role="alert">Não foi possível atualizar a cotação. Revise os valores antes de finalizar.</p>}
          {isQuoteLoading ? <div aria-label="Carregando resumo do carrinho" className="mt-6 space-y-3" role="status"><div className="skeleton h-5 rounded" /><div className="skeleton h-5 rounded" /><div className="skeleton h-5 rounded" /><div className="skeleton mt-6 h-6 rounded" /><div className="skeleton mt-6 h-10 rounded" /></div> : <><dl className="mt-6 space-y-3 text-body-14-compact text-foreground"><div className="flex h-5 justify-between"><dt>Subtotal</dt><dd>{totals ? formatEth(totals.subtotalEth) : '—'}</dd></div><div className="flex h-5 justify-between"><dt>Desconto do lançamento</dt><dd>{totals ? `(-) ${formatEth(totals.discountEth)}` : '—'}</dd></div><div><div className="flex h-5 justify-between"><dt>Taxa de rede</dt><dd>{totals ? formatEth(totals.networkFeeEth) : '—'}</dd></div><div className="mt-3 text-right text-value-10 text-text-accent">Cotação da API</div></div></dl>
          <div className="mt-6 flex justify-between text-body-15-bold-compact text-foreground"><span>Total</span><span className="text-text-accent">{totals ? formatEth(totals.totalEth) : '—'}</span></div><Button className="mt-6 h-10 w-full text-body-14-bold-compact" disabled={!items.length || !totals || quote.isFetching || items.some(item => item.quantity <= 0)} onClick={() => void navigate({ to: '/checkout' })} type="button">Conectar e finalizar</Button><Link className="mt-3 block text-center text-body-14-compact text-text-accent hover:text-primary" to="/">Continuar explorando</Link></>}
        </aside>
      </div>
    </section>
    <section aria-labelledby="suggestions-title"><h2 id="suggestions-title" className="h-7 border-b border-border pb-3 text-body-15-bold-compact text-text-accent">Colecionadores também viram</h2><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-cart-suggestions xl:justify-between">{suggestions.map(item => <article className="min-w-0 xl:w-value-219" key={item.name}><img alt="" className="aspect-value-219-255 w-full rounded-md object-cover" src={item.image} /><h3 className="mt-2 text-body-14-compact text-foreground">{item.name}</h3><p className="mt-2 text-body-14-bold-compact text-text-accent">{item.price}</p></article>)}</div><div aria-hidden="true" className="mt-12 flex justify-center gap-2"><span className="size-3 rounded-full border border-primary" /><span className="size-3 rounded-full bg-primary" /><span className="size-3 rounded-full bg-border" /></div></section>
    </main>
  </>
}
