import { scrape } from "./scraping"
import { register_transactions } from "./registration"
import { format_entries, renameDuplicates } from "./formatter"
import { version } from "./package.json"
import { logger } from "./logger"

import dotenv from "dotenv"

dotenv.config()

process.env.TZ = "Asia/Tokyo"

console.log(`TS3 transaction scraper v${version}`)

const scrape_and_register = async () => {
  try {
    const table_content = await scrape()
    const formatted_entries = format_entries(table_content)
    const formatted_entries_deduplicated = renameDuplicates(formatted_entries)
    await register_transactions(formatted_entries_deduplicated)
    logger.info({
      message: `Successfully scraped ${formatted_entries_deduplicated.length} transactions`,
    })
  } catch (error) {
    console.error(error)
    logger.error({
      message: `Scraping failed`,
    })
  } finally {
    logger.close()
  }
}

scrape_and_register()
