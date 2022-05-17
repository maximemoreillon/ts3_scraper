// const log_timestamp = require('log-timestamp')
const { scheduleJob } = require ('node-schedule')
const { scrape } = require('./scraping.js')
const { register_transactions } = require('./registration.js')
const { format_entries } = require('./formatter.js')

process.env.TZ = 'Asia/Tokyo'

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