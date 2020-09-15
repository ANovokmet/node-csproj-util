module.exports = {
    read() {
        const vsFileFormat = this.readLine();
        const vsMajorVersion = this.readLine();
        const vsFullVersion = this.readLine();
        const vsMinVersion = this.readLine();
    
        return {
            vsFileFormat,
            vsMajorVersion,
            vsFullVersion,
            vsMinVersion
        };
    },
    write(node) {
        this.writeLine(node.vsFileFormat);
        this.writeLine(node.vsMajorVersion);
        this.writeLine(node.vsFullVersion);
        this.writeLine(node.vsMinVersion);
    }
}