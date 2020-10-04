import { readLine, writeLine } from ".";

export function readHeader(): HeaderNode {
    const vsFileFormat = readLine();
    const vsMajorVersion = readLine();
    const vsFullVersion = readLine();
    const vsMinVersion = readLine();
    
    if(!vsFileFormat || !vsMajorVersion || !vsFullVersion || !vsMinVersion) throw new Error('Error reading Header node!');

    return {
        vsFileFormat,
        vsMajorVersion,
        vsFullVersion,
        vsMinVersion
    };
}

export function writeHeader(node: HeaderNode): void {
    writeLine(node.vsFileFormat);
    writeLine(node.vsMajorVersion);
    writeLine(node.vsFullVersion);
    writeLine(node.vsMinVersion);
}

export interface HeaderNode {
    vsFileFormat: string,
    vsMajorVersion: string,
    vsFullVersion: string,
    vsMinVersion: string
}