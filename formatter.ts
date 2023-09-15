import dotenv from "dotenv"
dotenv.config()

const col_indices = {
  amount: 6,
  description: 2,
  date: 0, // Warning: does not yield a date for months other than current
}

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

  return -Number(amount_string_formatted)
}

export const format_entries = (rows: any[]) => {
  return rows
    .filter((cols) => cols[col_indices.amount] !== "　") // ignore invalid rows
    .map((cols) => {
      return {
        date: format_date(cols[col_indices.date]),
        amount: format_amount(cols[col_indices.amount]),
        description: cols[col_indices.description],
        currency: "JPY",
      }
    })
}
