var fs = require('fs');
var async = require('async');

var argu = fs.readFileSync('arguments.json', 'utf-8');
argu = JSON.parse(argu);
var range = argu.historicalDataRange;	// set the year range of data
var stockCodeDir = argu.StockCodeListLoadDir;
var loadFileDir = argu.historicalDataFileDir;
var savedir = argu.mergerDataFileDir;


//	load the stock information
var stockList = [];
for(var i = 0; i < stockCodeDir.length; i++){
	var list = fs.readFileSync(stockCodeDir[i], 'utf-8');
	list = list.match(/\d{6}/g);
	stockList = stockList.concat(list);
}


var i = 0;
var database = [];
var loop = (range[1]-range[0]+1)*4;
var index = [];
for(var year=range[0]; year<=range[1]; year++){
	for(var q=1; q<=4; q++){
		filename = loadFileDir+stockList[i]+'_'+year+'_'+q+'.json';
		if(fs.existsSync(filename)){
			fs.readFile(filename, 'utf-8', function(err,data){
				debugger;
				database = database.concat(JSON.parse(data));
				index++;
				if(index == loop){
					fs.writeFile(savedir+stockList[i]+'_'+range[0]+'_'+range[1]+'.json', JSON.stringify(database), function(err){
						console.log('	**********  job done  **********');
					});
				}
			});
		}else{
			index++;
			if(index == loop){
				fs.writeFile(savedir+stockList[i]+'_'+range[0]+'_'+range[1]+'.json', JSON.stringify(database), function(err){
					console.log('	**********  job done  **********');
				});
			}
		}
	}
}
