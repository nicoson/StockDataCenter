var url = require('url');
var fs = require('fs');
var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');

var concounter = 60; //parallal threads number

var stockList = fs.readFileSync('Database/StockCodeListSH.json', 'utf-8');
stockList = stockList.match(/(\d{6})/g);
var savedir = 'Database/StockYearListSH.json';
var asyncScan = new asyncScan(concounter, stockList, savedir);
asyncScan.init();

// var stockList = fs.readFileSync('Database/StockCodeListSH.json', 'utf-8');
// stockList = stockList.match(/(\d{6})/g);
// var savedir = 'Database/StockYearListSZ.json';
// var asyncScanSZ = new asyncScan(concounter, stockList, savedir);
// asyncScanSZ.init();
// }







//======================================================

function asyncScan(concounter,stockList,savedir){
	this.data = {
		counter: 0,
		stockList: stockList,
		concounter: Math.min(concounter,stockList.length),
		resolvecounter: 0,
		begtime: new Date(),
		startYearList: [],
		savedir: savedir
	};

	this.data.year = this.data.begtime.getFullYear();
	this.data.quarter = Math.ceil((this.data.begtime.getMonth()+1)/3);


	this.init = function(){
		for(this.data.counter = 0; this.data.counter<this.data.concounter; this.data.counter++){
			this.coreFn(this.data.stockList[this.data.counter], this.data.counter, this.data);
		}
		this.data.counter--;  //adjust the counter
	};

	this.coreFn = function(stock,num,data){
		var targetUrl = "http://vip.stock.finance.sina.com.cn/corp/go.php/vMS_MarketHistory/stockid/"+stock+".phtml?year="+data.year+"&jidu="+data.quarter;
		var req = superagent.get(targetUrl).end(function(err,res){
			if(err) {
				asyncScan.coreFn.call('',data.stockList[num], num, data);
				console.log("        "+data.stockList[num]+"; process: "+data.resolvecounter);
				return;
			} //if timeout redo

			$ = cheerio.load(res.text);
			firstYear = $("select[name='year']>option:last-child").html();
			console.log(num+": "+stock+" "+firstYear+" "+(new Date()-data.begtime));
			data.startYearList[num] = firstYear;
			data.resolvecounter++;
			
			if(data.counter < data.stockList.length-1){
				data.counter++;
				asyncScan.coreFn.call('',data.stockList[data.counter], data.counter, data);
			}else if(data.resolvecounter == data.stockList.length){
				fs.writeFile(data.savedir, data.startYearList.join(','), function(err){
					console.log("done!");
				});
			}
		});

		// (function(req,data,num){
		// 	setTimeout(function(){
		// 		debugger;
		// 		req.abort();
		// 				//console.log(data.stockList[num])
		// 			},3000);
		// })(req);
	}
}