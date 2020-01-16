const cheerio = require('cheerio');

const config = require('../config.json');

const axios = require('axios').create();
axios.defaults.timeout = config.timeout;

const logger = require('../lib/logger');
const QuoteProto = require('./quoteProto');

const yahooFinUrl = 'https://in.finance.yahoo.com/quote/'

let successHandler = (response, symbol) => {
    if (response.status === 200) {
        //Loads html in iterable format for cheerio
        const $ = cheerio.load(response.data);

        //Extracting Values from DOM
        const close = $('#atomic').find("span[class*='Trsdu']").first().text();
        const prevClose = $('[data-test="PREV_CLOSE-value"]').text();
        const open = $('[data-test="OPEN-value"]').text();
        const volume = $('[data-test="TD_VOLUME-value"]').text();
        const avgVolume3Months = $('[data-test="AVERAGE_VOLUME_3MONTH-value"]').text().replace(/,/g, '');
        const marketCap = $('[data-test="MARKET_CAP-value"]').text();
        const monthly5Years = $('[data-test="BETA_5Y-value"]').text();
        const peRatio = $('[data-test="PE_RATIO-value"]').text();
        const epsRatio = $('[data-test="EPS_RATIO-value"]').text();

        let currQuote = new QuoteProto(parseFloat(close), parseFloat(prevClose), parseFloat(open), parseFloat(volume), parseFloat(avgVolume3Months), parseFloat(marketCap), parseFloat(monthly5Years), parseFloat(peRatio), parseFloat(epsRatio));
        logger.info(`Quote scraped for ${symbol} ======>  ${JSON.stringify(currQuote)}`)

        //returns object of type currentQuotes. Convert String Values to Float.
        return currQuote;
    }
}

// Function to Scrap Data from Yahoo Finance. Accepts stock-symbol and stock exchange(NS for NSE/ BO for BSE).
let scrapeQuotes = (symbol, exchange) => {
    logger.info(`Scrapping quote for ${symbol}`)
    //Try block for NSE and BSE exchange. For other values will throw error.
    try {
        exchange = (exchange == 'NSE') ? 'NS' : ((exchange == 'BSE') ? 'BO' : '');
        if (exchange === '') {
            throw 'Invalid Exchange';
        }
    }
    catch (e) {
        logger.error(e)
        return new Promise((resolve, reject) => {
            resolve(e);
        });
    }
    const url = yahooFinUrl + symbol + '.' + exchange;

    return axios.get(url) //Get yahoo finance page
        .then(response => successHandler(response, symbol))
        .catch(error => logger.error(`Error Occurred for ${symbol} ======> /n ${error}`));
}

exports.scrapeQuotes = scrapeQuotes;
