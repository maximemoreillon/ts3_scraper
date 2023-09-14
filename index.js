const { scrape } = require("./scraping.js")
const { register_transactions } = require("./registration.js")
const { version } = require("./package.json")

const { format_entries } = require("./formatter.js")

const dotenv = require("dotenv")

dotenv.config()

process.env.TZ = "Asia/Tokyo"

console.log(`TS3 transaction scraper v${version}`)

const scrape_and_register = async () => {
  const table_content = await scrape()
  const formatted_entries = format_entries(table_content)
  register_transactions(formatted_entries)
}

// Scrape immediatly
scrape_and_register()
