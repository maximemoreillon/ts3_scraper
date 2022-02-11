const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const {
  FINANCES_API_TOKEN,
  FINANCES_API_URL,
} = process.env

exports.register_transactions = (transactions) => {

  console.log(`[Finances API] Registerign transactions`);

  const url = `${FINANCES_API_URL}/transactions`
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
