import puppeteer, { Page } from "puppeteer";

const {
  TS3_CARD_NUMBER = "",
  TS3_PASSWORD = "",
  TS3_LOGIN_URL = "https://my.ts3card.com/webapp/ToADMC801Action.do",
} = process.env;

const login = async (page: Page) => {
  // Card number is split in 4 inputs of 4 digits
  for (let i = 0; i < 4; i++)
    await page.type(
      `input[name='vo.CORPCARDNO${i + 1}']`,
      TS3_CARD_NUMBER.substring(i * 4, (i + 1) * 4),
    );

  await page.type("input[name='vo.CARDPW']", TS3_PASSWORD);
  await page.click("a[href='#']");
};

const NEXT_PAGE_SELECTOR = "a:has(img[alt='次ページへ'])";
const MAX_PAGES = 50;

const check_if_next_transactions_page = async (page: Page) =>
  !!(await page.$("img[alt='次ページへ']"));

const get_table_fingerprint = (page: Page) =>
  page.evaluate(
    () => document.querySelectorAll("table")[4]?.textContent ?? "",
  );

// Works for both full page navigation and in-place (AJAX) table updates:
// waits until the transactions table content differs from before the click
const go_to_next_page = async (page: Page) => {
  const previous = await get_table_fingerprint(page);
  await page.click(NEXT_PAGE_SELECTOR);
  await page.waitForFunction(
    (prev) => {
      const table = document.querySelectorAll("table")[4];
      return (
        document.readyState === "complete" &&
        !!table &&
        table.textContent !== prev
      );
    },
    { timeout: 30000 },
    previous,
  );
};

const get_transactions_from_table = async (page: Page) =>
  page.evaluate(() => {
    var table_content: string[][] = [];

    // NOTE: Can't use array functions because NodeList and not Array
    var rows = document.querySelectorAll("table")[4].querySelectorAll("tr");

    // Should use reduce here
    for (var row_index = 2; row_index < rows.length; row_index++) {
      table_content.push([]);

      const cells = rows[row_index].querySelectorAll("td, th");
      for (var cell_index = 0; cell_index < cells.length; cell_index++) {
        // textContent decodes entities (&amp; -> &), falls back to the cell if it has no span
        var cell = cells[cell_index];
        var content = (cell.querySelector("span") ?? cell).textContent ?? "";
        table_content[table_content.length - 1].push(content); // Push current cell content to array
      }
    }
    return table_content;
  });

export const scrape = async () => {
  // returns the content of the target trtansaction table

  console.log(`[Scraper] Started scraping`);

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch {
    browser = await puppeteer.launch({ headless: "new" });
  }

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  );
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(TS3_LOGIN_URL);

  try {
    await page.waitForSelector("input[name='vo.CORPCARDNO1']");
    await login(page);

    await page.waitForSelector(".greeting");
    console.log("[Scraper] Logged in");

    // TOP: select card
    console.log("[Scraper] Selecting card...");
    await page.click("a[href='#']");
    await page.waitForSelector("form[name='FbADMC864'");

    // Card selected: Click next
    console.log("[Scraper] Card selected, clicking next");
    await page.click("input[type='button']");
    await page.waitForSelector('table[summary="切り替え機能の選択"]');
    console.log("[Scraper] Pressed next again");

    // Month selection page
    // Select last available month (last row)
    console.log("[Scraper] Selecting month...");

    const monthSelectionTable = await page.$(
      'table[summary="切り替え機能の選択"]',
    );
    if (!monthSelectionTable) throw new Error("Month selection table not found");
    const lastMonthRow = (await monthSelectionTable.$$("tr")).at(-1);
    await (await lastMonthRow?.$("a[href='#']"))?.click();

    // This is not a good selector as previous page already has a table
    await page.waitForSelector("form[name='FbADMC867");
    console.log("[Scraper] Month selected");

    const transactions: string[][] = [];
    const transactions_of_page = await get_transactions_from_table(page);

    transactions_of_page.forEach((transaction) => {
      transactions.push(transaction);
    });

    let page_count = 1;
    while (await check_if_next_transactions_page(page)) {
      if (++page_count > MAX_PAGES)
        throw new Error("Too many transaction pages, aborting");

      // Click the next page button
      console.log("[Scraper] Another page is available");

      await page.waitForSelector(NEXT_PAGE_SELECTOR, { visible: true });
      await go_to_next_page(page);
      const transactions_of_page = await get_transactions_from_table(page);

      transactions_of_page.forEach((transaction) => {
        transactions.push(transaction);
      });
    }

    console.log("[Scraper] No more pages available");

    console.log(
      `[Scraper] Successfully scraped ${transactions.length} rows in transaction table`,
    );

    return transactions;
  } catch (error) {
    // await page.screenshot({ path: "screenshot.png" });
    throw error;
  } finally {
    await browser.close();
  }
};
