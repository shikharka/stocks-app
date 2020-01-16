const winston = require('winston');

const level = process.env.LOG_LEVEL || 'debug';

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: './logs/combined.log',
            level: level,
            timestamp: function () {
                return (new Date()).toISOString();
            }
        }),
        new winston.transports.File({
            filename: './logs/error.log',
            level: 'error',
            timestamp: function () {
                return (new Date()).toISOString();
            }
        })
    ]
});

module.exports = logger;