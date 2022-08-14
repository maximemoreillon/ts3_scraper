// const log_timestamp = require('log-timestamp')
const { scheduleJob } = require ('node-schedule')
const { scrape } = require('./scraping.js')
const { 
  register_transactions,
  finance_api_url,
  finance_api_account,
} = require('./registration.js')
const { version } = require('./package.json')

const { format_entries } = require('./formatter.js')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')


dotenv.config()

process.env.TZ = 'Asia/Tokyo'

const {
  PORT = 80
} = process.env


const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send({
    application_name: 'TS3 scraper',
    version,
    finances_api: {
      url: finance_api_url,
      account: finance_api_account,
    }
  })
})

app.listen(PORT, () => {
  console.log(`Express listening on port ${PORT}`)
})


console.log(`TS3 data scraper`)

const scrape_and_register = () => {
  scrape().then(table_content => {
    const formatted_entries = format_entries(table_content)
    register_transactions(formatted_entries)
  })
}

// scrape periodically
scheduleJob('0 2 * * *', scrape_and_register)

// Scrape immediatly
scrape_and_register()