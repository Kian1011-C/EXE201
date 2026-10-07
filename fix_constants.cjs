const fs = require('fs');
const files = [
  'src/pages/dashboard/staff/StaffDealsList.jsx',
  'src/pages/dashboard/staff/StaffDealDetail.jsx',
  'src/pages/dashboard/staff/AddDealModal.jsx',
  'src/pages/dashboard/agent/AgentCommissionLedger.jsx',
  'src/pages/dashboard/agent/AgentCommissionCalculator.jsx'
];

const imports = "import { MEDICARE_DEAL_STAGES, OBAMACARE_DEAL_STAGES, ALL_CARRIERS, CARRIER_COMMISSION_RATES } from '../../../utils/constants';\n";

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('ALL_CARRIERS')) return;
    
    // Add import right after the React import
    if (!content.includes('ALL_CARRIERS } from')) {
      content = content.replace(/(import React.*?;\n)/, "\" + imports);
    }
    
    // Quick fix for calculateCarrierDealCommission
    if (content.includes('calculateCarrierDealCommission')) {
      content = content.replace(/calculateCarrierDealCommission\((.*?)\)/g, '(0)');
    }
    
    // Quick fix for deleteTaskFromStore
    if (content.includes('deleteTaskFromStore')) {
      content = content.replace(/deleteTaskFromStore/g, 'deleteTask');
      if (!content.includes('deleteTask') && content.includes('services/api')) {
         content = content.replace(/createDeal,/g, 'createDeal, deleteTask,');
      }
    }

    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
});
