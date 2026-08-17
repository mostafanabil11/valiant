import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Enter a coupon code').max(30),
});

export class ValidateCouponDto extends createZodDto(validateCouponSchema) {}
