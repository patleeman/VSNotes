
const vscode = require('vscode');

// This function handles creation of a new note
module.exports = function () {
  // Get note folder
  const noteFolder = vscode.workspace.getConfiguration('vsnotes').get('defaultNotePath');
  console.log('note folder', noteFolder)
  if (noteFolder == null || !noteFolder) {
    vscode.window.showErrorMessage('Default note folder not found. Please run setup.');
    return
  }
  console.log(noteFolder)
  // Display a message box to the user
  vscode.window.showInformationMessage('Look ma, i\'m making a new note!');
}