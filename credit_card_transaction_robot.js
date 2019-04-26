const phantom = require('phantom');
const mongodb = require('mongodb');
const schedule = require ('node-schedule');

const credentials = require('./config/credentials');
const misc_config = require('./config/misc_config');
const DB_config = require('./config/db_config');
const credit_card = require('./config/credit_card');

var MongoClient = mongodb.MongoClient;

process.env.TZ = 'Asia/Tokyo';


// Helper function to format entries
function format_entries(table){

  var entries = [];

  function format_date(date){
    return new Date("20" + date.replace(" ", ""));
  }

  function format_payment_date(date){
    return new Date(date.replace("年", "/").replace("月", "/").replace("日", "").replace(" ",""));
  }

  function format_amount(amount){
    return amount.replace("円","").replace(",","");
  }

  for(var row_index=0; row_index<table.length; row_index++){
    if(table[row_index][6] !== '　'){
      // Valid row
      var entry = {};
      entry.date = format_date(table[row_index][0])
      entry.transaction_amount = format_amount(table[row_index][6]);
      entry.description = format_amount(table[row_index][2]);
      entry.payment_date = format_payment_date(table[row_index][7]);
      entries.push(entry);
    }
  }

  return entries;
}

// Helper function to store result in a MongoDB database
function store_in_mongodb(entries){

  MongoClient.connect(DB_config.DB_URL,{ useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);

    entries.forEach((entry) => {

      var query = entry;
      var action = {$set: entry};
      var options = {upsert: true};

      dbo.collection(DB_config.collection_name).updateOne(query, action, options, function(err, res) {
        if (err) throw err;
      });
    });
    db.close();
  });
}

// Function running PhantomJS to get balance from ebanking web interface
async function scrape_transactions(url, credentials) {

  var action_index = 0;

  console.log("scraping transactions");

  const instance = await phantom.create();
  const page = await instance.createPage();

  await page.on('onLoadStarted', function() {
    console.log("onLoadStarted");
  });

  await page.on('onLoadFinished', async function() {
    console.log("onLoadFinished");
    await execute_next_action();

  });

  async function execute_next_action(){
    console.log("Executing action " + action_index);

    // take a screenshot
    if(action_index !== 0){
      await page.render("steps_screenshots/action_" + action_index +".pdf");
    }

    actions[action_index]();
    action_index ++;
  }

  var actions = [
    async function(){
      await page.open(url);
    },
    async function(){
      await page.evaluate(function(credentials) {

        document.querySelectorAll("input[name='vo.CORPCARDNO1']")[0].value = credentials.card_digits_group_1;
        document.querySelectorAll("input[name='vo.CORPCARDNO2']")[0].value = credentials.card_digits_group_2;
        document.querySelectorAll("input[name='vo.CORPCARDNO3']")[0].value = credentials.card_digits_group_3;
        document.querySelectorAll("input[name='vo.CORPCARDNO4']")[0].value = credentials.card_digits_group_4;
        document.querySelectorAll("input[name='vo.CARDPW']")[0].value = credentials.password;

        document.querySelectorAll("a[href='#']")[0].click();
      }, credentials);
    },
    async function(){
      await page.evaluate(function() {
        document.querySelectorAll("a[href='#']")[0].click();
      });
    },
    async function(){
      await page.evaluate(function() {
        document.querySelectorAll("input[type='button']")[0].click();
      });
    },
    async function(){
      await page.evaluate(function() {
        document.querySelectorAll("a[href='#']")[2].click();
      });
    },
    async function(){

      var table_content = await page.evaluate(function() {
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
      await instance.exit();



      var entries = format_entries(table_content);

      console.log(entries);

      store_in_mongodb(entries);
    },

  ];

  // start chain of action
  await execute_next_action();

}

// Check balance periodically
schedule.scheduleJob('0 5 * * *', () => {
  scrape_transactions(credit_card.login_url,credentials);
});

// Run once
//scrape_transactions(credit_card.login_url,credentials);
