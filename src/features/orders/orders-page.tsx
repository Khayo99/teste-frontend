import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrders } from './orders-api'
import { queryKeys } from '@/lib/query-keys'
import { realtimeClient } from '@/lib/realtime'
import { useAuthStore } from '@/features/auth/auth-store'

export function OrdersPage() {
  const user = useAuthStore(state => state.user!)
  const client = useQueryClient()
  const orders = useQuery({
    queryKey: queryKeys.orders(user.id),
    queryFn: getOrders,
    retry: false
  })
  useEffect(() => {
    const update = (event: { userId: string }) => {
      if (event.userId === user.id)
        void client.invalidateQueries({ queryKey: queryKeys.orders(user.id) })
    }
    realtimeClient.on('order.updated', update)
    return () => {
      realtimeClient.off('order.updated', update)
    }
  }, [client, user.id])
  return (
    <main className="mx-auto max-w-2xl py-16">
      <h1 className="text-2xl font-bold">Pedidos</h1>
      {orders.isLoading && (
        <p className="mt-4" role="status">
          Carregando pedidos…
        </p>
      )}
      {orders.isError && (
        <p className="mt-4 text-error" role="alert">
          Não foi possível recuperar seus pedidos.
        </p>
      )}
      {orders.data?.length === 0 && (
        <p className="mt-4 text-text-secondary">Você ainda não tem pedidos.</p>
      )}
      <ul className="mt-6 space-y-3">
        {orders.data?.map(order => (
          <li className="rounded border border-border p-4" key={order.id}>
            <p className="font-bold">{order.id}</p>
            <p className="mt-1">
              {order.status === 'confirmed'
                ? 'Confirmado'
                : order.status === 'declined'
                  ? 'Recusado'
                  : 'Pendente'}{' '}
              · {order.receipt.totals.totalEth} ETH
            </p>
            {order.reason && <p className="mt-1 text-error">{order.reason}</p>}
          </li>
        ))}
      </ul>
    </main>
  )
}
