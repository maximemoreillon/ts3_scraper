// const log_timestamp = require('log-timestamp')
const schedule = require ('node-schedule')
const {scrape} = require('./scraping.js')
const registration = require('./registration.js')
const formatter = require('./formatter.js')

process.env.TZ = 'Asia/Tokyo'

console.log(`TS3 data scraper`)

// scrape periodically
schedule.scheduleJob('0 2 * * *', () => {
  scrape()
    .then(table_content => {
    const formatted_entries = formatter.format_entries(table_content)
    registration.register_transactions(formatted_entries)
  })
})

// Scrape immediatly
scrape()
  .then(table_content => {
    const formatted_entries = formatter.format_entries(table_content)
    registration.register_transactions(formatted_entries)
  })
