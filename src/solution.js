const fs = require('fs-extra');
const path = require('path');
const { SlnParser } = require('./parse');
const Project = require('./project');

function Solution(path) {
    this.path = path;
    this.parser = SlnParser;
}

Solution.prototype.read = async function () {
    const buffer = await fs.readFile(this.path);
    const lines = buffer.toString().split('\n');
    const { header, projects, global } = this.parser.read(lines);

    this.header = header;
    this.projects = projects.map(project => new Project({ solution: this, ...project }));
    this.global = global;
}

Solution.prototype.addProject = function (project) {
    if (!project.projectTypeGuid) {
        const guids = project.getProperty('ProjectTypeGuids').split(';');
        project.projectTypeGuid = guids[guids.length - 1]
    }
    project.projectName = project.projectName || project.getProperty('AssemblyName');
    project.relativePath = project.relativePath || path.relative(path.dirname(this.path), project.filePath);
    project.projectGuid = project.projectGuid || project.getProperty('ProjectGuid');

    this.projects.push(project);
}

Solution.prototype.save = async function () {
    const fileContent = this.parser.write({
        header: this.header,
        projects: this.projects,
        global: this.global
    });

    await fs.writeFile(this.path, fileContent, { encoding: 'utf8', flag: 'w' });
}

Solution.prototype.addFolder = function (projectName) {
    const slnFolder = new Project({
        solution: this,
        projectName: projectName,
        relativePath: projectName,
        projectGuid: `{${uuidv4().toUpperCase()}}`,
        projectTypeGuid: '{2150E333-8FDC-42A3-9474-1A3956D46DE8}'
    });
    this.projects.push(slnFolder);
    return slnFolder;
}

Solution.prototype.addToFolder = function (slnFolder, project) {
    let globalSection = this.global.find(globalSection => globalSection.sectionName === 'NestedProjects');
    if(!globalSection) {
        globalSection = {
            sectionName: 'NestedProjects',
            sectionValue: 'preSolution',
            config: []
        };
        this.global.push(globalSection);
    }
    globalSection.config.push({
        configName: project.projectGuid || project.getProperty('ProjectGuid'),
        configValue: slnFolder.projectGuid
    });
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = Solution;