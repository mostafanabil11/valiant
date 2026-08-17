import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const checkoutSchema = z.object({
  addressId: z.string().min(1, 'A shipping address is required'),
  paymentMethod: z.enum(['cod', 'card']).default('cod'),
  // Optional — if the client doesn't supply one, the server generates one
  // internally so retries within a single checkout attempt still dedupe.
  // A client-supplied key lets a *new* checkout click after a network
  // failure safely retry without risking a double order.
  idempotencyKey: z.string().max(100).optional(),
  couponCode: z.string().max(30).optional(),
});

export class CheckoutDto extends createZodDto(checkoutSchema) {}
