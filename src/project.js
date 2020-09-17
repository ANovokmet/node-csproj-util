const fs = require('fs-extra');
const xml2js = require('xml2js');
const path = require('path');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

function Project(data) {
    this.projectTypeGuid = data.projectTypeGuid;
    this.projectName = data.projectName;
    this.relativePath = data.relativePath;
    this.projectGuid = data.projectGuid;
    this.filePath = data.filePath;

    if(data.solution) {
        this.solution = data.solution;
        this.filePath = this.filePath || path.join(path.dirname(this.solution.path), path.normalize(this.relativePath));
    }
}

Project.prototype.read = async function () {
    const buffer = await fs.readFile(this.filePath);
    this.xmlContent = await parser.parseStringPromise(buffer.toString());

    this.itemGroup = {
        Reference: [],
        Compile: [],
        None: []
    };

    for (const itemGroup of this.xmlContent.Project.ItemGroup) {
        Object.assign(this.itemGroup, itemGroup);
    }
}

Project.prototype.getPropertyNode = function (key) {
    const propertyGroups = this.xmlContent.Project.PropertyGroup;
    for (let i = 0; i < propertyGroups.length; i++) {
        if (propertyGroups[i][key]) {
            return propertyGroups[i][key];
        }
    }

    propertyGroups[1][key] = [''];
    return propertyGroups[1][key];
}

Project.prototype.getProperty = function (key) {
    const node = this.getPropertyNode(key);
    if(node) {
        return node[0];
    }
    throw new Error(`PropertyGroup: Property "${key}" not found`);
}

Project.prototype.setProperty = function (key, value) {
    const node = this.getPropertyNode(key);
    if(node) {
        return node[0] = value;
    }
    throw new Error(`PropertyGroup: Property "${key}" not found`);
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