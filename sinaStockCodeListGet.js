//var express = require('express');
var url = require('url');
var fs = require('fs');
var superagent = require('superagent');
//var cheerio = require('cheerio');
var async = require('async');

var begtime = new Date();

// load the arugments
var argu = fs.readFileSync('arguments.json', 'utf-8');
argu = JSON.parse(argu);
var savedir_sh = argu.StockCodeListSaveDirSH;
var savedir_sz = argu.StockCodeListSaveDirSZ;


// set global object to share the information between each thread
function infObj(){
	this.page = 1;
	this.flag = true;
	this.StockList = [];
}

infObjSH = new infObj;
async.whilst(
	function () { return infObjSH.flag; },
	function (callback) { loadProcess(callback,'sh_a',infObjSH); },
	function (err) {
		fs.writeFile(savedir_sh, infObjSH.StockList.join(","),function(err,fd){
			if(err) throw err;
			var endtime = new Date();
			console.log("SHSE done!  "+(endtime.getTime()-begtime.getTime()));
			console.log(infObjSH.StockList.length);
		});
	}
);

infObjSZ = new infObj;
async.whilst(
	function () { return infObjSZ.flag; },
	function (callback) { loadProcess(callback,'sz_a',infObjSZ); },
	function (err) {
		fs.writeFile(savedir_sz,infObjSZ.StockList.join(","),function(err,fd){
			if(err) throw err;
			var endtime = new Date();
			console.log("SZSE done!  "+(endtime.getTime()-begtime.getTime()));
			console.log(infObjSZ.StockList.length);
		});
	}
);



//tool functions
//==========================================
function loadProcess(callback, market, infObj) {
	var targetUrl = 'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?page='+infObj.page+'&num=1000&sort=symbol&asc=1&node='+market+'&symbol=&_s_r_a=init';
	superagent.get(targetUrl).end(function(err,res){
		if(res.text != "null"){
			var result = res.text.match(/("\w\w\d{6}")/g);
			infObj.StockList = infObj.StockList.concat(result);
			infObj.page++;
		}else{
			infObj.flag = false;
		}

		callback();
	});
}