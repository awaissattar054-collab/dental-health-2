const { execSync } = require('child_process');
try {
  console.log('--- Finding zip, tar, gz files ---');
  const findCmd = 'find / -name "*.zip" -o -name "*.tar.gz" -o -name "*.tgz" -not -path "/usr*" -not -path "/var*" -not -path "/proc*" 2>/dev/null';
  console.log(execSync(findCmd, { encoding: 'utf8' }));
} catch (err) {
  console.error('Error:', err.message);
}
