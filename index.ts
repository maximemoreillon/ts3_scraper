import { scrape } from "./scraping"
import { register_transactions } from "./registration"
import { version } from "./package.json"

import { format_entries } from "./formatter"

import dotenv from "dotenv"

dotenv.config()

process.env.TZ = "Asia/Tokyo"

console.log(`TS3 transaction scraper v${version}`)

const scrape_and_register = async () => {
  const table_content = await scrape()
  const formatted_entries = format_entries(table_content)
  await register_transactions(formatted_entries)
}

// Scrape immediatly
scrape_and_register()
