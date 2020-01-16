const express = require('express');

logger = require('./lib/logger');
const quotes = require('./src/quotes');

const config = require('./config.json');

const app = express();
const PORT = config.port;

app.post('/writeQuotes', (req, res) => {
    if (!req.query.exchange) {
        console.log(`'exchange' parameter missing.`)
        logger.info(`'exchange' parameter missing.`)
    }
    else {
        console.log('/writeQuotes Called.')
        logger.info('/writeQuotes Called.')

        quotes.writeQuotes(req.query.exchange).then(response => res.send(response));
    }
});

app.get('/getQuote', (req, res) => {
    if (!req.query.exchange) {
        console.log(`'exchange' parameter missing.`)
        logger.info(`'exchange' parameter missing.`)
        return (`'exchange' parameter missing.`)
    }
    else if (!req.query.symbol) {
        console.log(`'symbol' parameter missing.`)
        logger.info(`'symbol' parameter missing.`)
        return (`'symbol' parameter missing.`)
    }
    else {
        console.log('/getQuote Called.')
        logger.info('/getQuote Called.')

        quotes.getQuote({ symbol: req.query.symbol }, req.query.exchange, 0).then(quote => res.send(quote));
    }
});


let server = app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
    logger.info(`Example app listening on port ${PORT}`);
});

server.timeout = config.timeout * 2;