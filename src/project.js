const fs = require('fs-extra');
const xml2js = require('xml2js');
const path = require('path');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

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

module.exports = Project;