const dotenv = require('dotenv')
dotenv.config()

const amount_col = 6

const {
  FINANCES_API_ACCOUNT_NAME
} = process.env

function format_date(date){
  return new Date("20" + date.replace(" ", ""));
}

const format_payment_date = (date_string) => {
  const date_string_formatted = date.replace("年", "/")
    .replace("月", "/")
    .replace("日", "")
    .replace(" ","")

  return new Date(date_string_formatted)
}

function format_amount(amount_string){

  const amount_string_formatted = amount_string
    .replace("円","")
    .replace(",","")

  return -Number(amount_string_formatted)
}

exports.format_entries = (table) => {

  var entries = [];

  for(var row_index=0; row_index<table.length; row_index++){
    if(table[row_index][amount_col] !== '　'){
      // Valid row
      entries.push({
        date: format_date(table[row_index][0]),
        amount: format_amount(table[row_index][amount_col]),
        description: table[row_index][2],
        account: FINANCES_API_ACCOUNT_NAME,
        currency: 'JPY'
      });
    }
  }

  console.log(entries);

  return entries;
}
