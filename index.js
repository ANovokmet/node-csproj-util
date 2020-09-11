const fs = require('fs-extra');
const xml2js = require('xml2js');
const path = require('path');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

function Solution(path) {
    this.path = path;
}

Solution.prototype.read = async function () {
    const buffer = await fs.readFile(this.path);
    this.lines = buffer.toString().split('\n');
    this.projects = [];
    this.curr = 0;

    for (let line = this.readLine(); line; line = this.readLine());

    this.header = this.readHeader();

    for (let line = this.currLine(); line != null; line = this.nextLine()) {
        if (line.startsWith('Project(')) {
            this.projects.push(this.readProject(line))
        }

        if (line.startsWith('Global')) {
            this.readGlobal();
        }
    }
}

Solution.prototype.readLine = function () {
    const line = this.lines[this.curr];
    if (line == null) {
        return null;
    }
    this.curr += 1;
    return line.trim();
}

Solution.prototype.currLine = function () {
    const line = this.lines[this.curr];
    if (line == null) {
        return null;
    }
    return line.trim();
}

Solution.prototype.nextLine = function () {
    this.curr += 1;
    const line = this.lines[this.curr];
    if (line == null) {
        return null;
    }
    return line.trim();
}

/**
 * Source: {@link https://github.com/mtherien/slntools}
 * @param {*} line 
 */
Solution.prototype.readProject = function (line) {
    const regex = new RegExp("^Project\\(\"(?<PROJECTTYPEGUID>.*)\"\\)\\s*=\\s*\"(?<PROJECTNAME>.*)\"\\s*,\\s*\"(?<RELATIVEPATH>.*)\"\\s*,\\s*\"(?<PROJECTGUID>.*)\"$");
    const matches = regex.exec(line);

    const project = new Project({
        solution: this,
        projectTypeGuid: matches.groups.PROJECTTYPEGUID,
        projectName: matches.groups.PROJECTNAME,
        relativePath: matches.groups.RELATIVEPATH,
        projectGuid: matches.groups.PROJECTGUID
    });

    for (let line = this.readLine(); !line.startsWith('EndProject'); line = this.readLine());

    return project;
}


Solution.prototype.readHeader = function () {
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
}

Solution.prototype.readGlobal = function () {
    this.nextLine();
    const global = [];
    for (let line = this.currLine(); !line.startsWith('EndGlobal'); line = this.nextLine()) {
        global.push(this.readGlobalSection());
    }
    return global;
}

Solution.prototype.readGlobalSection = function () {
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
}

Solution.prototype.readConfig = function() {
    const regex = new RegExp(`(?<CONFIGNAME>.*) = (?<CONFIGVALUE>.*)`);
    const line = this.currLine();
    const matches = regex.exec(line);

    return {
        configName: matches.groups.CONFIGNAME,
        configValue: matches.groups.CONFIGVALUE
    };
}


function Project(data) {
    this.solution = data.solution;
    this.projectTypeGuid = data.projectTypeGuid;
    this.projectName = data.projectName;
    this.relativePath = data.relativePath;
    this.projectGuid = data.projectGuid;
    this.filePath = path.join(path.dirname(this.solution.path), path.normalize(this.relativePath));
}

Project.prototype.read = async function () {
    const buffer = await fs.readFile(this.filePath);
    this.xmlContent = await parser.parseStringPromise(buffer.toString());;

    this.itemGroup = {
        Reference: [],
        Compile: [],
        None: []
    };

    for (const itemGroup of this.xmlContent.Project.ItemGroup) {
        Object.assign(this.itemGroup, itemGroup);
    }
}

Project.prototype.add = function (filePath, opts = {}) {
    opts = { includeOutput: true, ...opts };
    filePath = path.normalize(filePath);
    const ext = path.extname(filePath);
    let itemGroup;
    if (opts.includeOutput) {
        if (ext === '.cs') {
            itemGroup = this.itemGroup.Compile;
        } else {
            itemGroup = this.itemGroup.Content;
        }
    } else {
        itemGroup = this.itemGroup.None;
    }

    const ix = itemGroup.findIndex(i => i.$.Include === filePath);
    if (ix === -1) {
        itemGroup.push({ $: { Include: filePath } });
    }
}

Project.prototype.save = async function () {
    const fileContent = builder.buildObject(this.xmlContent);
    await fs.writeFile(this.filePath, fileContent, { encoding: 'utf8', flag: 'w' });
}

module.exports = { Solution, Project };