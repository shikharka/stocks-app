const fs = require('fs');
const progressBar = require('progress');

logger = require('../lib/logger');
const scrape = require('./scrape');
const mongoose = require('../lib/mongoose');
const QuoteProto = require('./quoteProto');

const nseEquities = require('../db/equityList/equitiesList.json');
const config = require('../config.json');

const MAXTRY = config.maxTry;

let getQuote = (stock, exchange, tryCount) => {
    return scrape.scrapeQuotes(stock.symbol, exchange)
        .then(quote => {
            if (quote.__proto__ === QuoteProto.prototype) {
                return quote;
            }
            else {
                if (tryCount < MAXTRY) {
                    tryCount++;
                    logger.info(`Couldn't get quote for  ${stock.symbol}. Trying again (${tryCount})`);
                    return getQuote(stock, exchange, tryCount).then(quote => quote);
                }
            }
        })
        .catch(error => {
            logger.error(`Error for ${stock.symbol} ====> ${error}`);
            throw (error);
        })
}

let writeQuotes = (exchange) => {
    logger.info(`Scrapping quotes for ${exchange}`)

    let now = new Date();
    let collection = now.getFullYear() + "-" + now.getMonth() + 1 + "-" + now.getDate();

    let bar = new progressBar('Data Retrieved [:bar] :current/:total :percent :etas', { total: nseEquities.length, complete: "#", incomplete: ' ', width: 60 });

    return Promise.all(
        nseEquities.map((stock, index) => {
            return new Promise((resolve, reject) => {
                setTimeout(async (index) => {
                    let quote = await getQuote(stock, exchange, 0).then(quote => quote)
                    bar.tick();
                    if (quote) {
                        quote.symbol = stock.symbol;
                        resolve(quote);
                    }
                }, index * 500);
            })
        })
    ).then(result => {
        let closeCollection = {}
        closeCollection.date = now;

        result.map(quote => {
            closeCollection[quote.symbol] = (isNaN(quote.close)) ? null : quote.close;
        })

        let volumeCollection = {}
        volumeCollection.date = now;

        result.map(quote => {
            volumeCollection[quote.symbol] = (isNaN(quote.volume)) ? null : quote.volume;
        })

        return new Promise((resolve, reject) => {
            mongoose.insertClose(closeCollection)
                .then(() => {
                    logger.info(`Close for ${closeCollection.date} inserted`)
                    return mongoose.insertVolume(volumeCollection)
                })
                .then(() => {
                    logger.info(`Volume for ${volumeCollection.date} inserted`)
                    console.log('Insert Complete')
                    resolve('Insert Complete')
                })
                .catch(error => {
                    logger.error(`Error while inserting: ${error}`)
                    reject(`Error while inserting: ${error}`)
                })
        })
    })
}

exports.writeQuotes = writeQuotes
exports.getQuote = getQuote