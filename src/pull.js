const vscode = require('vscode');
const process = require('child_process');
const { resolveHome } = require('./utils');

module.exports = function () {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const noteFolder = resolveHome(config.get('defaultNotePath'));
  const command = config.get('pullShellCommand');
  const options = {
    cwd: noteFolder
  }

  process.exec(command, options, function (err, stdout, stderr) {
    if (err) {
      vscode.window.showErrorMessage('Pull failed to execute. Check console for more information');
      console.error('Pull failed. Here is the error: ', err);
    } else {
      vscode.window.showInformationMessage(`Pull Finished`);
      console.log(stdout, stderr);
    }
  })
}