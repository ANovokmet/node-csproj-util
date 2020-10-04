import { ProjectNode } from './parser';
interface ProjectData extends ProjectNode {
    filePath?: string;
    solution?: {
        path: string;
    };
}
interface XMLContent {
    Project: {
        ItemGroup: {
            [x: string]: any;
        }[];
        PropertyGroup: {
            [x: string]: any;
        }[];
    };
}
export default class Project {
    projectTypeGuid: string;
    projectName: string;
    relativePath: string;
    projectGuid: string;
    filePath: string;
    solution?: {
        path: string;
    };
    xmlContent: XMLContent | undefined;
    itemGroup: {
        Reference: any[];
        Compile: any[];
        None: any[];
        Content: any[];
    };
    constructor(data: ProjectData);
    read(): Promise<void>;
    getPropertyNode(key: string): any;
    getProperty(key: string): any;
    setProperty(key: string, value: any): void;
    add(filePath: string, opts?: {
        includeOutput?: boolean;
    }): void;
    save(): Promise<void>;
}
export {};
//# sourceMappingURL=project.d.ts.map