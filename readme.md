<h3>This package is a Crawler for sina financial</h3>
<br />


<h4>Enviroment:</h4>
nodejs, mysql
<br />


<h4>Workspace structure:</h4>
<pre>
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
</pre>
<br />


<h4>MySQL database structure:</h4>
<pre>
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
</pre>
<br />



<h4>Quick Start:</h4>
<ol>
	<li>
		<h5>package.json</h5>
		<p>set the requirement of the package.</p>
	</li>
	<br />

	<li>
		<h5>arguments.json</h5>
		<p>set the arguments for all of the js files.</p>
		<p>By setting different load file dirs, part of the js function can be reused for different set of stock list.</p>
	</li>
	<br />

	<li>
		<h5>DatabaseInit.js</h5>
		<p>initialize the mysql database.</p>
		<p>The database structure is shown up, and table structure is as following:</p>

		<pre>
table: StockInfoList
+-----------+------------------+------+-----+---------+----------------+
| Field     | Type             | Null | Key | Default | Extra          |
+-----------+------------------+------+-----+---------+----------------+
| id        | int(10) unsigned | NO   | PRI | NULL    | auto_increment |
| stockid   | char(6)          | NO   | UNI | NULL    |                |
| stocktype | int(10) unsigned | NO   |     | NULL    |                |
| startYear | int(10) unsigned | NO   |     | NULL    |                |
+-----------+------------------+------+-----+---------+----------------+
		</pre>
	</li>
	<br />

	

	<li>
		<h5>sinaStockCodeListGet.js</h5>
		<p>crawl the stock code list for both Shanghai Stock Exchange and Shenzhen Stock Exchange.</p>
		<ol>
			<li>result files:
				<p>"Database/StockCodeListSH.json": is the result for SHSE</p>
				<p>"Database/StockCodeListSZ.json": is the result for SZSE</p>
			</li>
			<li>file type: string array</li>
		</ol>
	</li>
	<br />

	<li>
		<h5>sinaStockPageInfoGet.js</h5>
		<p>crawl the first page for each stocks, to detect the parameters for crawling. save the data both in local json file and in mysql database.</p>
		<ol>
			<li>
				dependent step:
				<p>[2].DatabaseInit.js, [3].sinaStockCodeListGet.js</p>
			</li>
			<li>
				result files:
				<p>"Database/StockYearList.json": is the result for SHSE and SZSE</p>
			</li>
			<li>file type: string array</li>
		</ol>
	</li>
	<br />

	<li>
		<h5>SubDatabaseInit.js</h5>
		<p>initialize the historicalDatabase and updateDatebase, create one table for each stock. The structure is shown as follows:</p>

		<p>dependent step:</p>
		<p>[2].DatabaseInit.js, [4].sinaStockPageInfoGet.js</p>

		<pre>
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
		</pre>
	</li>
	<br />

	

	<li>
		<h5>sinaStockDataCrawler.js</h5>
		<p>crawl the stock trading data for each stocks</p>
		
		<ol>
			<li>
				dependent step:
				<p>[4].sinaStockPageInfoGet.js; [5].SubDatabaseInit.js</p>
			</li>
			
			<li>
				result files:
				<p>database: historicalDatabase</p>
				<p>table: tcccccc (eg. t600000)</p>
				<p>table structure is defined in [5]</p>
			</li>
			<li>*template log files:
				<p>"Database/crawlerTaskTable_his.json":</p>
				<p>record the process for one task group. if the task group is interrupted, then run the js file again, the program will just skip the completed files.</p>
			</li>
		</ol>
	</li>
	<br />


	<li>
		<h5>sinaStockDataUpdate.js</h5>
		<p>update the new trading data to a different directory</p>
		<ol>
			<li>dependent step:
				<p>[4].sinaStockPageInfoGet.js; [5].SubDatabaseInit.js</p>
			</li>
			<li>
				result files:
				<p>database: historicalDatabase</p>
				<p>table: tcccccc (eg. t600000)</p>
				<p>table structure is defined in [5]</p>
			</li>

			<li>
				template log files:
				<p>"Database/crawlerTaskTable_up.json":</p>
				<p>record the process for one task group. if the task group is interrupted, then run the js file again, the program will just skip the completed files.</p>
			</li>
			<li>
				parameter set:
				<p>(1) updateDataRange: [year startquarter endquarter], usually set to be a closest quarter;</p>
				<p>(2) updateStockCodeListLoadDir: the stock code list for update</p>
				<p>(3) updateDataFileDir: set the directory where to store the data</p>
			</li>
		</ol>
	</li>
</ol>