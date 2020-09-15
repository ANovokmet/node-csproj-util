const fs = require('fs-extra');
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

Solution.prototype.save = async function () {
    const fileContent = this.parser.write({
        header: this.header,
        projects: this.projects,
        global: this.global
    });

    await fs.writeFile(this.path, fileContent, { encoding: 'utf8', flag: 'w' });
}

module.exports = Solution;