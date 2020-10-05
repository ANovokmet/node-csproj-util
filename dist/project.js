"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const xml2js_1 = __importDefault(require("xml2js"));
const path_1 = __importDefault(require("path"));
const parser = new xml2js_1.default.Parser();
const builder = new xml2js_1.default.Builder();
class Project {
    constructor(data) {
        //TODO I use any a lot here but I really should have this as a concrete type. I just don't know what type that would be
        this.itemGroup = { Reference: [], Compile: [], None: [], Content: [] };
        this.projectTypeGuid = data.projectTypeGuid;
        this.projectName = data.projectName;
        this.relativePath = data.relativePath;
        this.projectGuid = data.projectGuid;
        this.filePath = data.filePath || "";
        if (data.solution) {
            this.solution = data.solution;
            this.filePath = this.filePath || path_1.default.join(path_1.default.dirname(this.solution.path), path_1.default.normalize(this.relativePath));
        }
    }
    async read() {
        const buffer = await fs_extra_1.default.readFile(this.filePath);
        this.xmlContent = await parser.parseStringPromise(buffer.toString());
        if (this.xmlContent)
            for (const itemGroup of this.xmlContent.Project.ItemGroup) {
                Object.assign(this.itemGroup, itemGroup);
            }
    }
    //TODO IDK what the property node's type is and it seems like it can really be anything. You would know more about what this can be
    getPropertyNode(key) {
        if (!this.xmlContent)
            throw new Error('xmlContent is not yet defined. You must use read() first!');
        const propertyGroups = this.xmlContent.Project.PropertyGroup;
        for (let i = 0; i < propertyGroups.length; i++) {
            if (propertyGroups[i][key]) {
                return propertyGroups[i][key];
            }
        }
        propertyGroups[1][key] = [''];
        return propertyGroups[1][key];
    }
    getProperty(key) {
        const node = this.getPropertyNode(key);
        if (node) {
            return node[0];
        }
        throw new Error(`PropertyGroup: Property "${key}" not found`);
    }
    setProperty(key, value) {
        const node = this.getPropertyNode(key);
        if (node) {
            return node[0] = value;
        }
        throw new Error(`PropertyGroup: Property "${key}" not found`);
    }
    add(filePath, opts = {}) {
        opts = { includeOutput: true, ...opts };
        filePath = path_1.default.normalize(filePath);
        const ext = path_1.default.extname(filePath);
        let itemGroup;
        if (opts.includeOutput) {
            if (ext === '.cs') {
                itemGroup = this.itemGroup.Compile;
            }
            else {
                itemGroup = this.itemGroup.Content;
            }
        }
        else {
            itemGroup = this.itemGroup.None;
        }
        const ix = itemGroup.findIndex(i => i.$.Include === filePath);
        if (ix === -1) {
            itemGroup.push({ $: { Include: filePath } });
        }
    }
    async save() {
        const fileContent = builder.buildObject(this.xmlContent);
        await fs_extra_1.default.writeFile(this.filePath, fileContent, { encoding: 'utf8', flag: 'w' });
    }
}
exports.default = Project;
