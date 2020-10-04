import { currLine, GlobalSectionNode, HeaderNode, nextLine, ProjectNode, readGlobal, readHeader, readLine, readProject, writeGlobal, writeHeader, writeLine, writeProject } from ".";

export function readRoot(): RootNode {
    for (let line = readLine(); line; line = readLine());

    const header = readHeader();
    const projects = [];
    let global;

    for (let line = currLine(); line != null; line = nextLine()) {
        if (line.startsWith('Project(')) {
            projects.push(readProject());
        }

        if (line.startsWith('Global')) {
            global = readGlobal();
        }
    }

    if(!global) throw new Error('No Global Node');

    return {
        header,
        projects,
        global
    }
}

export function writeRoot(node: RootNode): void {
    writeLine('');
    writeHeader(node.header);
    for (const project of node.projects) {
        writeProject(project);
    }
    writeGlobal(node.global);
}

export interface RootNode {
    header: HeaderNode,
    projects: ProjectNode[],
    global: GlobalSectionNode[]
}