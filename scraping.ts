import puppeteer, { Page } from "puppeteer"
import dotenv from "dotenv"

dotenv.config()

const {
  TS3_CARD_NUMBER = "",
  TS3_PASSWORD = "",
  TS3_LOGIN_URL = "",
} = process.env

const login = async (page: Page) => {
  // Card number is split in 4 inputs of 4 digits
  for (let i = 0; i < 4; i++)
    await page.type(
      `input[name='vo.CORPCARDNO${i + 1}']`,
      TS3_CARD_NUMBER.substring(i * 4, (i + 1) * 4)
    )

  await page.type("input[name='vo.CARDPW']", TS3_PASSWORD)
  await page.click("a[href='#']")
}

const check_if_next_transactions_page = async (page: Page) =>
  !!(await page.$("img[alt='次ページへ']"))

const get_transactions_from_table = async (page: Page) =>
  page.evaluate(() => {
    var table_content: any[] = []

    // NOTE: Can't use array functions because NodeList and not Array
    var rows = document.querySelectorAll("table")[4].querySelectorAll("tr")

    // Should use reduce here
    for (var row_index = 2; row_index < rows.length; row_index++) {
      table_content.push([])

      const cells = rows[row_index].querySelectorAll("td, th")
      for (var cell_index = 0; cell_index < cells.length; cell_index++) {
        var content = cells[cell_index].querySelectorAll("span")[0].innerHTML
        table_content[table_content.length - 1].push(content) // Push current cell content to array
      }
    }
    return table_content
  })

export const scrape = async () => {
  // returns the content of the target trtansaction table

  console.log(`[Scraper] Started scraping`)

  let browser

  try {
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
  } catch {
    browser = await puppeteer.launch({ headless: "new" })
  }

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(TS3_LOGIN_URL)
  await login(page)

  await page.waitForSelector(".greeting")
  console.log("[Scraper] Logged in")

  // TOP: select card
  console.log("[Scraper] Selecting card...")
  await page.click("a[href='#']")
  await page.waitForSelector("form[name='FbADMC864'")

  // Card selected: Click next
  console.log("[Scraper] Card selected, clicking next")
  await page.click("input[type='button']")
  await page.waitForSelector('table[summary="切り替え機能の選択"]')
  console.log("[Scraper] Pressed next again")

  // Month selection page
  // Select last available month (index = 2)
  console.log("[Scraper] Selecting month...")

  const monthSelectionTable = await page.$(
    'table[summary="切り替え機能の選択"]'
  )
  if (!monthSelectionTable) throw "Month selection table not found"
  const lastMonthRow = (await monthSelectionTable.$$("tr")).at(-1)
  await (await lastMonthRow?.$("a[href='#']"))?.click()

  // This is not a good selector as previous page already has a table
  await page.waitForSelector("form[name='FbADMC867")
  console.log("[Scraper] Month selected")

  const transactions: any = []
  const transactions_of_page = await get_transactions_from_table(page)

  transactions_of_page.forEach((transaction) => {
    transactions.push(transaction)
  })

  while (await check_if_next_transactions_page(page)) {
    // Click the next page button
    console.log("[Scraper] Another page is available")
    await page.click("img[alt='次ページへ']")
    try {
      await page.waitForNavigation({ timeout: 3000 })
    } catch (error) {}
    const transactions_of_page = await get_transactions_from_table(page)

    transactions_of_page.forEach((transaction) => {
      transactions.push(transaction)
    })
  }

  console.log("[Scraper] No more pages available")

  await browser.close()

  console.log(
    `[Scraper] Successfully scraped ${transactions.length} rows in transaction table`
  )

  return transactions
}
