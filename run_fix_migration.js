const { execSync } = require('child_process');
const fs = require('fs');

// Remove bad .ts migration file
const badFile = 'C:\\www\\TRABAJAHOY-BACKEND\\src\\database\\migrations\\1776787854048-UpdateApplicationsTable.ts';
if (fs.existsSync(badFile)) {
  fs.unlinkSync(badFile);
  console.log('Removed bad .ts migration file');
} else {
  console.log('Bad .ts file already gone');
}

// Run migration
try {
  const result = execSync('npm run migration:run', { cwd: 'C:\\www\\TRABAJAHOY-BACKEND', stdio: 'pipe' });
  console.log(result.toString());
} catch (e) {
  console.error("Migration failed:", e.message);
  if (e.stdout) console.error(e.stdout.toString());
  if (e.stderr) console.error(e.stderr.toString());
}
