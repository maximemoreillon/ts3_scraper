// const log_timestamp = require('log-timestamp')
const schedule = require ('node-schedule')
const scraper = require('./scraper')
const registration = require('./registration')
const formatter = require('./formatter')

process.env.TZ = 'Asia/Tokyo'

console.log(`TS3 data scraper`)

// scrape periodically
schedule.scheduleJob('0 2 * * *', () => {
  scraper.scrape()
    .then(table_content => {
    const formatted_entries = formatter.format_entries(table_content)
    registration.register_transactions(formatted_entries)
  })
})

// Scrape immediatly
scraper.scrape()
  .then(table_content => {
    const formatted_entries = formatter.format_entries(table_content)
    registration.register_transactions(formatted_entries)
  })
