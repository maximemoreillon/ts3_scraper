import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const { FINANCES_API_TOKEN, FINANCES_API_URL, FINANCES_API_ACCOUNT_NAME } =
  process.env

export const register_transactions = (transactions: any[]) => {
  console.log(`[Finances API] Registering transactions`)

  const url = `${FINANCES_API_URL}/accounts/${FINANCES_API_ACCOUNT_NAME}/transactions`
  const body = { transactions }
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${FINANCES_API_TOKEN}`,
  }

  return axios.post(url, body, { headers })
}
