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

        // Hardcoded exact replacements to remove dead code without breaking syntax
        const str1 = `const [toastMessage, setToastMessage] = useState('');
  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }`;
        const str2 = `const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };`;
        const str3 = `{toastMessage && (
        <div className="fixed bottom-4 right-4 z-[9999] bg-slate-800 text-white px-4 py-2 rounded shadow-lg text-sm transition-all">
          {toastMessage}
        </div>
      )}`;
        const str4 = `{toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded shadow-lg text-sm z-50">
          {toastMessage}
        </div>
      )}`;
        const str5 = `{toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded shadow-lg z-50">
          {toastMessage}
        </div>
      )}`;

        content = content.replace(str1, "");
        content = content.replace(str2, "");
        content = content.replace(str3, "");
        content = content.replace(str4, "");
        content = content.replace(str5, "");

        // Also clean up any generic {toastMessage && (<div...</div>)} using a non-greedy regex
        content = content.replace(/\{toastMessage\s*&&\s*\([\s\S]*?<\/div>\s*\)\}/g, "");
        
        // Remove generic const [toastMessage...
        content = content.replace(/const\s+\[toastMessage,\s*setToastMessage\]\s*=\s*useState\([^)]*\);[\s\S]*?setTimeout\([^)]*\)[^}]*\};?/g, "");
        content = content.replace(/const\s+\[toastMessage,\s*setToastMessage\]\s*=\s*useState\([^)]*\);\s*function\s+showToast\([^)]*\)\s*\{[\s\S]*?setTimeout\([^)]*\)[^}]*\}/g, "");

        // Now replace usages
        content = content.replace(/alert\('Tính năng đang được phát triển!'\)/g, "toast('Tính năng đang được phát triển!', { icon: '🚧' })");
        content = content.replace(/alert\("Tính năng đang được phát triển!"\)/g, "toast('Tính năng đang được phát triển!', { icon: '🚧' })");
        content = content.replace(/showToast\(/g, "toast.success(");
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log("Updated: " + filePath);
    }
});
