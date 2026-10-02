import { z } from 'zod'

export const apiErrorSchema = z.object({
  message: z.string().optional(),
  fieldErrors: z.record(z.string(), z.string()).optional(),
})

export const nftUpdateEventSchema = z.object({
  type: z.literal('nft.updated'),
  userId: z.string().nullable().optional(),
  nftId: z.string(),
  version: z.number().int().nonnegative(),
  priceEth: z.string(),
  availability: z.number().int().nonnegative(),
})

export type NftUpdateEvent = z.infer<typeof nftUpdateEventSchema>

export const orderUpdateEventSchema = z.object({
  type: z.literal('order.updated'),
  userId: z.string(),
  orderId: z.string(),
  version: z.number().int().nonnegative(),
  status: z.enum(['pending', 'confirmed', 'declined']),
  reason: z.string().optional(),
  transactionReference: z.string().optional(),
})

export type OrderUpdateEvent = z.infer<typeof orderUpdateEventSchema>
