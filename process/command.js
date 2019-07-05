const childProcess = require('child_process');

function command(cmd) {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) reject('runCommand() couldnt execute command on terminal:' + err);
      else resolve([stdout, stderr]);
    });
  });
}

module.exports = {
  command,
};
