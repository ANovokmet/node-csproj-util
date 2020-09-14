module.exports = {
    read() {
        const regex = new RegExp(`GlobalSection\\((?<SECTIONNAME>.*)\\) = (?<SECTIONVALUE>preSolution|postSolution)`);
        const line = this.currLine();
        const matches = regex.exec(line);
    
        const config = [];
        for (let line = this.nextLine(); !line.startsWith('EndGlobalSection'); line = this.nextLine()) {
            config.push(this.readConfig());
        }
    
        return {
            sectionName: matches.groups.SECTIONNAME,
            sectionValue: matches.groups.SECTIONVALUE,
            config
        };
    },
    write(node) {
        this.writeLine(`\tGlobalSection(${node.sectionName}) = ${node.sectionValue}`);
        for(const child of node.config) {
            this.writeConfig(child);
        }
        this.writeLine(`\tEndGlobalSection`);
    }
}