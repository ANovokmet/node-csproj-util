import { GlobalSectionNode, nextLine, currLine, readGlobalSection, writeLine, writeGlobalSection } from ".";

export function readGlobal(): GlobalSectionNode[] {
    nextLine();
    const global = [];
    for (let line = currLine(); line && !line.startsWith('EndGlobal'); line = nextLine()) {
        global.push(readGlobalSection());
    }
    return global;
}

export function writeGlobal(node: GlobalSectionNode[]): void {
    writeLine(`Global`);
    for(const child of node) {
        writeGlobalSection(child);
    }
    writeLine(`EndGlobal`);
}