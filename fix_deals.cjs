const fs = require('fs');
const files = [
  'src/pages/dashboard/AdminDashboard.jsx', 
  'src/pages/dashboard/AgentDashboard.jsx', 
  'src/pages/dashboard/StaffDashboard.jsx', 
  'src/pages/dashboard/staff/StaffCustomerDocumentDetail.jsx',
  'src/pages/dashboard/staff/StaffTaskDetail.jsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/DEAL_DETAIL_DATA/g, '{}');
  content = content.replace(/CUSTOMER_DOCUMENT_DATA/g, '({ filesByCategory: {} })');
  fs.writeFileSync(file, content);
}
console.log('Fixed DEAL_DETAIL_DATA and CUSTOMER_DOCUMENT_DATA');
