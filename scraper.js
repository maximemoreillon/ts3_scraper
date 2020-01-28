const puppeteer = require('puppeteer');
const secrets = require('./secrets');

exports.scrape = async function(){
  // returns the content of the target trtansaction table
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setViewport({ width: 1280, height: 800 })

  // Navigate to main page
  await page.goto(secrets.url);

  // Login
  page.evaluate((secrets) => {
    document.querySelectorAll("input[name='vo.CORPCARDNO1']")[0].value = secrets.card_digits_group_1;
    document.querySelectorAll("input[name='vo.CORPCARDNO2']")[0].value = secrets.card_digits_group_2;
    document.querySelectorAll("input[name='vo.CORPCARDNO3']")[0].value = secrets.card_digits_group_3;
    document.querySelectorAll("input[name='vo.CORPCARDNO4']")[0].value = secrets.card_digits_group_4;
    document.querySelectorAll("input[name='vo.CARDPW']")[0].value = secrets.password;
    document.querySelectorAll("a[href='#']")[0].click();
  }, secrets);
  await page.waitForNavigation();

  page.evaluate(() => {
    document.querySelectorAll("a[href='#']")[0].click();
  });
  await page.waitForNavigation();

  page.evaluate(() => {
    document.querySelectorAll("input[type='button']")[0].click();
  });
  await page.waitForNavigation();

  page.evaluate(() => {
    document.querySelectorAll("a[href='#']")[2].click();
  });
  await page.waitForNavigation();

  var table_content = await page.evaluate(() => {
    var table_content = [];

    var rows = document.querySelectorAll("table")[4].querySelectorAll("tr");

    for(var row_index=2; row_index<rows.length;row_index++){

      table_content.push([]);

      var cells = rows[row_index].querySelectorAll("td");
      for(var cell_index=0; cell_index<cells.length; cell_index ++){
        var content = cells[cell_index].querySelectorAll("span")[0].innerHTML;
        table_content[table_content.length-1].push(content);
      }
      var payment_date = document.getElementById("vo.headVO.PAYDAYYMD").innerHTML;
      table_content[table_content.length-1].push(payment_date);
    }
    return table_content;
  });

  await browser.close();

  return table_content
}
