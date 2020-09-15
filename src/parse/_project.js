module.exports = {
    /**
     * Source: {@link https://github.com/mtherien/slntools}
     */
    read() {
        const line = this.currLine();
        const regex = new RegExp("^Project\\(\"(?<PROJECTTYPEGUID>.*)\"\\)\\s*=\\s*\"(?<PROJECTNAME>.*)\"\\s*,\\s*\"(?<RELATIVEPATH>.*)\"\\s*,\\s*\"(?<PROJECTGUID>.*)\"$");
        const matches = regex.exec(line);
    
        for (let line = this.nextLine(); !line.startsWith('EndProject'); line = this.readLine());
    
        return {
            projectTypeGuid: matches.groups.PROJECTTYPEGUID,
            projectName: matches.groups.PROJECTNAME,
            relativePath: matches.groups.RELATIVEPATH,
            projectGuid: matches.groups.PROJECTGUID
        };
    },
    write(node) {
        this.writeLine(`Project("${node.projectTypeGuid}") = "${node.projectName}", "${node.relativePath}", "${node.projectGuid}"`);
        this.writeLine(`EndProject`);
    }
}