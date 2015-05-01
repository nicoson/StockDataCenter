//var express = require('express');
var url = require('url');
var fs = require('fs');
var superagent = require('superagent');
//var cheerio = require('cheerio');
var async = require('async');

var begtime = new Date();

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
		fs.writeFile('Database/StockCodeListSH.json',infObjSH.StockList.join(","),function(err,fd){
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
		fs.writeFile('Database/StockCodeListSZ.json',infObjSZ.StockList.join(","),function(err,fd){
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