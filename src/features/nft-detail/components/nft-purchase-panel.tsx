import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Heart, Share2, Star } from 'lucide-react'
import type { EditionLabel, NftDetail } from '@/@types/nft-detail'
import { useAuthStore } from '@/features/auth/auth-store'
import { setFavorite } from '@/features/nft-detail/api/nft-detail-api'
import { clampQuantity } from '@/features/nft-detail/lib/nft-detail-validation'
import { Button } from '@/components/ui/button'

const editionOptions: EditionLabel[] = ['1/1', '1/10', '1/50', 'ABERTA']

export function NftPurchasePanel({ nft }: { nft: NftDetail }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { status, token } = useAuthStore()
  const [quantity, setQuantity] = useState(() =>
    clampQuantity(1, nft.availability)
  )
  const [feedback, setFeedback] = useState<string | null>(null)
  const isSoldOut = nft.availability <= 0

  const favoriteMutation = useMutation({
    mutationFn: (nextIsFavorite: boolean) => {
      if (!token) throw new Error('unauthenticated')
      return setFavorite(nft.id, token, nextIsFavorite)
    },
    onError: error => {
      if ((error as Error).message === 'unauthenticated') return
      setFeedback('Não foi possível atualizar o favorito. Tente novamente.')
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['nft-detail', nft.id] })
    }
  })

  const handleFavorite = () => {
    if (status !== 'authenticated') {
      void navigate({
        to: '/login',
        search: { returnTo: `/nft/${nft.id}` }
      })
      return
    }
    favoriteMutation.mutate(!nft.isFavorite)
  }

  const handleBuy = () => {
    if (isSoldOut) return
    setFeedback(
      `${quantity} unidade(s) de ${nft.name} adicionada(s) ao carrinho.`
    )
  }

  const adjustQuantity = (delta: number) =>
    setQuantity(current => clampQuantity(current + delta, nft.availability))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-product-title text-foreground">
          {nft.name} {nft.tokenId}
        </h1>
        <div className="flex flex-wrap items-center gap-3 border-b border-border pb-3">
          <p className="text-product-price text-text-accent">
            {nft.priceEth} ETH
          </p>
          <div className="flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                className={`size-[15px] ${
                  index < Math.round(nft.reviews.average)
                    ? 'fill-text-accent text-text-accent'
                    : 'fill-transparent text-text-secondary'
                }`}
                key={index}
              />
            ))}
            <span className="text-[15px] leading-normal text-foreground">
              {nft.reviews.count} avaliações de colecionadores
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[15px] font-bold leading-4 text-foreground">Sobre este NFT:</p>
        <p className="max-w-143.5 text-[14px] leading-6 text-text-secondary">
          {nft.description}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[15px] font-bold leading-4 text-foreground">Edição:</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Edição">
          {editionOptions.map(option => (
            <span
              className={`grid h-7 place-items-center rounded-full border px-1 text-[14px] leading-4 ${
                option === nft.editionLabel
                  ? 'border-primary font-medium text-text-accent'
                  : 'border-border text-text-secondary'
              } ${
                option === '1/1'
                  ? 'w-9'
                  : option === '1/10'
                    ? 'w-[42px]'
                    : option === '1/50'
                      ? 'w-[46px]'
                      : 'w-[66px]'
              }`}
              key={option}
            >
              {option}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 lg:justify-between">
        <div
          className="flex h-[49.5px] items-center gap-3"
          role="group"
          aria-label="Quantidade"
        >
          <Button
            aria-label="Diminuir quantidade"
            className="h-[49.5px] w-[33px] rounded-[33px] border-ink bg-primary text-[26.4px] text-ink shadow-[0_6.6px_9.9px_rgb(20_13_10_/_0.15)] hover:bg-primary-light"
            disabled={isSoldOut || quantity <= 1}
            onClick={() => adjustQuantity(-1)}
            type="button"
            variant="outline"
          >
            −
          </Button>
          <span
            className="w-6 text-center text-[20px] leading-7 text-foreground"
            aria-live="polite"
          >
            {isSoldOut ? 0 : quantity}
          </span>
          <Button
            aria-label="Aumentar quantidade"
            className="h-[49.5px] w-[33px] rounded-[33px] border-ink bg-primary text-[26.4px] text-ink shadow-[0_6.6px_9.9px_rgb(20_13_10_/_0.15)] hover:bg-primary-light"
            disabled={isSoldOut || quantity >= nft.availability}
            onClick={() => adjustQuantity(1)}
            type="button"
            variant="outline"
          >
            +
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="h-10 w-[130px] px-0"
            disabled={isSoldOut}
            onClick={handleBuy}
            type="button"
          >
            <span className="text-[14px] font-bold leading-5 text-ink uppercase">
              {isSoldOut ? 'Esgotado' : 'Comprar'}
            </span>
          </Button>
          <Button
            aria-pressed={Boolean(nft.isFavorite)}
            className="h-10 w-[130px] gap-2 border-primary px-0 text-text-accent"
            disabled={favoriteMutation.isPending}
            onClick={handleFavorite}
            type="button"
            variant="outline"
          >
            <Heart
              className={`size-5 ${nft.isFavorite ? 'fill-text-coral text-text-coral' : ''}`}
            />
            <span className="text-[14px] font-medium leading-5">Favoritar</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <p
          aria-live="polite"
          className="text-body-14-compact text-text-accent"
          role="status"
        >
          {feedback}
        </p>
      )}

      <div className="flex flex-col gap-3 text-[15px] leading-normal text-secondary">
        <p>ID do token: {nft.tokenId}</p>
        <p>Coleção: {nft.collection.name}</p>
        <p>
          Atributos:{' '}
          {nft.attributes.map(attribute => attribute.value).join(', ')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-[15px] font-bold leading-4 text-foreground">
          Compartilhar este NFT:
        </p>
        <Share2
          aria-hidden="true"
          className="size-icon-sm text-text-secondary"
        />
      </div>
    </div>
  )
}
