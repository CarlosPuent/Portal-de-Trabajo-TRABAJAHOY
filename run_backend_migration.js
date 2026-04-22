const { execSync } = require('child_process');
try {
  const result = execSync('npm run migration:run', { cwd: 'C:\\www\\TRABAJAHOY-BACKEND' });
  console.log(result.toString());
} catch (e) {
  console.error("Migration failed:", e.message);
  console.error(e.stdout ? e.stdout.toString() : '');
  console.error(e.stderr ? e.stderr.toString() : '');
}
