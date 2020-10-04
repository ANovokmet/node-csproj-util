import fs from 'fs-extra'
import xml2js from 'xml2js'
import path from 'path'
import { ProjectNode } from './parser';

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

interface ProjectData extends ProjectNode {
    filePath?: string; 
    solution?: {path: string}
}
interface XMLContent {
    Project: {
        ItemGroup: {
            [x:string]:any
        }[],
        PropertyGroup: {
            [x:string]:any
        }[]
    }
}

export default class Project {
    projectTypeGuid: string;
    projectName: string;
    relativePath: string;
    projectGuid: string;
    filePath: string;
    solution?: { path: string; };
    xmlContent: XMLContent | undefined;
    //TODO I use any a lot here but I really should have this as a concrete type. I just don't know what type that would be
    itemGroup: { Reference: any[]; Compile: any[]; None: any[]; Content: any[]} = {Reference: [], Compile: [], None: [], Content: []};

    constructor(data: ProjectData){
        this.projectTypeGuid = data.projectTypeGuid;
        this.projectName = data.projectName;
        this.relativePath = data.relativePath;
        this.projectGuid = data.projectGuid;
        this.filePath = data.filePath||"";

        if(data.solution) {
            this.solution = data.solution;
            this.filePath = this.filePath || path.join(path.dirname(this.solution.path), path.normalize(this.relativePath));
        }
    }
    async read(): Promise<void> {
        const buffer = await fs.readFile(this.filePath);
        this.xmlContent = await parser.parseStringPromise(buffer.toString());
        
        if(this.xmlContent)
        for (const itemGroup of this.xmlContent.Project.ItemGroup) {
            Object.assign(this.itemGroup, itemGroup);
        }
    }
    
    //TODO IDK what the property node's type is and it seems like it can really be anything. You would know more about what this can be
    getPropertyNode(key: string): any {
        if(!this.xmlContent) throw new Error('xmlContent is not yet defined. You must use read() first!');

        const propertyGroups = this.xmlContent.Project.PropertyGroup;
        for (let i = 0; i < propertyGroups.length; i++) {
            if (propertyGroups[i][key]) {
                return propertyGroups[i][key];
            }
        }
    
        propertyGroups[1][key] = [''];
        return propertyGroups[1][key];
    }
    
    getProperty(key:string): any {
        const node = this.getPropertyNode(key);
        if(node) {
            return node[0];
        }
        throw new Error(`PropertyGroup: Property "${key}" not found`);
    }
    
    setProperty(key: string, value: any): void {
        const node = this.getPropertyNode(key);
        if(node) {
            return node[0] = value;
        }
        throw new Error(`PropertyGroup: Property "${key}" not found`);
    }
    
    add(filePath: string, opts: {includeOutput?: boolean} = {}): void {
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
    
    async save(): Promise<void> {
        const fileContent = builder.buildObject(this.xmlContent);
        await fs.writeFile(this.filePath, fileContent, { encoding: 'utf8', flag: 'w' });
    }
}