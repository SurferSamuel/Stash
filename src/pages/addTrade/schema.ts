import dayjs, { Dayjs } from 'dayjs';
import { z } from 'zod';

const schemaForQuantity = z
  .object({
    accountId: z.string().min(1, { message: 'Required' }),
    symbol: z.string().min(1, { message: 'Required' }),
    type: z.enum(['BUY', 'SELL']),
    quantity: z.number({ message: 'Required' }).positive(),
  })
  .refine(
    async ({ symbol, accountId, type, quantity }) => {
      if (symbol !== '' && accountId !== '' && type === 'SELL') {
        const owned = await window.electronAPI.availableUnits(symbol, accountId);
        return quantity <= owned;
      }
      return true;
    },
    {
      message: 'Quantity exceeds owned units',
      path: ['quantity'],
    },
  );

const schemaForRest = z.object({
  date: z
    .custom<Dayjs>((val) => val instanceof dayjs, 'Invalid date')
    .refine((val) => !val.isAfter(dayjs(), 'day'), { message: 'Date can\'t be in the future' }),
  price: z.number({ message: 'Required' }).positive(),
  brokerage: z.number({ message: 'Required' }).nonnegative(),
});

export const schema = z.intersection(schemaForQuantity, schemaForRest);

export type Schema = z.infer<typeof schema>;

export const defaultValues = {
  accountId: '',
  symbol: '',
  type: 'BUY' as const,
  date: dayjs(),
};
