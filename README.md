# node-csproj-util

## Edit Visual Studio project files using Node.js

This library allows you to add files to be included in a .csproj and .sln file. For example, any templates created by Node.js code generators can be included in compilation of the Visual Studio solution.

## Installation

        npm install node-csproj-util

## Usage

### Reading from a .sln file
```javascript
    var { Solution } = require('node-csproj-util');
    
    (async function() {
        const sln = new Solution('examples/TestSolution/TestSolution.sln');
        await sln.read();
        console.log(sln.projects);
        ...
    })();
```

### Reading from a .proj file
```javascript
        ...
        const proj = sln.projects[0];
        await proj.read();
        ...
```

### Adding files to project
```javascript
        ...
        // included in compilation
        proj.add('content/testClass.cs');
        // added as content
        proj.add('content/testImage.png');
        await proj.save();
        ...
```