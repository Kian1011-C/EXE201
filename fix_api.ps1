$lines = Get-Content src/services/api.js
$lines = $lines | Where-Object { -not ($_ -match 'deleteContact|deleteDeal|deleteTicket|deleteTask|deleteCommission|deleteAdminAccount') }
$lines += "export async function deleteContact(id) { return await request(/contacts/${id}, { method: 'DELETE' }); }"
$lines += "export async function deleteDeal(id) { return await request(/deals/${id}, { method: 'DELETE' }); }"
$lines += "export async function deleteTicket(id) { return await request(/tickets/${id}, { method: 'DELETE' }); }"
$lines += "export async function deleteTask(id) { return await request(/tasks/${id}, { method: 'DELETE' }); }"
$lines += "export async function deleteCommission(id) { return await request(/commissions/${id}, { method: 'DELETE' }); }"
$lines += "export async function deleteAdminAccount(id) { return await request(/admin/accounts/${id}, { method: 'DELETE' }); }"
Set-Content src/services/api.js -Value $lines
