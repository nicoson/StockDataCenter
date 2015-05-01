var url = require('url');
var fs = require('fs');
var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');

// load the arugments
var argu = fs.readFileSync('arguments.json', 'utf-8');
argu = JSON.parse(argu);
var filedir = argu.StockCodeListLoadDir;
var savedir = argu.StockYearListSaveDir;

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

// set concurrency and run
var concounter = 100; //parallal threads number
var asyncScan = new asyncScan(concounter, stockList, startYearList, savedir);
asyncScan.init();

// var stockList = fs.readFileSync('Database/StockCodeListSH.json', 'utf-8');
// stockList = stockList.match(/(\d{6})/g);
// var savedir = 'Database/StockYearListSZ.json';
// var asyncScanSZ = new asyncScan(concounter, stockList, savedir);
// asyncScanSZ.init();
// }







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
debugger;
			this.data.counter++;
			this.coreFn(this.data.stockList[this.data.counter], this.data.counter, this.data);
			i++;
		}
	};

	this.coreFn = function(stock,num,data){
		if(/\d{4}/.test(data.startYearList[num])){
			console.log(num+": "+stock+" already done !  "+(new Date()-data.begtime)+'ms  '+data.resolvecounter);
			data.resolvecounter++;
			if(data.counter < data.stockList.length-1){
				data.counter++;
				asyncScan.coreFn.call('',data.stockList[data.counter], data.counter, data);
			}
			return;
		}
debugger;
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
			console.log(num+": "+stock+" "+firstYear+" "+(new Date()-data.begtime)+'ms   '+data.resolvecounter);
			data.startYearList[num] = firstYear;
			data.resolvecounter++;
debugger;
			if(data.resolvecounter == data.stockList.length){
				fs.writeFile(data.savedir, data.startYearList.join(','), function(err){
					console.log("  *************  job done! *************");
				});
			}else if(data.counter < data.stockList.length-1){
				data.counter++;
				asyncScan.coreFn.call('',data.stockList[data.counter], data.counter, data);
				if(data.counter%100 == 0){
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