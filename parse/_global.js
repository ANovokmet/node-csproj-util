module.exports = {
    read() {
        this.nextLine();
        const global = [];
        for (let line = this.currLine(); !line.startsWith('EndGlobal'); line = this.nextLine()) {
            global.push(this.readGlobalSection());
        }
        return global;
    },
    write(node) {
        this.writeLine(`Global`);
        for(const child of node) {
            this.writeGlobalSection(child);
        }
        this.writeLine(`EndGlobal`);
    }
}