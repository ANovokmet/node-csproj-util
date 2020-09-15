module.exports = {
    read() {
        for (let line = this.readLine(); line; line = this.readLine());

        const header = this.readHeader();
        const projects = [];
        let global;

        for (let line = this.currLine(); line != null; line = this.nextLine()) {
            if (line.startsWith('Project(')) {
                projects.push(this.readProject());
            }

            if (line.startsWith('Global')) {
                global = this.readGlobal();
            }
        }

        return {
            header,
            projects,
            global
        }
    },
    write(node) {
        this.writeLine('');
        this.writeHeader(node.header);
        for (const project of node.projects) {
            this.writeProject(project);
        }
        this.writeGlobal(node.global);
    }
}