"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const parser_1 = __importDefault(require("./parser"));
const project_1 = __importDefault(require("./project"));
class Solution {
    constructor(path) {
        this.projects = [];
        this.global = [];
        this.path = path;
        this.parser = parser_1.default;
    }
    async read() {
        const buffer = await fs_extra_1.default.readFile(this.path);
        const lines = buffer.toString().split("\n");
        const { header, projects, global } = this.parser.read(lines);
        this.header = header;
        this.projects = projects.map((project) => new project_1.default({ solution: this, ...project }));
        this.global = global;
    }
    addProject(project) {
        if (!project.projectTypeGuid) {
            const guids = project.getProperty("ProjectTypeGuids").split(";");
            project.projectTypeGuid = guids[guids.length - 1];
        }
        project.projectName =
            project.projectName || project.getProperty("AssemblyName");
        project.relativePath =
            project.relativePath ||
                path_1.default.relative(path_1.default.dirname(this.path), project.filePath);
        project.projectGuid =
            project.projectGuid || project.getProperty("ProjectGuid");
        this.projects.push(project);
    }
    async save() {
        if (!this.header)
            throw new Error('No header Node');
        const fileContent = this.parser.write({
            header: this.header,
            projects: this.projects,
            global: this.global,
        });
        await fs_extra_1.default.writeFile(this.path, fileContent, { encoding: "utf8", flag: "w" });
    }
    addFolder(projectName) {
        const slnFolder = new project_1.default({
            solution: this,
            projectName: projectName,
            relativePath: projectName,
            projectGuid: `{${uuidv4().toUpperCase()}}`,
            projectTypeGuid: "{2150E333-8FDC-42A3-9474-1A3956D46DE8}",
        });
        this.projects.push(slnFolder);
        return slnFolder;
    }
    addToFolder(slnFolder, project) {
        let globalSection = this.global.find((globalSection) => globalSection.sectionName === "NestedProjects");
        if (!globalSection) {
            globalSection = {
                sectionName: "NestedProjects",
                sectionValue: "preSolution",
                config: [],
            };
            this.global.push(globalSection);
        }
        globalSection.config.push({
            configName: project.projectGuid || project.getProperty("ProjectGuid"),
            configValue: slnFolder.projectGuid,
        });
    }
}
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
module.exports = Solution;
