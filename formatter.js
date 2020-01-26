const secrets = require('./secrets')

function format_date(date){
  return new Date("20" + date.replace(" ", ""));
}

function format_payment_date(date){
  return new Date(date.replace("年", "/").replace("月", "/").replace("日", "").replace(" ",""));
}

function format_amount(amount){
  return -Number(amount.replace("円","").replace(",",""));
}

exports.format_entries = function(table){

  var entries = [];

  for(var row_index=0; row_index<table.length; row_index++){
    if(table[row_index][6] !== '　'){
      // Valid row
      entries.push({
        date : format_date(table[row_index][0]),
        amount : format_amount(table[row_index][6]),
        description : table[row_index][2],
        account: secrets.account_name,
        currency: 'JPY'
      });
    }
  }

  return entries;
}
