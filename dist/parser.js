"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SlnParser {
    constructor() {
        this.output = "";
        this.curr = 0;
        this.lines = [];
    }
    //-------------------------------------
    // PARSER STUFF
    //-------------------------------------
    read(lines) {
        this.curr = 0;
        this.lines = lines;
        return this.readRoot();
    }
    readLine() {
        const line = this.lines[this.curr];
        if (line == null) {
            return null;
        }
        this.curr += 1;
        return line.trim();
    }
    currLine() {
        const line = this.lines[this.curr];
        if (line == null) {
            return null;
        }
        return line.trim();
    }
    nextLine() {
        this.curr += 1;
        const line = this.lines[this.curr];
        if (line == null) {
            return null;
        }
        return line.trim();
    }
    write(node) {
        this.output = '';
        this.writeRoot(node);
        return this.output;
    }
    writeLine(line) {
        this.output += `${line}\r\n`;
    }
    //-------------------------------------
    // CONFIG
    //-------------------------------------
    readConfig() {
        const regex = new RegExp(`(?<CONFIGNAME>.*) = (?<CONFIGVALUE>.*)`);
        const line = this.currLine();
        // TODO What should happen if the line is null? 
        if (!line)
            throw new Error('Line is null');
        const matches = regex.exec(line);
        if (!matches || !matches.groups)
            throw new Error('Could not find config!');
        return {
            configName: matches.groups.CONFIGNAME,
            configValue: matches.groups.CONFIGVALUE
        };
    }
    writeConfig(node) {
        this.writeLine(`\t\t${node.configName} = ${node.configValue}`);
    }
    //-------------------------------------
    // GLOBAL
    //-------------------------------------
    readGlobal() {
        this.nextLine();
        const global = [];
        for (let line = this.currLine(); line && !line.startsWith('EndGlobal'); line = this.nextLine()) {
            global.push(this.readGlobalSection());
        }
        return global;
    }
    writeGlobal(node) {
        this.writeLine(`Global`);
        for (const child of node) {
            this.writeGlobalSection(child);
        }
        this.writeLine(`EndGlobal`);
    }
    //-------------------------------------
    // GLOBAL SECTION
    //-------------------------------------
    readGlobalSection() {
        const regex = new RegExp(`GlobalSection\\((?<SECTIONNAME>.*)\\) = (?<SECTIONVALUE>preSolution|postSolution)`);
        const line = this.currLine();
        // TODO figuren out what should happen in this condition
        if (!line)
            throw new Error('Line is null!');
        const matches = regex.exec(line);
        if (!matches || !matches.groups)
            throw new Error('Could not find GlobalSection!');
        const config = [];
        for (let line = this.nextLine(); line && !line.startsWith('EndGlobalSection'); line = this.nextLine()) {
            config.push(this.readConfig());
        }
        return {
            sectionName: matches.groups.SECTIONNAME,
            sectionValue: matches.groups.SECTIONVALUE,
            config
        };
    }
    writeGlobalSection(node) {
        this.writeLine(`\tGlobalSection(${node.sectionName}) = ${node.sectionValue}`);
        for (const child of node.config) {
            this.writeConfig(child);
        }
        this.writeLine(`\tEndGlobalSection`);
    }
    //-------------------------------------
    // HEADER
    //-------------------------------------
    readHeader() {
        const vsFileFormat = this.readLine();
        const vsMajorVersion = this.readLine();
        const vsFullVersion = this.readLine();
        const vsMinVersion = this.readLine();
        if (!vsFileFormat || !vsMajorVersion || !vsFullVersion || !vsMinVersion)
            throw new Error('Error reading Header node!');
        return {
            vsFileFormat,
            vsMajorVersion,
            vsFullVersion,
            vsMinVersion
        };
    }
    writeHeader(node) {
        this.writeLine(node.vsFileFormat);
        this.writeLine(node.vsMajorVersion);
        this.writeLine(node.vsFullVersion);
        this.writeLine(node.vsMinVersion);
    }
    //-------------------------------------
    // PROJECT
    //-------------------------------------
    readProject() {
        /**
        * Source: {@link https://github.com/mtherien/slntools}
        */
        const line = this.currLine();
        if (!line)
            throw new Error('Project line is null!');
        const regex = new RegExp("^Project\\(\"(?<PROJECTTYPEGUID>.*)\"\\)\\s*=\\s*\"(?<PROJECTNAME>.*)\"\\s*,\\s*\"(?<RELATIVEPATH>.*)\"\\s*,\\s*\"(?<PROJECTGUID>.*)\"$");
        const matches = regex.exec(line);
        for (let line = this.nextLine(); line && !line.startsWith('EndProject'); line = this.readLine())
            ;
        if (!matches || !matches.groups)
            throw new Error('Could not find Project!');
        return {
            projectTypeGuid: matches.groups.PROJECTTYPEGUID,
            projectName: matches.groups.PROJECTNAME,
            relativePath: matches.groups.RELATIVEPATH,
            projectGuid: matches.groups.PROJECTGUID
        };
    }
    writeProject(node) {
        this.writeLine(`Project("${node.projectTypeGuid}") = "${node.projectName}", "${node.relativePath}", "${node.projectGuid}"`);
        this.writeLine(`EndProject`);
    }
    //-------------------------------------
    // ROOT
    //-------------------------------------
    readRoot() {
        for (let line = this.readLine(); line; line = this.readLine())
            ;
        const header = this.readHeader();
        const projects = [];
        let global;
        for (let line = this.currLine(); line != null; line = this.nextLine()) {
            if (line.startsWith('Project(')) {
                projects.push(this.readProject());
            }
            if (line.startsWith('Global')) {
                global = this.readGlobal();
            }
        }
        if (!global)
            throw new Error('No Global Node');
        return {
            header,
            projects,
            global
        };
    }
    writeRoot(node) {
        this.writeLine('');
        this.writeHeader(node.header);
        for (const project of node.projects) {
            this.writeProject(project);
        }
        this.writeGlobal(node.global);
    }
}
exports.default = new SlnParser();
