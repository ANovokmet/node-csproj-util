module.exports = {
    read() {
        const regex = new RegExp(`(?<CONFIGNAME>.*) = (?<CONFIGVALUE>.*)`);
        const line = this.currLine();
        const matches = regex.exec(line);
    
        return {
            configName: matches.groups.CONFIGNAME,
            configValue: matches.groups.CONFIGVALUE
        };
    },
    write(node) {
        this.writeLine(`\t\t${node.configName} = ${node.configValue}`);
    }
}