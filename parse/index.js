const nodes = {
    Config: require('./_config'),
    Global: require('./_global'),
    GlobalSection: require('./_globalSection'),
    Header: require('./_header'),
    Project: require('./_project'),
    Root: require('./_root')
}

function SlnParser() {
    for(const key in nodes) {
        this[`read${key}`] = nodes[key].read;
        this[`write${key}`] = nodes[key].write;
    }
}

SlnParser.prototype.read = function(lines) {
    this.curr = 0;
    this.lines = lines;
    return this.readRoot();
}

SlnParser.prototype.readLine = function () {
    const line = this.lines[this.curr];
    if (line == null) {
        return null;
    }
    this.curr += 1;
    return line.trim();
}

SlnParser.prototype.currLine = function () {
    const line = this.lines[this.curr];
    if (line == null) {
        return null;
    }
    return line.trim();
}

SlnParser.prototype.nextLine = function () {
    this.curr += 1;
    const line = this.lines[this.curr];
    if (line == null) {
        return null;
    }
    return line.trim();
}

SlnParser.prototype.write = function(node) {
    this.output = '';
    this.writeRoot(node);
    return this.output;
}

SlnParser.prototype.writeLine = function(line) {
    this.output += `${line}\r\n`;
}

module.exports = { SlnParser: new SlnParser() }