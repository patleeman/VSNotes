
const vscode = require('vscode');

module.exports = function () {
  const msg = 'Welcome to VSNotes. To begin, choose a location to save your notes.';

  const startOption = vscode.window.showInformationMessage(msg, ...['Start']);
  startOption.then(value => {

    if (value === 'Start') {
      console.log('start');

      // Open a folder picker for user to choose note folder
      const uriPromise = vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select'
      });

      uriPromise.then(res => {
        console.log(res)
        if (res.length > 0 && res[0].path) {
          const noteFolder = vscode.workspace.getConfiguration('vsnotes');
          const update = noteFolder.update('defaultNotePath', res[0].path)
          update.then(value => {
            vscode.window.showInformationMessage('Note Path Saved')
          })
        }
      })

    }
  })
}
