var url = require('url');
var fs = require('fs');
var superagent = require('superagent');
var async = require('async');

var mysql = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root'
});
connection.connect();


//	load the parameters of the function
var argu = fs.readFileSync('arguments.json', 'utf-8');
argu = JSON.parse(argu);
var range = argu.historicalDataRange;	// set the year range of data
var savedir = argu.historicalDataFileDir;


//	load the stock information from database
connection.query("select stockid,startYear from "+argu.StockDataInfoCenter+'.'+argu.StockInfoList, function(err,rows,fields){
	var stockList = [], startYear = [];
	for(var i=0; i<rows.length; i++){
		stockList.push(rows[i].stockid);
		startYear.push(rows[i].startYear);
	}

	starter(stockList.slice(0,2),startYear,argu.historicalDataFileDir,argu.historicalDatabase);
});





//	crawling tasks management function
//=====================================

function starter(stockList,startYear,savedir,database){
	// set the parameters for check the process of the tasks
	var startTime = new Date();
	var itask = -1;	// marker for each task
	var ctask = 0;	// number of finished tasks
	var sumtask = 0;	// number of total tasks
	for(var i=0; i<stockList.length; i++){
		sumtask += 4*(Math.min(startTime.getFullYear(), range[1])-Math.max(startYear[i],range[0])+1);
	}

	// check whether is a new task of running a complementary time
	if(fs.existsSync(savedir)){
		var taskTable = fs.readFileSync(savedir, 'utf-8');
		taskTable = taskTable.split(',');
	}else{
		var taskTable = [];
	}


	// task deployment
	// set parameters for concurrency running
	var concurrency = 50;	//parallal threads number
	var q = async.queue(crawler, concurrency);
	console.log("There are totally "+sumtask+" tasks");
	for(var i=0; i<stockList.length; i++){
		for(var y = Math.max(startYear[i],range[0]); y <= Math.min(startTime.getFullYear(), range[1]); y++){
			for(var l=1; l<=4 ; l++){
				itask++;

				// check whether the task has been done
				if(taskTable[itask] == 1){
					ctask++;
					console.log(stockList[i]+'_'+y+'_'+l+" done!  Tasks finished: "+ctask+"/"+sumtask+"   Time elapsed: "+(new Date()-startTime));
					if(ctask == sumtask){
						fs.unlink(savedir, function(err){
							console.log("***********  all done!!!  ***********");
							connection.end();
						});
					}
					continue;
				}else{
					taskTable[itask] = 0;
				}

				// if the task is not done, do it
				var para = {
					stock: stockList[i],
					year: y,
					quarter: l,
					savedir: savedir,
					taskID: itask,
					database: database
				}
				q.push(para, function(stock,year,quarter,taskID){
					ctask++;
					console.log(stock+'_'+year+'_'+quarter+" done!  Tasks finished: "+ctask+"/"+sumtask+"   Time elapsed: "+(new Date()-startTime));
					taskTable[taskID] = 1;
					if(ctask == sumtask){
						fs.unlink(savedir, function(err){
							console.log("***********  all done!!!  ***********");
							connection.end();
						});
					}else if(ctask%100 == 0){
						fs.writeFile(savedir, taskTable.join(','), function(err){
							console.log("      table saved !!!");
						});
					}
				});
			}
		}
	}
}



//	crawler core function
//==================================

function crawler(para, callback){
	var stock = para.stock;
	var year = para.year;
	var quarter = para.quarter;
	var savedir = para.savedir;
	var taskID = para.taskID;
	var database = para.database;

	var targetUrl = "http://vip.stock.finance.sina.com.cn/corp/go.php/vMS_FuQuanMarketHistory/stockid/"+stock+".phtml?year="+year+"&jidu="+quarter;
	var req = superagent.get(targetUrl).end(function(err,res){
		if(err){
			crawler(stock, year, quarter, savedir);
			console.log("        "+stock+" time running out");
			callback(stock,year,quarter,taskID);
			return;
		}

		//	determine the page whether contains the trading data
		var tradeDate = res.text.match(/\s+(\d{4}-\d{2}-\d{2})\s*/g)
		if(tradeDate == null){
			console.log("          ! "+stock+'_'+year+'_'+quarter+" missing");
			callback(stock,year,quarter,taskID);
			return;
		}else{
			tradeDate = tradeDate.join(',');
		}

		//	screen data from raw data
		tradeDate = tradeDate.match(/(\d{4}-\d{2}-\d{2})/g);
		var rawData = res.text.match(/<div align="center">(\d*\.?\d*)<[/]div>/g).join(',');
		rawData = rawData.match(/>(\d*\.?\d*)</g);

		if(tradeDate.length*7 != rawData.length){
			callback(stock,year,quarter,taskID);
			throw stock+" in trouble, length not match";
		}

		var data = "";
		for(var j=0; j<tradeDate.length; j++){
			var index = j*7;
			var subdata = "('"+
							tradeDate[j]+"',"+
							rawData[index].slice(1,-1)+","+
							rawData[index+1].slice(1,-1)+","+
							rawData[index+2].slice(1,-1)+","+
							rawData[index+3].slice(1,-1)+","+
							rawData[index+4].slice(1,-1)+","+
							rawData[index+5].slice(1,-1)+","+
							rawData[index+6].slice(1,-1)+
						"),";
			data = data + subdata;
		}
		data = data.slice(0,-1);

		var sql = "INSERT INTO "+database+".t"+stock+"(tradedate, open, high, close, low, vol, amount, weight) VALUES"+data;
		connection.query(sql, function(err){
			if(err){
				if(err.errno == 1062){
					console.log('		'+stock+'_'+year+'_'+quarter+" already done!");
				}else{
					console.log(err);
				}
			}
			callback(stock,year,quarter,taskID);
		});
	});
}