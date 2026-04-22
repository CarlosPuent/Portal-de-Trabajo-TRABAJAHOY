const { execSync } = require('child_process');
try {
  console.log("Generating migration...");
  const genResult = execSync('npx typeorm migration:generate -d src/database/data-source.js src/database/migrations/UpdateApplicationsTable', { cwd: 'C:\\www\\TRABAJAHOY-BACKEND' });
  console.log(genResult.toString());

  console.log("Running migration...");
  const runResult = execSync('npm run migration:run', { cwd: 'C:\\www\\TRABAJAHOY-BACKEND' });
  console.log(runResult.toString());
} catch (e) {
  console.error("Migration failed:", e.message);
  console.error(e.stdout ? e.stdout.toString() : '');
  console.error(e.stderr ? e.stderr.toString() : '');
}
