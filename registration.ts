import axios from "axios";
import type { Transaction } from "./formatter";

const { FINANCES_API_TOKEN, FINANCES_API_URL, FINANCES_API_ACCOUNT_ID } =
  process.env;

export const register_transactions = async (transactions: Transaction[]) => {
  console.log(`[Finances API] Registering transactions`);

  const url = `${FINANCES_API_URL}/accounts/${FINANCES_API_ACCOUNT_ID}/transactions`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (FINANCES_API_TOKEN)
    headers.Authorization = `Bearer ${FINANCES_API_TOKEN}`;

  // const body = { transactions }
  // return axios.post(url, body, { headers })

  for (const { date, description, amount } of transactions) {
    const body = { time: date, description, amount };
    await axios.post(url, body, { headers });
  }
};
