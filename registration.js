const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const {
  FINANCES_API_TOKEN,
  FINANCES_API_URL,
  FINANCES_API_ACCOUNT_NAME,
} = process.env

exports.register_transactions = (transactions) => {

  console.log(`[Finances API] Registering transactions`);

  const url = `${FINANCES_API_URL}/accounts/${FINANCES_API_ACCOUNT_NAME}/transactions`
  const body = {transactions}
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${FINANCES_API_TOKEN}`,
  }

  axios.post(url, body, {headers})
    .then( ({data}) => {
      console.log(`[Finances API] Successfully registered transactions`)
    })
    .catch(error => {
      console.log(`[Finances API] Registration fo transactions failed`)
      console.log(error)
    })

}

exports.finance_api_url = FINANCES_API_URL
exports.finance_api_account = FINANCES_API_ACCOUNT_NAME