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

    for (let line = this.readline(); line != null; line = this.readline()) {
        if (line.startsWith('Project(')) {
            this.projects.push(this.readProject(line))
        }
    }
}

Solution.prototype.readline = function () {
    const line = this.lines[this.curr];
    if(line == null) {
        return null;
    }
    this.curr += 1;
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

    for (let line = this.readline(); !line.startsWith('EndProject'); line = this.readline());

    return project;
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