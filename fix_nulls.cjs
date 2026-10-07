const fs = require('fs');
const files = [
  'src/pages/dashboard/AdminDashboard.jsx', 
  'src/pages/dashboard/AgentDashboard.jsx', 
  'src/pages/dashboard/StaffDashboard.jsx', 
  'src/pages/dashboard/staff/StaffContactDetail.jsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\(isDemoSample \? null\.sourceOfLead\.contactOwner : 'The Best Rate Insurance'\)/g, "'The Best Rate Insurance'");
  content = content.replace(/contact \|\| null;/g, 'contact || {};');
  content = content.replace(/null\.primary \|\| \{\}/g, '{}');
  content = content.replace(/contact \? \{\} : \(null\.primary \|\| \{\}\)/g, '{}');
  content = content.replace(/if \(null && \(contact\?\.id === null\.id \|\| !contact\?\.id\)\) \{[\s\S]*?\}/g, '');
  content = content.replace(/null\.notes = newList;/g, '');
  content = content.replace(/null\.tasks = newTasks;/g, '');
  fs.writeFileSync(file, content);
}
console.log('Fixed null reference errors');
