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

connection.query("drop database " + argu.updateDatabase, function(err,rows,fields){
	connection.query("create database " + argu.updateDatabase, function(err,rows,fields){
		connection.query("USE " + argu.StockDataInfoCenter);
		connection.query("select stockid from " + argu.StockInfoList, function(err, rows, fields){
			connection.query("USE " + argu.updateDatabase);
			for(var i=0; i<rows.length; i++){
				connection.query('CREATE TABLE IF NOT EXISTS t' + rows[i].stockid +
					'(' +
						'id int unsigned auto_increment primary key, ' +
						'tradedate date unique key, ' +
						'open float not null, ' +
						'high float not null, ' +
						'close float not null, ' +
						'low float not null, ' +
						'vol float not null, ' +
						'amount float not null, ' +
						'weight float not null' +
						')'
				);
			}

			connection.end();
			console.log("	*********** job done! ***********");
		});
	});
});

