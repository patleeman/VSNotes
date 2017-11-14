
const vscode = require('vscode');
const path = require('path');

module.exports = function () {
  const msg = 'Welcome to VSNotes. To begin, choose a location to save your notes. Click Start to continue ->';

  const startOption = vscode.window.showInformationMessage(msg, ...['Start']);
  startOption.then(value => {

    if (value === 'Start') {
      // Open a folder picker for user to choose note folder
      const uriPromise = vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select'
      });

      uriPromise.then(res => {
        if (res.length > 0 && res[0].fsPath) {
          const noteFolder = vscode.workspace.getConfiguration('vsnotes');
          const update = noteFolder.update('defaultNotePath', path.normalize(res[0].fsPath), true);
          update.then(() => {
            vscode.window.showInformationMessage('Note Path Saved. Edit the location by re-running setup or editing the path in VS Code Settings.');
          });
        }
      }).catch(err => {
        vscode.window.showErrorMessage('Error occurred during setup.')
        console.error(err)
      });

    }
  })
}
