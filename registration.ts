import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const { FINANCES_API_TOKEN, FINANCES_API_URL, FINANCES_API_ACCOUNT } =
  process.env

export const register_transactions = async (transactions: any[]) => {
  console.log(`[Finances API] Registering transactions`)

  const url = `${FINANCES_API_URL}/accounts/${FINANCES_API_ACCOUNT}/transactions`
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${FINANCES_API_TOKEN}`,
  }

  // const body = { transactions }
  // return axios.post(url, body, { headers })

  for (const { date, description, amount } of transactions) {
    const body = { time: date, description, amount }
    await axios.post(url, body, { headers })
  }
}
