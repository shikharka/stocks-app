const mongoose = require('mongoose');

let logger = require('./logger');

const nseEquities = require('../db/equityList/equitiesList.json');
const config = require('../config.json');

const CONNECTIONURL = config.connectionURL;
const DBNAME = config.databaseName;

let genericModel = () => {
    let obj = {};
    obj.date = { type: Date, default: Date.now };
    for (var i = 0; i < nseEquities.length; i++) {
        obj[nseEquities[i].symbol] = {
            type: Number
        };
    }
    return obj;
}

mongoose.connect(`${CONNECTIONURL}/${DBNAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const Close = mongoose.model('Close', genericModel())
const Volume = mongoose.model('Volume', genericModel())

let insertClose = (_closeCollection) => {
    const close = new Close(_closeCollection)
    return close.save()

}

let insertVolume = (_volumeCollection) => {
    const volume = new Volume(_volumeCollection)
    return volume.save()
}

exports.insertClose = insertClose
exports.insertVolume = insertVolume