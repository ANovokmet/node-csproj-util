declare class SlnParser {
    output: string;
    curr: number;
    lines: string[];
    read(lines: string[]): RootNode;
    readLine(): string | null;
    currLine(): string | null;
    nextLine(): string | null;
    write(node: RootNode): string;
    writeLine(line: string): void;
    readConfig(): ConfigNode;
    writeConfig(node: ConfigNode): void;
    readGlobal(): GlobalSectionNode[];
    writeGlobal(node: GlobalSectionNode[]): void;
    readGlobalSection(): GlobalSectionNode;
    writeGlobalSection(node: GlobalSectionNode): void;
    readHeader(): HeaderNode;
    writeHeader(node: HeaderNode): void;
    readProject(): ProjectNode;
    writeProject(node: ProjectNode): void;
    readRoot(): RootNode;
    writeRoot(node: RootNode): void;
}
export interface ConfigNode {
    configName: string;
    configValue: string;
}
export interface GlobalSectionNode {
    sectionName: string;
    sectionValue: string;
    config: ConfigNode[];
}
export interface ProjectNode {
    projectTypeGuid: string;
    projectName: string;
    relativePath: string;
    projectGuid: string;
}
export interface HeaderNode {
    vsFileFormat: string;
    vsMajorVersion: string;
    vsFullVersion: string;
    vsMinVersion: string;
}
export interface RootNode {
    header: HeaderNode;
    projects: ProjectNode[];
    global: GlobalSectionNode[];
}
declare const _default: SlnParser;
export default _default;
//# sourceMappingURL=parser.d.ts.map