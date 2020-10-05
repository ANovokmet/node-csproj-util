import fs from "fs-extra";
import path from "path";
import * as parser from "./parser";
import Project from "./project";

export default class Solution {
  path: string;
  header: parser.HeaderNode | undefined;
  projects: Project[] = [];
  global: parser.GlobalSectionNode[] = [];


  constructor(path: string) {
    this.path = path;
  }
  
  async read(): Promise<void> {
    const buffer = await fs.readFile(this.path);
    const lines = buffer.toString().split("\n");
    const { header, projects, global } = parser.read(lines);

    this.header = header;
    this.projects = projects.map(
      (project) => new Project({ solution: this, ...project })
    );
    this.global = global;
  }

  addProject(project: Project): void {
    if (!project.projectTypeGuid) {
      const guids = project.getProperty("ProjectTypeGuids").split(";");
      project.projectTypeGuid = guids[guids.length - 1];
    }
    project.projectName =
      project.projectName || project.getProperty("AssemblyName");
    project.relativePath =
      project.relativePath ||
      path.relative(path.dirname(this.path), project.filePath);
    project.projectGuid =
      project.projectGuid || project.getProperty("ProjectGuid");

    this.projects.push(project);
  }
  async save(): Promise<void> {
    if(!this.header) throw new Error('No header Node');
    const fileContent = parser.write({
      header: this.header,
      projects: this.projects,
      global: this.global,
    });

    await fs.writeFile(this.path, fileContent, { encoding: "utf8", flag: "w" });
  }
  addFolder(projectName: string): Project {
    const slnFolder = new Project({
      solution: this,
      projectName: projectName,
      relativePath: projectName,
      projectGuid: `{${uuidv4().toUpperCase()}}`,
      projectTypeGuid: "{2150E333-8FDC-42A3-9474-1A3956D46DE8}",
    });
    this.projects.push(slnFolder);
    return slnFolder;
  }

  addToFolder(slnFolder: Project, project: Project): void {
    let globalSection = this.global.find(
      (globalSection) => globalSection.sectionName === "NestedProjects"
    );
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

function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

module.exports = Solution;
