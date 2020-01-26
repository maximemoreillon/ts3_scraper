const axios = require('axios')
const jwt = require('jsonwebtoken')

const credentials = require('../common/credentials')

const secrets = require('./secrets')

exports.register_transactions = (transactions) => {
  jwt.sign({ service_name: 'credit_card_transactions_robot' }, credentials.jwt.secret, (err, token) => {
    axios.post(secrets.api_url, {
      transactions: transactions,
    },{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      timeout: 3000,
    })
    .then(response => console.log(response.data))
    .catch(error => {
      console.log(error)
    })
  });
}
