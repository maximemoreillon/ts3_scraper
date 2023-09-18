import { scrape } from "./scraping"
import { register_transactions } from "./registration"
import { format_entries, renameDuplicates } from "./formatter"
import { version } from "./package.json"

import dotenv from "dotenv"

dotenv.config()

process.env.TZ = "Asia/Tokyo"

console.log(`TS3 transaction scraper v${version}`)

const scrape_and_register = async () => {
  const table_content = await scrape()
  const formatted_entries = format_entries(table_content)
  const formatted_entries_deducplicated = renameDuplicates(formatted_entries)
  await register_transactions(formatted_entries_deducplicated)
}

scrape_and_register()
