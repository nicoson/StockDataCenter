<h3>This package is a Crawler for sina financial</h3>

<h4>Enviroment:</h4>
nodejs, mysql

<h4>Workspace structure:</h4>

StockDataCenter
.  
├── package.json
├── arguments.json
├── readme.md
├── mySQLDatabaseInit.js
├── sinaStockCodeListGet.js
├── sinaStockPageInfoGet.js
├── sinaStockDataCrawler.js
├── 
├── node_modules  
│   ├── async  
│   └── ... 
│	
└── Database  
├── StockCodeListSH.json
├── StockCodeListSZ.json
└── StockYearList.json


<h4>MySQL database structure:</h4>

├── StockDataInfoCenter
│   ├── StockInfoList
│   └── ... 
│
├── historicalDatabase
│   ├── t600000
│   └── ... 
│
└── updateDatabase
├── t600000
└── ... 



<h4>Quick Start:</h4>
<ol>
	<li>0. package.json</li>
	set the requirement of the package;

	<li>1. arguments.json
	<li>set the arguments for all of the js files.</li>
	<li>By setting different load file dirs, part of the js function can be reused for different set of stock list.</li>
	</li>
	<li>2. DatabaseInit.js
	initialize the mysql database.
	The database structure is shown up, and table structure is as following:

	table: StockInfoList
	+-----------+------------------+------+-----+---------+----------------+
	| Field     | Type             | Null | Key | Default | Extra          |
	+-----------+------------------+------+-----+---------+----------------+
	| id        | int(10) unsigned | NO   | PRI | NULL    | auto_increment |
	| stockid   | char(6)          | NO   | UNI | NULL    |                |
	| stocktype | int(10) unsigned | NO   |     | NULL    |                |
	| startYear | int(10) unsigned | NO   |     | NULL    |                |
	+-----------+------------------+------+-----+---------+----------------+
</li>


<li>3. sinaStockCodeListGet.js
	crawl the stock code list for both Shanghai Stock Exchange and Shenzhen Stock Exchange.

	3.1 result files:
	"Database/StockCodeListSH.json": is the result for SHSE
	"Database/StockCodeListSZ.json": is the result for SZSE

	3.2 file type: string array
</li>
<li>4. sinaStockPageInfoGet.js
	crawl the first page for each stocks, to detect the parameters for crawling. save the data both in local json file and in mysql database.

	4.0 dependent step:
	[2].DatabaseInit.js, [3].sinaStockCodeListGet.js

	4.1 result files:
	"Database/StockYearList.json": is the result for SHSE and SZSE

	4.2 file type: string array
</li>
<li>5. SubDatabaseInit.js
	initialize the historicalDatabase and updateDatebase, create one table for each stock. The structure is shown as follows:

	5.0 dependent step:
	[2].DatabaseInit.js, [4].sinaStockPageInfoGet.js

	table: tcccccc (eg. t600000)
	+-----------+------------------+------+-----+---------+----------------+
	| Field     | Type             | Null | Key | Default | Extra          |
	+-----------+------------------+------+-----+---------+----------------+
	| id        | int(10) unsigned | NO   | PRI | NULL    | auto_increment |
	| tradedate | date             | YES  | UNI | NULL    |                |
	| open      | float            | NO   |     | NULL    |                |
	| high      | float            | NO   |     | NULL    |                |
	| close     | float            | NO   |     | NULL    |                |
	| low       | float            | NO   |     | NULL    |                |
	| vol       | float            | NO   |     | NULL    |                |
	| amount    | float            | NO   |     | NULL    |                |
	| weight    | float            | NO   |     | NULL    |                |
	+-----------+------------------+------+-----+---------+----------------+
</li>


<li>6. sinaStockDataCrawler.js
	crawl the stock trading data for each stocks

	6.0 dependent step:
	[4].sinaStockPageInfoGet.js; [5].SubDatabaseInit.js

	6.1 result files:
	database: historicalDatabase
	table: tcccccc (eg. t600000)
	table structure is defined in [5]

	*6.2 template log files:
	"Database/crawlerTaskTable_his.json":
	record the process for one task group. if the task group is interrupted, then run the js file again, the program will just skip the completed files.
</li>
<li>7. sinaStockDataUpdate.js
	update the new trading data to a different directory

	7.0 dependent step:
	[4].sinaStockPageInfoGet.js; [5].SubDatabaseInit.js

	7.1 result files:
	database: historicalDatabase
	table: tcccccc (eg. t600000)
	table structure is defined in [5]

	7.2 template log files:
	"Database/crawlerTaskTable_up.json":
	record the process for one task group. if the task group is interrupted, then run the js file again, the program will just skip the completed files.

	7.3 parameter set:
	(1) updateDataRange: [year startquarter endquarter], usually set to be a closest quarter;
	(2) updateStockCodeListLoadDir: the stock code list for update
	(3) updateDataFileDir: set the directory where to store the data
</li>
</ol>