const axios = require('axios')
const secrets = require('./secrets')

exports.register_transactions = (transactions) => {
  
  axios.post(secrets.api_url, {
    transactions: transactions,
  },{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secrets.jwt}`,
    },
    timeout: 3000,
  })
  .then(response => console.log(response.data))
  .catch(error => {
    console.log(error)
  })

}
