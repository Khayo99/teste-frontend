import { useEffect, useState } from 'react'
import Decimal from 'decimal.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import relatedApe from '@/assets/cart/related-ape.png'
import relatedBaron from '@/assets/cart/related-baron.png'
import relatedGolden from '@/assets/cart/related-golden.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CartApiError, getCartQuote, validateCoupon } from '@/features/cart/cart-api'
import { useCartStore } from '@/features/cart/cart-store'
import { realtimeClient } from '@/lib/realtime'
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

export function CartPage() {
  const navigate = useNavigate()
  const userId = useAuthStore(state => state.user?.id ?? null)
  const { items, coupon, removeCoupon, removeItem, setCoupon, syncQuote, updateQuantity } = useCartStore()
  const [couponText, setCouponText] = useState('')
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null)
  const cartKey = JSON.stringify({ coupon, items: items.map(({ id, editionId, quantity, priceEth, stock }) => ({ id, editionId, quantity, priceEth, stock })) })
  const quote = useQuery({ queryKey: queryKeys.quote(userId, cartKey), queryFn: ({ signal }) => getCartQuote(items, coupon, signal), retry: false, staleTime: 0 })
  const refetchQuote = quote.refetch

  useEffect(() => { if (quote.data) syncQuote(quote.data.items) }, [quote.data, syncQuote])
  useEffect(() => {
    const refresh = () => { void refetchQuote() }
    realtimeClient.on('cart:quote', refresh)
    realtimeClient.on('nft:inventory', refresh)
    return () => { realtimeClient.off('cart:quote', refresh); realtimeClient.off('nft:inventory', refresh) }
  }, [refetchQuote])

  const couponMutation = useMutation({
    mutationFn: validateCoupon,
    onSuccess: ({ code }) => { setCoupon(code); setCouponText(''); setCouponFeedback(`Cupom ${code} aplicado.`) },
    onError: error => setCouponFeedback(error instanceof CartApiError ? error.message : 'Não foi possível validar o cupom.')
  })
  const totals = quote.data?.totals

  return <main className="-mt-16 flex flex-col gap-24">
    <section>
      <nav aria-label="Breadcrumb" className="text-body-15-bold-compact text-foreground"><Link to="/">Início</Link> / <span>Mercado</span> / <span aria-current="page">Carrinho</span></nav>
      <div className="mt-3 grid gap-10 xl:grid-cols-[782px_332px] xl:justify-between xl:gap-0">
        <section aria-labelledby="cart-items-title" className="min-w-0 xl:w-[782px]">
          <div className="hidden h-7 grid-cols-[250px_77px_75px_87px_24px] items-start justify-between border-b border-border pb-3 text-body-16-bold-compact text-foreground sm:grid"><h1 id="cart-items-title">NFTs</h1><span>Preço</span><span>Edições</span><span>Total</span><span aria-hidden="true" /></div>
          {items.length === 0 ? <div className="mt-3 rounded-md bg-surface-card p-8 text-center"><h1 id="cart-items-title" className="text-body-16-bold text-foreground">Seu carrinho está vazio</h1><Link className="mt-3 inline-block text-body-14-medium text-text-accent hover:text-primary" to="/">Explorar NFTs</Link></div> : <ul className="mt-3 flex flex-col gap-3" aria-label="Itens do carrinho">
            {items.map(item => <li className="grid min-h-[70px] gap-3 bg-surface-card p-2 sm:grid-cols-[250px_77px_75px_87px_24px] sm:items-center sm:justify-between sm:p-0 sm:pr-6" key={`${item.id}:${item.editionId}`}>
              <div className="flex min-w-0 items-center gap-4"><img alt="" className="size-[70px] shrink-0 rounded-md object-cover" src={item.image} /><div className="min-w-0"><p className="truncate text-body-16-bold-compact text-foreground">{displayName(item.id, item.name)}</p><p className="mt-1 text-body-14-compact text-secondary">ID do token: {item.tokenId}</p>{item.stock === 0 && <p className="mt-1 text-[10px] text-error">Edição indisponível</p>}</div></div>
              <p className="text-body-16-bold-compact text-text-secondary"><span className="sm:hidden">Preço: </span>{formatEth(item.priceEth)}</p>
              <div className="flex items-center gap-3" role="group" aria-label={`Quantidade de ${item.name}, edição ${item.editionLabel}`}><Button aria-label={`Diminuir quantidade de ${item.name}`} className="size-5 rounded-full border-ink bg-primary p-0 text-ink" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.editionId, item.quantity - 1)} type="button" variant="outline"><Minus className="size-3" /></Button><output aria-live="polite" className="w-3 text-center text-[17px] leading-6 text-foreground">{item.quantity}</output><Button aria-label={`Aumentar quantidade de ${item.name}`} className="size-5 rounded-full border-ink bg-primary p-0 text-ink" disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.editionId, item.quantity + 1)} type="button" variant="outline"><Plus className="size-3" /></Button></div>
              <p className="text-body-16-bold-compact text-text-accent"><span className="sm:hidden">Total: </span>{formatEth(new Decimal(item.priceEth).mul(item.quantity).toString())}</p>
              <Button aria-label={`Remover ${item.name} do carrinho`} className="size-6 p-0 text-secondary hover:text-text-accent" onClick={() => removeItem(item.id, item.editionId)} type="button" variant="ghost"><Trash2 className="size-4" /></Button>
            </li>)}
          </ul>}
        </section>
        <aside aria-labelledby="wallet-summary-title" className="min-h-[388px] xl:w-[332px]"><h2 id="wallet-summary-title" className="h-7 border-b border-border pb-3 text-body-15-bold-compact text-foreground">Resumo da carteira</h2><label className="mt-6 block text-body-14-bold-compact text-foreground" htmlFor="coupon">Código promocional</label><div className="mt-2 flex h-10 overflow-hidden rounded-md"><Input className="h-10 min-w-0 flex-1 rounded-r-none border-border bg-surface-dark px-2 text-body-14-compact" disabled={couponMutation.isPending} id="coupon" onChange={event => setCouponText(event.target.value)} placeholder="Digite o código promocional..." value={couponText} /><Button className="h-10 w-[102px] shrink-0 rounded-l-none px-1 text-body-14-bold-compact" disabled={!couponText.trim() || couponMutation.isPending} onClick={() => couponMutation.mutate(couponText)} type="button">Aplicar</Button></div>
          {coupon && <div className="mt-2 flex items-center justify-between text-[10px] text-success"><span>{coupon} aplicado</span><Button aria-label="Remover cupom" className="size-4 p-0 text-secondary hover:text-foreground" onClick={() => { removeCoupon(); setCouponFeedback('Cupom removido.') }} type="button" variant="ghost"><X className="size-3" /></Button></div>}
          {couponFeedback && <p className={couponMutation.isError ? 'mt-1 text-[9px] text-error' : 'mt-1 text-[9px] text-success'} role="status">{couponFeedback}</p>}
          {quote.isError && <p className="mt-2 text-[10px] text-error" role="alert">Não foi possível atualizar a cotação. Revise os valores antes de finalizar.</p>}
          <dl className="mt-6 space-y-3 text-body-14-compact text-foreground"><div className="flex h-5 justify-between"><dt>Subtotal</dt><dd>{totals ? formatEth(totals.subtotalEth) : '—'}</dd></div><div className="flex h-5 justify-between"><dt>Desconto do lançamento</dt><dd>{totals ? `(-) ${formatEth(totals.discountEth)}` : '—'}</dd></div><div><div className="flex h-5 justify-between"><dt>Taxa de rede</dt><dd>{totals ? formatEth(totals.networkFeeEth) : '—'}</dd></div><div className="mt-3 text-right text-[10px] text-text-accent">Cotação da API</div></div></dl>
          <div className="mt-6 flex justify-between text-body-15-bold-compact text-foreground"><span>Total</span><span className="text-text-accent">{totals ? formatEth(totals.totalEth) : '—'}</span></div><Button className="mt-6 h-10 w-full text-body-14-bold-compact" disabled={!items.length || !totals || quote.isFetching || items.some(item => item.quantity <= 0)} onClick={() => void navigate({ to: '/checkout' })} type="button">Conectar e finalizar</Button><Link className="mt-3 block text-center text-body-14-compact text-text-accent hover:text-primary" to="/">Continuar explorando</Link>
        </aside>
      </div>
    </section>
    <section aria-labelledby="suggestions-title"><h2 id="suggestions-title" className="h-7 border-b border-border pb-3 text-body-15-bold-compact text-text-accent">Colecionadores também viram</h2><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-[repeat(5,219px)] xl:justify-between">{suggestions.map(item => <article className="w-[219px]" key={item.name}><img alt="" className="h-[255px] w-[219px] rounded-md object-cover" src={item.image} /><h3 className="mt-2 text-body-14-compact text-foreground">{item.name}</h3><p className="mt-2 text-body-14-bold-compact text-text-accent">{item.price}</p></article>)}</div><div aria-hidden="true" className="mt-12 flex justify-center gap-2"><span className="size-3 rounded-full border border-primary" /><span className="size-3 rounded-full bg-primary" /><span className="size-3 rounded-full bg-border" /></div></section>
  </main>
}
