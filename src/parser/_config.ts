import { currLine, writeLine } from ".";

export function readConfig(): ConfigNode  {
    const regex = new RegExp(`(?<CONFIGNAME>.*) = (?<CONFIGVALUE>.*)`);
    const line = currLine();

    // TODO What should happen if the line is null? 
    if(!line) throw new Error('Line is null');

    const matches = regex.exec(line);

    if(!matches || !matches.groups) throw new Error('Could not find config!');

    return {
        configName: matches.groups.CONFIGNAME,
        configValue: matches.groups.CONFIGVALUE
    };
}
export function writeConfig(node: ConfigNode): void {
    writeLine(`\t\t${node.configName} = ${node.configValue}`);
}

export interface ConfigNode {
    configName: string,
    configValue: string
}