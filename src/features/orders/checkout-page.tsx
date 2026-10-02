import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { getCartQuote } from '@/features/cart/cart-api'
import { useCartStore } from '@/features/cart/cart-store'
import { createOrder, type Order } from '@/features/orders/orders-api'
import { queryKeys } from '@/lib/query-keys'
import { realtimeClient } from '@/lib/realtime'
import { useAuthStore } from '@/features/auth/auth-store'

const key = () => crypto.randomUUID()
export function CheckoutPage() {
  const user = useAuthStore(s => s.user!)
  const { items, coupon, removeItem, syncQuote } = useCartStore()
  const client = useQueryClient()
  const [attempt, setAttempt] = useState(key)
  const [order, setOrder] = useState<Order | null>(null)
  const revision = useMemo(() => JSON.stringify(items.map(({ id, editionId, quantity, priceEth, stock }) => ({ id, editionId, quantity, priceEth, stock }))), [items])
  const quote = useQuery({ queryKey: queryKeys.quote(user.id, `checkout:${revision}:${coupon ?? ''}`), queryFn: ({ signal }) => getCartQuote(items, coupon, signal), retry: false })
  useEffect(() => { if (quote.data) syncQuote(quote.data.items) }, [quote.data, syncQuote])
  useEffect(() => {
    const changed = () => { void quote.refetch() }
    realtimeClient.on('nft.updated', changed)
    return () => { realtimeClient.off('nft.updated', changed) }
  }, [quote.refetch])
  useEffect(() => {
    const changed = (event: { orderId: string; status: Order['status']; version: number; reason?: string; userId: string }) => {
      if (event.userId !== user.id) return
      setOrder(current => current?.id === event.orderId && event.version > current.version ? { ...current, ...event } : current)
      void client.invalidateQueries({ queryKey: queryKeys.orders(user.id) })
    }
    realtimeClient.on('order.updated', changed)
    return () => { realtimeClient.off('order.updated', changed) }
  }, [client, user.id])
  const submit = useMutation({
    mutationFn: () => { if (!quote.data) throw new Error('A cotação ainda não está disponível.'); return createOrder(items, coupon, quote.data, attempt) },
    onSuccess: value => { setOrder(value); if (value.status === 'confirmed') items.forEach(item => removeItem(item.id, item.editionId)) },
    onError: () => { /* A mesma chave fica preservada para recuperar o pedido após timeout. */ },
  })
  if (order) return <main className="mx-auto max-w-xl py-16"><h1 className="text-2xl font-bold">Pedido {order.status === 'confirmed' ? 'confirmado' : order.status === 'declined' ? 'recusado' : 'pendente'}</h1><p className="mt-3 text-text-secondary">{order.id}{order.reason ? ` — ${order.reason}` : ''}</p><p className="mt-3">Total: {order.receipt.totals.totalEth} ETH</p><Link className="mt-8 inline-block text-text-accent" to="/orders">Ver pedidos</Link></main>
  return <main className="mx-auto max-w-xl py-16"><h1 className="text-2xl font-bold">Revisar e finalizar</h1>{quote.isFetching && <p className="mt-4" role="status">Atualizando cotação…</p>}{quote.isError && <p className="mt-4 text-error" role="alert">A cotação mudou ou não pôde ser atualizada. Revise o carrinho antes de confirmar.</p>}<p className="mt-4 text-text-secondary">A confirmação usa a cotação mais recente. Alterações de preço ou disponibilidade impedem o envio até a nova cotação carregar.</p><p className="mt-4">Total: {quote.data?.totals.totalEth ?? '—'} ETH</p><Button className="mt-8" disabled={!quote.data || quote.isFetching || submit.isPending || !items.length} onClick={() => submit.mutate()}>{submit.isPending ? 'Enviando…' : 'Confirmar pedido'}</Button>{submit.isError && <div className="mt-4 text-error" role="alert">{submit.error.message} <button className="underline" onClick={() => submit.mutate()}>Recuperar tentativa</button></div>}<button className="ml-4 text-text-accent underline" onClick={() => setAttempt(key())}>Iniciar nova tentativa</button></main>
}
