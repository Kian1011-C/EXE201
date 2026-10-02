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

    // 1. Replace alert('Tính năng đang được phát triển!')
    content = content.replace(/alert\('Tính năng đang được phát triển!'\)/g, "toast('Tính năng đang được phát triển!', { icon: '🚧' })");
    content = content.replace(/alert\("Tính năng đang được phát triển!"\)/g, "toast('Tính năng đang được phát triển!', { icon: '🚧' })");

    // 2. Replace showToast(...) -> toast.success(...)
    content = content.replace(/showToast\(/g, "toast.success(");

    // 3. Remove function showToast(msg) { ... } block (and arrow function variant)
    // Matches standard: function showToast(msg) { ... setTimeout... }
    content = content.replace(/function toast\.success\([^)]*\)\s*\{[^}]*setTimeout[^}]*\}[^}]*\}/g, ""); // wait, I already replaced showToast with toast.success
    
    // Ah, wait. If I replace showToast( with toast.success( first, the declaration becomes function toast.success(msg) which is invalid.
    
    // Let's reset and do it in order:
    content = original;

    let modified = false;
    
    if (content.includes("alert('Tính năng đang được phát triển!')") || content.includes('alert("Tính năng đang được phát triển!")') || content.includes('showToast(')) {
        modified = true;

        // Add import if not exists
        if (!content.includes("import toast from 'react-hot-toast'")) {
            const importMatch = content.match(/import [^;]+;/g);
            if (importMatch) {
                const lastImport = importMatch[importMatch.length - 1];
                content = content.replace(lastImport, lastImport + "\nimport toast from 'react-hot-toast';");
            } else {
                content = "import toast from 'react-hot-toast';\n" + content;
            }
        }

        // Remove the state and function declaration
        // const [toastMessage, setToastMessage] = useState('');
        content = content.replace(/const\s+\[toastMessage,\s*setToastMessage\]\s*=\s*useState\([^)]*\);/g, "");
        
        // function showToast(msg) { ... }
        content = content.replace(/function\s+showToast\s*\([^)]*\)\s*\{[^}]*setTimeout[^}]*\}[^}]*\}/g, "");
        
        // const showToast = (msg) => { ... }
        content = content.replace(/const\s+showToast\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*setTimeout[^}]*\}[^}]*\}/g, "");
        content = content.replace(/const\s+showToast\s*=\s*msg\s*=>\s*\{[^}]*setTimeout[^}]*\}[^}]*\}/g, "");

        // Remove {toastMessage && ( ... )} block
        content = content.replace(/\{toastMessage\s*&&\s*\(\s*<div[^>]*fixed[^>]*>[\s\S]*?<\/div>\s*\)\}/g, "");

        // Now replace the usages
        content = content.replace(/alert\('Tính năng đang được phát triển!'\)/g, "toast('Tính năng đang được phát triển!', { icon: '🚧' })");
        content = content.replace(/alert\("Tính năng đang được phát triển!"\)/g, "toast('Tính năng đang được phát triển!', { icon: '🚧' })");
        content = content.replace(/showToast\(/g, "toast.success(");
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log("Updated: " + filePath);
    }
});
