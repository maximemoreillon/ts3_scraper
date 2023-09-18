const AMOUNT_COL = 6
const DESCRIPTION_COL = 2
const DATE_COL = 0

const format_date = (raw_date_string: string) => {
  const formatted_date_string = `20${raw_date_string}`
    .replace("月", "/")
    .replace("日", "")
    .replace(" ", "") // remove spaces

  return new Date(formatted_date_string)
}

const format_amount = (amount_string: string) => {
  const amount_string_formatted = amount_string
    .replace("円", "")
    .replace(",", "")
  // NOTE: negative because payment
  return -Number(amount_string_formatted)
}

export const format_entries = (rows: any[]) =>
  rows
    .filter((cols) => cols[AMOUNT_COL] !== "　") // ignore invalid rows
    .map((cols) => ({
      date: format_date(cols[DATE_COL]),
      amount: format_amount(cols[AMOUNT_COL]),
      description: cols[DESCRIPTION_COL],
      currency: "JPY",
    }))

export const renameDuplicates = (transactions: any[]) => {
  // For each does not sound like a good idea. Instead, try to make a copy of original
  return transactions.reduce((a, t, i) => {
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
}
