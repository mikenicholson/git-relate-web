

function NumstatParser() {
}


NumstatParser.prototype.parseBuffer = function(buffer) {
    var reader = new BufferReader(buffer)
    var entries = [];
    while (reader.remainingBytes() > 0) {
        entries.push(this.parseEntry(reader));
    }
    return entries;
};


NumstatParser.prototype.parseEntry = function(bufferReader) {
    var entry = {}
    this.parseAddedDeletedLines(bufferReader, entry);
    this.parseFileNameInfo(bufferReader, entry);
    return entry;
};


NumstatParser.prototype.parseAddedDeletedLines = function(bufferReader, entry) {
    entry.addedLines = this.parseLineCount(bufferReader);
    entry.deletedLines = this.parseLineCount(bufferReader);
};


NumstatParser.prototype.parseFileNameInfo = function(bufferReader, entry) {
    var fileWasRenamed = this.wasFileRenamed(bufferReader);
    entry.renamed = fileWasRenamed;

    if (fileWasRenamed) {
        this.parseRenamedFile(bufferReader, entry);
    } else {
        this.parseNonRenamedFile(bufferReader, entry);
    }
};


NumstatParser.prototype.parseNonRenamedFile = function (bufferReader, entry) {
    entry.previousFileName = undefined;
    entry.fileName = this.parseFileName(bufferReader);
};


NumstatParser.prototype.parseRenamedFile = function (bufferReader, entry) {
        this.parseFileName(bufferReader);
        entry.previousFileName = this.parseFileName(bufferReader);
        entry.fileName = this.parseFileName(bufferReader);
};


NumstatParser.prototype.parseLineCount = function(bufferReader) {
    return parseInt(bufferReader.readStringUntilDelimiter('\t'));
};


NumstatParser.prototype.parseFileName = function(bufferReader) {
    return bufferReader.readStringUntilDelimiter('\0');
};


NumstatParser.prototype.wasFileRenamed = function(bufferReader) {
    return bufferReader.peek() === '\0'.charCodeAt(0);
};


function BufferReader(buffer) {
    this._buffer = buffer;
    this._pos = 0;
    this.stringEncoding = 'utf8'
}


BufferReader.prototype.readStringUntilDelimiter = function (delimiter) { 
    var delimiterIndex = this._buffer.indexOf(delimiter, this._pos);
    var stringUntilDelim = this._buffer.toString(this.stringEncoding, this._pos, delimiterIndex);
    this._pos = delimiterIndex+1;
    return stringUntilDelim;
};


BufferReader.prototype.peek = function () {
    if (this._pos < this._buffer.length) {
        return this._buffer[this._pos];
    } else {
        return undefined;
    }
};


BufferReader.prototype.remainingBytes = function() {
    return this._buffer.length - this._pos; 
};

module.exports = NumstatParser;
