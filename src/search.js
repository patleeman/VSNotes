const vscode = require('vscode');
const {resolveHome} = require('./utils');

module.exports = async function () {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const folderPath = vscode.Uri.file(resolveHome(config.get('defaultNotePath')));

  // We need to check if a workspace folder is open. VSCode doesn't allow
  // findInFile if a workspace folder isn't available.
  const openWorkspace = vscode.workspace.workspaceFolders;
  if (openWorkspace == null) {
    vscode.window.showWarningMessage('Whoops, can\'t search without an open folder in the workspace. Open notes folder?', ...['Open']).then(val => {
      if (val == 'Open') {
        vscode.commands.executeCommand('vscode.openFolder', folderPath)
      }
    })
  } else {
    vscode.commands.executeCommand('filesExplorer.findInFolder', folderPath)
  }
}