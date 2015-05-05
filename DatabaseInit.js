var fs = require('fs');
var mysql = require('mysql');

var argu = fs.readFileSync('arguments.json', 'utf-8');
argu = JSON.parse(argu);

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root'
});
connection.connect();

connection.query('CREATE DATABASE IF NOT EXISTS ' + argu.StockDataInfoCenter + ' CHARACTER SET = UTF8', function(err, rows, fields) {
	if (err) throw err;
	console.log('database established');
});

connection.query('CREATE DATABASE IF NOT EXISTS ' + argu.historicalDatabase + ' CHARACTER SET = UTF8', function(err, rows, fields) {
	if (err) throw err;
	console.log('database established');
});

connection.query('CREATE DATABASE IF NOT EXISTS ' + argu.updateDatabase + ' CHARACTER SET = UTF8', function(err, rows, fields) {
	if (err) throw err;
	console.log('database established');
});

connection.query('USE ' + argu.StockDataInfoCenter);

connection.query('CREATE TABLE IF NOT EXISTS ' + argu.StockInfoList +
	'(' +
		'id int unsigned auto_increment primary key, ' +
		'stockid char(6) unique key not null, ' +
		'stocktype int unsigned not null, ' +
		'startYear int unsigned not null' +
	')'
);
console.log('table created!');



// connection.query('CREATE TABLE IF NOT EXISTS ' + historicalDataTable +
// 	'(' +
// 		'id int unsigned auto_increment primary key, ' +
// 		'tradedate date unique key, ' +
// 		'open float not null, ' +
// 		'high float not null, ' +
// 		'close float not null, ' +
// 		'low float not null, ' +
// 		'vol float not null, ' +
// 		'amount float not null, ' +
// 		'weight float not null' +
// 	')'
// );

// connection.query('CREATE TABLE IF NOT EXISTS ' + updateDataTable + 

// );

connection.end();

console.log("	*********** job done! ***********")