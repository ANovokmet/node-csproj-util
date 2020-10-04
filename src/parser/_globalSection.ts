import { ConfigNode, currLine, nextLine, readConfig, writeConfig, writeLine } from ".";

export function readGlobalSection(): GlobalSectionNode {
    const regex = new RegExp(`GlobalSection\\((?<SECTIONNAME>.*)\\) = (?<SECTIONVALUE>preSolution|postSolution)`);
    const line = currLine();

    // TODO figuren out what should happen in this condition
    if(!line) throw new Error('Line is null!');
    const matches = regex.exec(line);

    if(!matches || !matches.groups) throw new Error('Could not find GlobalSection!');

    const config = [];
    for (let line = nextLine(); line && !line.startsWith('EndGlobalSection'); line = nextLine()) {
        config.push(readConfig());
    }

    return {
        sectionName: matches.groups.SECTIONNAME,
        sectionValue: matches.groups.SECTIONVALUE,
        config
    };
}

export function writeGlobalSection(node: GlobalSectionNode): void {
    writeLine(`\tGlobalSection(${node.sectionName}) = ${node.sectionValue}`);
    for(const child of node.config) {
        writeConfig(child);
    }
    writeLine(`\tEndGlobalSection`);
}

export interface GlobalSectionNode {
    sectionName: string,
    sectionValue: string,
    config: ConfigNode[]
}