import { z } from "zod"

const AMOUNT_COL = 6
const DESCRIPTION_COL = 2
const DATE_COL = 0

const format_date = (raw_date_string: string) => {
  const formatted_date_string = `20${raw_date_string}`
    .replace("月", "/")
    .replace("日", "")
    .replace(/ /g, "") // remove spaces

  return new Date(formatted_date_string)
}

const format_amount = (amount_string: string) => {
  const amount_string_formatted = amount_string
    .replace("円", "")
    .replace(/,/g, "") // all thousands separators, not just the first
  // NOTE: negative because payment
  return -Number(amount_string_formatted)
}

// z.date() rejects Invalid Date and z.number() rejects NaN/Infinity
const transactionSchema = z.object({
  date: z.date(),
  amount: z.number(),
  description: z.string().min(1),
  currency: z.literal("JPY"),
})

const transactionsSchema = z.array(transactionSchema)

export type Transaction = z.infer<typeof transactionSchema>

export const format_entries = (rows: string[][]): Transaction[] => {
  const entries = rows
    // ignore invalid rows (blank amount cell, trim() also strips full-width spaces)
    .filter((cols) => cols[AMOUNT_COL]?.trim())
    .map((cols) => ({
      date: format_date(cols[DATE_COL]),
      amount: format_amount(cols[AMOUNT_COL]),
      description: cols[DESCRIPTION_COL],
      currency: "JPY",
    }))

  const result = transactionsSchema.safeParse(entries)
  if (!result.success)
    throw new Error(
      `Invalid transactions, aborting before registration:\n${z.prettifyError(result.error)}`
    )

  return result.data
}

export const renameDuplicates = (transactions: Transaction[]) =>
  transactions.reduce<Transaction[]>((a, t, i) => {
    const duplicateCount = transactions
      .slice(0, i)
      .filter((e) => JSON.stringify(e) === JSON.stringify(t)).length

    const formattedItem = {
      ...t,
      description: duplicateCount
        ? `${t.description}(${duplicateCount + 1})`
        : t.description,
    }

    return [...a, formattedItem]
  }, [])
