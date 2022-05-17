const puppeteer = require('puppeteer')
const dotenv = require('dotenv')

dotenv.config()

const {
  TS3_CARD_NUMBER,
  TS3_PASSWORD,
  TS3_LOGIN_URL
} = process.env


const login = async (page, {TS3_CARD_NUMBER, TS3_PASSWORD}) => page.evaluate( ({TS3_CARD_NUMBER, TS3_PASSWORD}) => {
  document.querySelectorAll("input[name='vo.CORPCARDNO1']")[0].value = TS3_CARD_NUMBER.substring(0, 4)
  document.querySelectorAll("input[name='vo.CORPCARDNO2']")[0].value = TS3_CARD_NUMBER.substring(4, 8)
  document.querySelectorAll("input[name='vo.CORPCARDNO3']")[0].value = TS3_CARD_NUMBER.substring(8, 12)
  document.querySelectorAll("input[name='vo.CORPCARDNO4']")[0].value = TS3_CARD_NUMBER.substring(12, 16)
  document.querySelectorAll("input[name='vo.CARDPW']")[0].value = TS3_PASSWORD
  document.querySelectorAll("a[href='#']")[0].click()
}, {TS3_CARD_NUMBER, TS3_PASSWORD})

const check_if_next_transactions_page = async (page) =>  page.evaluate(() => { return !!document.querySelectorAll("img[alt='次ページへ']")[0] })

const get_transactions_from_table = async (page) => page.evaluate(() => {
  
  var table_content = []

  // NOTE: Can't use array functions because NodeList and not Array

  var rows = document.querySelectorAll("table")[4].querySelectorAll("tr")

  // Should use reduce here
  for(var row_index=2; row_index<rows.length; row_index++){

    table_content.push([])

    const cells = rows[row_index].querySelectorAll("td, th")
    for(var cell_index=0; cell_index<cells.length; cell_index ++){
      var content = cells[cell_index].querySelectorAll("span")[0].innerHTML;
      table_content[table_content.length-1].push(content) // Push current cell content to array
    }
  }
  return table_content;
})

exports.scrape = async () => {
  // returns the content of the target trtansaction table

  console.log(`[Scraper] Started scraping`)
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setViewport({ width: 1280, height: 800 })

  // Navigate to main page
  await page.goto(TS3_LOGIN_URL)

  // Login
  await login(page, {TS3_CARD_NUMBER, TS3_PASSWORD})
  await page.waitForNavigation()

  // Click next
  await page.evaluate(() => { document.querySelectorAll("a[href='#']")[0].click() })
  await page.waitForNavigation()

  // Click next
  await page.evaluate(() => { document.querySelectorAll("input[type='button']")[0].click() })
  await page.waitForNavigation()

  // Month selection page
  // Select last available month (index = 2)
  await page.evaluate(() => { document.querySelectorAll("a[href='#']")[2].click() })
  await page.waitForNavigation()

  const transactions = []
  const transactions_of_page = await get_transactions_from_table(page)

  transactions_of_page.forEach((transaction) => { transactions.push(transaction) })

  while( await check_if_next_transactions_page(page) ) {

    // Click the next page button
    await page.evaluate(() => { document.querySelectorAll("img[alt='次ページへ']")[0].parentNode.click() })
    await page.waitForNavigation()
    const transactions_of_page = await get_transactions_from_table(page)
    transactions_of_page.forEach((transaction) => { transactions.push(transaction) })
  }

  await browser.close()

  console.log(transactions);


  console.log(`[Scraper] Successfully scraped ${transactions.length} transactions`)

  return transactions
}
