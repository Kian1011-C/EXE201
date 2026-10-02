const fs = require('fs');
const filePath = 'src/pages/HomePage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

let sectionCount = 0;
content = content.replace(/<section\s+([^>]+)>/g, (match, p1) => {
    sectionCount++;
    if (sectionCount === 1) return match; 
    return `<motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: '-40px' }} 
        transition={{ duration: 0.6 }} 
        ${p1}>`;
});

let closeSectionCount = 0;
content = content.replace(/<\/section>/g, (match) => {
    closeSectionCount++;
    if (closeSectionCount === 1) return match; 
    return '</motion.section>';
});

const imageBlock = `
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-12 w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-stroke-subtle relative"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/20 to-transparent pointer-events-none z-10" />
              <img src="/images/hero-illustration.jpg" alt="InsurMatch CRM Platform" className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-700" />
            </motion.div>
`;
content = content.replace('{/* Fine Signature Subline */}', imageBlock + '\n            {/* Fine Signature Subline */}');

fs.writeFileSync(filePath, content);
console.log('Updated HomePage.jsx');
