import { currLine, nextLine, readLine, writeLine } from ".";

export function readProject(): ProjectNode {
    /**
    * Source: {@link https://github.com/mtherien/slntools}
    */
        const line = currLine();
        if(!line) throw new Error('Project line is null!');

        const regex = new RegExp("^Project\\(\"(?<PROJECTTYPEGUID>.*)\"\\)\\s*=\\s*\"(?<PROJECTNAME>.*)\"\\s*,\\s*\"(?<RELATIVEPATH>.*)\"\\s*,\\s*\"(?<PROJECTGUID>.*)\"$");
        const matches = regex.exec(line);
    
        for (let line = nextLine(); line && !line.startsWith('EndProject'); line = readLine());
    
        if(!matches || !matches.groups) throw new Error('Could not find Project!');

        return {
            projectTypeGuid: matches.groups.PROJECTTYPEGUID,
            projectName: matches.groups.PROJECTNAME,
            relativePath: matches.groups.RELATIVEPATH,
            projectGuid: matches.groups.PROJECTGUID
        };
    }

    export function writeProject(node: ProjectNode): void {
        writeLine(`Project("${node.projectTypeGuid}") = "${node.projectName}", "${node.relativePath}", "${node.projectGuid}"`);
        writeLine(`EndProject`);
    }

    export interface ProjectNode {
        projectTypeGuid:string,
        projectName:string,
        relativePath:string,
        projectGuid:string,
    }