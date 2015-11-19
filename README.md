Qlik Sense NVD3 OHLC and Candlestick Extension
===================================
An open-high-low-close chart (also OHLC chart, or simply bar chart) is a type of chart typically used to illustrate movements in the price of a financial instrument over time. Each vertical line on the chart shows the price range (the highest and lowest prices) over one unit of time, e.g., one day or one hour. Tick marks project from each side of the line indicating the opening price (e.g., for a daily bar chart this would be the starting price for that day) on the left, and the closing price for that time period on the right. The bars may be shown in different hues depending on whether prices rose or fell in that period.

A candlestick chart is a style of financial chart used to describe price movements of a security, derivative, or currency. Each "candlestick" typically shows one day; so for example a one-month chart may show the 20 trading days as 20 "candlesticks".
It is like a combination of line-chart and a bar-chart: each bar represents all four important pieces of information for that day: the open, the close, the high and the low.

This extension takes the core implementation of OHLC and Candlestick charts from NVD3 (https://nvd3-community.github.io/nvd3/examples/candlestickChart.html) and adapts it to be used in Qlik Sense.  Note that native Sense Selections are supported, but selections made from the NVD3 chart area currently do NOT send the selections back to Sense.

An example (OHLC.qvf) is included.

![Qlik Sense NVD3 OHLC and Candlestick Extension](OHLC and Candlestick.gif)
Using OHLC and Candlestick charts

Dimensions and Measures (all mandatory)
======================================

Dimension 1 - Stock Date (in Qlik date format)
Measure 1 - Open stock price
Measure 2 - High stock price
Measure 3 - Low stock price
Measure 4 - Close stock price
Measure 5 - Volume
Measure 6 - Adjusted stock price

Properties
==========

Chart Type - OHLC or CandleStick.

Notes
=====

The only dimension (Date) always needs to be top of the Sorting properties of the extension.
The date used as a dimension must be a true Qlik Date.

Future Improvements
===================

1. Connect to Google/Yahoo Finance API and download Stock data that the user selects