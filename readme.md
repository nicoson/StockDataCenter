This package is a Crawler for sina financial

Enviroment:
	nodejs

Workspace structure:

	StockDataCenter
		.  
		├── package.json  
		├── readme.md
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
		    ├── StockYearListSH.json
		    ├── StockYearListSZ.json
		    ├── 
		    ├── 
			├── HistoricalQuarterData
		    │   ├── 600000_1999_4.json
		    │   └── ... 
		    │
		    ├── HistoricalMergerData
		    │   ├── 600000_1999_2014.json
		    │   └── ... 
		    │
		    └── UpdateQuarterDatabase
		        ├── 600000.2015.1.json
		        └── ... 



Quick Start:
	1. package.json
		set the requirement of the package;
	2. sinaStockCodeListGet.js
		crawl the stock code list for both Shanghai Stock Exchange and Shenzhen Stock Exchange.

		2.1 result files:
			"Database/StockCodeListSH.json": is the result for SSE
			"Database/StockCodeListSZ.json": is the result for SZE

		2.2 file type: string array

	3. sinaStockPageInfoGet.js
		crawl the first page for each stocks, to detect the parameters for crawling.

		3.0 dependent step:
			[2].sinaStockCodeListGet.js

		3.1 result files:
			"Database/StockYearListSH.json": is the result for SSE

		3.2 file type: string array

	4. sinaStockDataCrawler.js
		crawl the stock trading data for each stocks

		4.0 dependent step:
			[3].sinaStockPageInfoGet.js

		4.1 result files:
			"Database/HistoricalQuarterData/cccccc_yyyy_q": the 'q'th quarter data for year 'yyyy' for stock 'cccccc'

		4.2 file type: JSON data file

	   *4.3 template log files:
			"Database/HistoricalQuarterData/taskTable":
				record the process for one task group. if the task group is interrupted, then run the js file again, the program will just skip the completed files.

	5. 