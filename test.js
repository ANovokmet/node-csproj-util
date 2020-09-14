const { Solution, Project } = require('./index');

async function readSlnFile(path) {
    const sln = new Solution(path);
    await sln.read();

    const proj = sln.projects[0];
    await proj.read();
    proj.add('content/testClass.cs');
    await proj.save();

    await sln.save();
}

readSlnFile('examples/TestSolution/TestSolution.sln');
