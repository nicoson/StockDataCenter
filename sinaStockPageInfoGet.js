var url = require('url');
var fs = require('fs');
var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');
var mysql = require('mysql');

// load the arugments
var argu = fs.readFileSync('arguments.json', 'utf-8');
argu = JSON.parse(argu);
var filedir = argu.StockCodeListLoadDir;
var savedir = argu.StockYearListSaveDir;
var database = argu.StockDataInfoCenter;
var table = argu.StockInfoList;

// load the stock code list
var stockList = [];
for(var i = 0; i<filedir.length; i++){
	var list = fs.readFileSync(filedir[i], 'utf-8');
	list = list.match(/(\d{6})/g);
	stockList = stockList.concat(list);
}

// load the uncomplete file
if(fs.existsSync(savedir)){
	var startYearList = fs.readFileSync(savedir, 'utf-8');
	startYearList = startYearList.split(',');
}else{
	var startYearList = [];
}

// connect to the database
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root'
});
connection.connect();
connection.query("USE " + database);

// set concurrency and run
var concounter = 100; //parallal threads number
var asyncScan = new asyncScan(concounter, stockList, startYearList, savedir);
asyncScan.init();







//======================================================

function asyncScan(concounter,stockList,startYearList,savedir){
	this.data = {
		counter: -1,
		stockList: stockList,
		concounter: Math.min(concounter,stockList.length),
		resolvecounter: 0,
		begtime: new Date(),
		startYearList: startYearList,
		savedir: savedir
	};

	this.data.year = this.data.begtime.getFullYear();
	this.data.quarter = Math.ceil((this.data.begtime.getMonth()+1)/3);


	this.init = function(){
		var i = 0;
		while(i < this.data.concounter && this.data.counter < this.data.stockList.length-1){
			this.data.counter++;
			this.coreFn(this.data.stockList[this.data.counter], this.data.counter, this.data);
			i++;
		}
	};

	this.coreFn = function(stock,num,data){
		if(/\d{4}/.test(data.startYearList[num])){
			data.resolvecounter++;
			console.log(num+": "+stock+" already done !  "+(new Date()-data.begtime)+'ms  '+data.resolvecounter);
			if(data.counter < data.stockList.length-1){
				data.counter++;
				asyncScan.coreFn.call('',data.stockList[data.counter], data.counter, data);
			}
			return;
		}

		var targetUrl = "http://vip.stock.finance.sina.com.cn/corp/go.php/vMS_MarketHistory/stockid/"+stock+".phtml?year="+data.year+"&jidu="+data.quarter;
		var req = superagent.get(targetUrl).end(function(err,res){
			if(err) {
				asyncScan.coreFn.call('',data.stockList[num], num, data);
				console.log("        "+data.stockList[num]+"; process: "+data.resolvecounter);
				console.log("        "+err);
				return;
			} //if timeout redo

			$ = cheerio.load(res.text);
			firstYear = $("select[name='year']>option:last-child").html();
			data.resolvecounter++;
			console.log(num+": "+stock+" "+firstYear+" "+(new Date()-data.begtime)+'ms   '+data.resolvecounter);
			data.startYearList[num] = firstYear;

			if(data.resolvecounter == data.stockList.length){
				fs.writeFile(data.savedir, data.startYearList.join(','), function(err){
debugger;
					var val = '';
					for(var i=0; i<data.stockList.length; i++){
						if(data.stockList[i][0] == '6'){
							val = val + "('" + data.stockList[i] +"', 1, "+ data.startYearList[i] +"),";
						}else if(data.stockList[i][0] == '0'){
							val = val + "('" + data.stockList[i] +"', 2, "+ data.startYearList[i] +"),";
						}else{
							val = val + "('" + data.stockList[i] +"', 3, "+ data.startYearList[i] +"),";
						}
					}
					val = val.slice(0,-1);
debugger;
					connection.query("INSERT INTO "+table+"(stockid,stocktype,startYear) VALUES"+ val, function(err){
						console.log(err);
						console.log("	elapsed: "+(new Date()-data.begtime)+'ms   ');
						console.log("	*************  job done! *************");
						connection.end();
					});
					
				});
			}else if(data.counter < data.stockList.length-1){
				data.counter++;
				asyncScan.coreFn.call('',data.stockList[data.counter], data.counter, data);
				if(data.resolvecounter%50 == 0){
					fs.writeFile(data.savedir, data.startYearList.join(','), function(err){
						console.log("      table saved !!!");
					});
				}
			} 
		});

		// (function(req,data,num){
		// 	setTimeout(function(){
		// 		req.abort();
		// 				//console.log(data.stockList[num])
		// 	},3000);
		// })(req);
}
}