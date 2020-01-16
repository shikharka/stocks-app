function currentQuotes(close, prevClose, open, volume, avgVolume3Months, marketCap, monthly5Years, peRatio, epsRatio) {
    this.close = close;
    this.prevClose = prevClose;
    this.open = open;
    this.volume = volume;
    this.avgVolume3Months = avgVolume3Months;
    this.marketCap = marketCap;
    this.monthly5Years = monthly5Years;
    this.peRatio = peRatio;
    this.epsRatio = epsRatio;
}

module.exports = currentQuotes;