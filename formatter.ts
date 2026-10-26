const AMOUNT_COL = 6
const DESCRIPTION_COL = 2
const DATE_COL = 0

const format_date = (raw_date_string: string) => {
  const formatted_date_string = `20${raw_date_string}`
    .replace("月", "/")
    .replace("日", "")
    .replace(/ /g, "") // remove spaces

  const date = new Date(formatted_date_string)
  if (Number.isNaN(date.getTime())) throw `Invalid date: ${raw_date_string}`
  return date
}

const format_amount = (amount_string: string) => {
  const amount_string_formatted = amount_string
    .replace("円", "")
    .replace(/,/g, "") // all thousands separators, not just the first
  const amount = Number(amount_string_formatted)
  if (Number.isNaN(amount)) throw `Invalid amount: ${amount_string}`
  // NOTE: negative because payment
  return -amount
}

export type Transaction = {
  date: Date
  amount: number
  description: string
  currency: "JPY"
}

export const format_entries = (rows: string[][]): Transaction[] =>
  rows
    // ignore invalid rows (blank amount cell, trim() also strips full-width spaces)
    .filter((cols) => cols[AMOUNT_COL]?.trim())
    .map((cols) => ({
      date: format_date(cols[DATE_COL]),
      amount: format_amount(cols[AMOUNT_COL]),
      description: cols[DESCRIPTION_COL],
      currency: "JPY",
    }))

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
