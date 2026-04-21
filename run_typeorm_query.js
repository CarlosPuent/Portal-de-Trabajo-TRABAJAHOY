const { execSync } = require('child_process');
try {
  const result = execSync('npx typeorm query "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'job_applications\';" -d src/database/data-source.js', { cwd: 'C:\\www\\TRABAJAHOY-BACKEND' });
  console.log(result.toString());
} catch (e) {
  console.error("Failed:", e.message);
  console.error(e.stdout ? e.stdout.toString() : '');
  console.error(e.stderr ? e.stderr.toString() : '');
}
