import { readRoot, RootNode, writeRoot } from "./_root";

export * from './_config';
export * from './_global';
export * from './_globalSection';
export * from './_header';
export * from './_project';
export * from './_root';

let output = "";
let curr = 0;
export let lines: string[] = [];

export function read(_lines: string[]): RootNode {
    curr = 0;
    lines = _lines;
    return readRoot();
}

export function readLine(): string|null {
    const line = lines[curr];
    if (line == null) {
        return null;
    }
    curr += 1;
    return line.trim();
}

export function currLine(): string|null {
    const line = lines[curr];
    if (line == null) {
        return null;
    }
    return line.trim();
}

export function nextLine(): string|null {
    curr += 1;
    const line = lines[curr];
    if (line == null) {
        return null;
    }
    return line.trim();
}

export function write(node: RootNode): string {
    output = '';
    writeRoot(node);
    return output;
}

export function writeLine(line: string): void {
    output += `${line}\r\n`;
}