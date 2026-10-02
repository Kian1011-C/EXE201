const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    let modified = false;

    if (content.includes("alert('Tính năng") || content.includes('alert("Tính năng')) {
        modified = true;
        // Add import
        if (!content.includes("import toast from 'react-hot-toast'")) {
            const importMatch = content.match(/import [^;]+;/g);
            if (importMatch) {
                const lastImport = importMatch[importMatch.length - 1];
                content = content.replace(lastImport, lastImport + "\nimport toast from 'react-hot-toast';");
            } else {
                content = "import toast from 'react-hot-toast';\n" + content;
            }
        }
        content = content.replace(/alert\('Tính năng đang được phát triển!'\)/g, "toast('Tính năng đang được phát triển!', { icon: '🚧' })");
        content = content.replace(/alert\("Tính năng đang được phát triển!"\)/g, "toast('Tính năng đang được phát triển!', { icon: '🚧' })");
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log("Updated alerts in: " + filePath);
    }
});
