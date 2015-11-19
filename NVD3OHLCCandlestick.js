define(["jquery", "./d3.v3.min", "css!./nv.d3.min.css"], 
function($) {
	'use strict';
	
	return {
		initialProperties: {
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 7,
					qHeight: 1000
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1,
					max: 1
				},
				measures: {
					uses: "measures",
					min: 6,
					max: 6
				},
				sorting: {
					uses: "sorting"
				},
				settings : {
					uses : "settings",
					items : {
						chartType: {
							ref: "chartType",
							type: "string",
							component: "dropdown",
							label: "Chart Type",
							options: 
								[ {
									value: "ohlc",
									label: "OHLC"
								}, {
									value: "candlestick",
									label: "Candlestick"
								}
								],
							defaultValue: "ohlc"
						}						
					}
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
	
		paint: function ($element, layout) {
		
			drawStreamChart($element, layout);
			
		}
	};
});

function drawStreamChart($element, layout) {
			
			//create matrix variable
			var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
		
			// create a new array that contains the measure labels
			var measureLabels = layout.qHyperCube.qMeasureInfo.map(function(d) {
				return d.qFallbackTitle;
			});
			// Create a new array for our extension with a row for each row in the qMatrix
			// Filter dimesnion Null value 
			var data = qMatrix;

			// Get the selected counts for the 2 dimensions, which will be used later for custom selection logic
			var selections = {
				dim1_count: layout.qHyperCube.qDimensionInfo[0].qStateCounts.qSelected
			};
			

			// Chart object width
			var width = $element.width();
			// Chart object height
			var height = $element.height();
			// Chart object id
			var id = "container_" + layout.qInfo.qId;
		    		 
			$element.empty().append($('<div />').attr({ "id": id, "class": "qv-object-nvd3-OHLC" }).css({ height: height, width: width }));

			// Call the viz function
			viz(self, data, measureLabels, width, height, id, selections, layout, $element);
	
}
			
var viz = function (self, data, labels, width, height, id, selections, layout, $element) {

	// Get the properties
	var chartType = layout.chartType
	;
		
	// get key elements in Qlik Sense order
	var listKey = [],
		dateKey = [],
		dateVal = 0;
	$.each(data, function( index, row ) {
		dateVal = convertToUnixTime(row[0].qNum);
		if ($.inArray(dateVal, dateKey) === -1) {
			dateKey.push(dateVal);
		}
	});

	// Map the hypercube data to required format, and convert Qlik date to Unix time
	var dataNVD3 = data.map(function(row){
					return {"date" : convertToUnixTime(row[0].qNum), "open" : row[1].qNum, "high" : row[2].qNum, "low" : row[3].qNum, "close" : row[4].qNum, "volume" : row[5].qNum, "adjusted" : row[6].qNum};
				});

				
	// Transform data set into required format for NVD3
	dataNVD3 = d3.nest()
				.key(function(d) { return 'All'; })
				.entries(dataNVD3);

	
	// Set the margins of the object
	var margin = {top: 20, right: 10, bottom: 50, left: 50},
		width = width - margin.left - margin.right,
		height = height - margin.top - margin.bottom;
	
	// Create the svg element	
	var svg = d3.select("#"+id)
		.append("svg:svg");
		
	
    var chart;
	
	// Create the graph in NVD3
	nv.addGraph(function() {
		
		 // Select whether OHLC or Candlestick
	     chart = (chartType == 'ohlc' ? chart = nv.models.ohlcBarChart() : chart = nv.models.candlestickBarChart())
            .x(function(d) { return d['date'] })
            .y(function(d) { return d['close'] })
            .duration(250)
            .margin({left: 75, bottom: 50, right: 30})
            ;
		
        // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
        chart.xAxis
                .axisLabel("Dates")
				// use this tickformat for Sense Hypercube data
				.tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });
				;

        chart.yAxis
                .axisLabel('Stock Price')
                .tickFormat(function(d,i){ return d3.format(',.2f')(d); })
				;
		
		// call the chart
       d3.select('#'+id+' svg')
                .datum(dataNVD3)
                .transition().duration(500)
                .call(chart);
        nv.utils.windowResize(chart.update);
        return chart;
    });
		  
}

function dateFromQlikNumber(n) {
	var d = new Date((n - 25569)*86400*1000);
	// since date was created in UTC shift it to the local timezone
	d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
	return d;
}

function convertToUnixTime(_qNum) {
	return dateFromQlikNumber(_qNum);
}

function findDate(_date, _arr, _offset) {
	for (var i = _offset, len = _arr.length; i < len; i++) {
		if (_arr[i][0] === _date) return i;
	}
	return -1;
}

function assignDefaultValues(dates, dataset, defaultValue) {
	var newData = [],
		sortDates = function(a,b){ return a > b ? 1 : -1; },
		sortValues = function(a,b){ return a[0] > b[0] ? 1 : -1; },
		i = -1;
		
	dates.sort(sortDates);
	$.each(dataset, function(index1, setObject){
		var newValues = [],
			lastPos = 0,
			i = -1;
		setObject.values.sort(sortValues);
		$.each(dates, function(index2, theDate){
			i = findDate(theDate, setObject.values, lastPos)
			if (i === -1) {
				newValues.push([theDate,defaultValue]);
			} else {
				newValues.push([theDate,setObject.values[i][1]]);
				lastPos = i;
			}
		});
		newData.push( { key: setObject.key, seriesIndex: setObject.seriesIndex, values: newValues });
	});
	return newData;
}
