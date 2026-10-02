const fs = require('fs');
const files = [
  'src/pages/dashboard/staff/StaffContactDetail.jsx',
  'src/pages/dashboard/staff/StaffDealDetail.jsx',
  'src/pages/dashboard/staff/StaffDealsList.jsx',
  'src/pages/dashboard/staff/StaffTasksList.jsx',
  'src/pages/dashboard/staff/StaffTicketsList.jsx',
  'src/pages/dashboard/staff/AddDealModal.jsx',
  'src/pages/dashboard/staff/StaffCustomerDocumentDetail.jsx',
  'src/pages/dashboard/staff/StaffTicketDetail.jsx',
  'src/pages/dashboard/staff/StaffCrmDashboard.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/onClick=\{\(\) => \{\}\}/g, "onClick={() => alert('Tính năng đang được phát triển!')}");
  
  const buttonRegex = /<button\b([^>]*)>/g;
  let match;
  while ((match = buttonRegex.exec(content)) !== null) {
    const btnText = match[0];
    if (btnText.includes('type="button"') && !btnText.includes('onClick')) {
      const newBtnText = btnText.replace('<button', '<button onClick={() => alert(\'Tính năng đang được phát triển!\')}');
      content = content.substring(0, match.index) + newBtnText + content.substring(match.index + btnText.length);
      buttonRegex.lastIndex = match.index + newBtnText.length;
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
