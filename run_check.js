const { execSync } = require('child_process');
try {
  const result = execSync('node c:\\www\\Portal-de-Trabajo-TRABAJAHOY\\check_db_backend.js', { cwd: 'C:\\www\\TRABAJAHOY-BACKEND' });
  console.log(result.toString());
} catch (e) {
  console.error("Failed:", e.message);
  console.error(e.stdout ? e.stdout.toString() : '');
  console.error(e.stderr ? e.stderr.toString() : '');
}
