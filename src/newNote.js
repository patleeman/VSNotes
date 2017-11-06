
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// This function handles creation of a new note
module.exports = function () {
  // Get note folder
  const noteFolder = vscode.workspace.getConfiguration('vsnotes').get('defaultNotePath');

  if (noteFolder == null || !noteFolder) {
    vscode.window.showErrorMessage('Default note folder not found. Please run setup.');
    return
  }

  // Get the name for the note
  const inputBoxPromise = vscode.window.showInputBox({
    prompt: "Note Title",
    value: "Untitled"
  })

  inputBoxPromise.then(noteName => {
    if (noteName == null || !noteName) {
      console.log('Input cancelled')
      return false
    }

    // Generate file name
    let filename = Math.floor(Date.now() / 1000) + "_";
    if (noteName != null && noteName) {
      filename += noteName + '.md';
    } else {
      filename += 'Untitled.md';
    }

    // Create the file
    const createFilePromise = createFile(noteFolder, filename, '')
    console.log(createFilePromise)
    createFilePromise.then(filePath => {
      if (typeof filePath !== 'string') {
        console.error('Invalid file path')
        return false
      }

      vscode.window.showTextDocument(vscode.Uri.file(filePath), {
        preserveFocus: false,
        preview: false,
      }).then(textEditor => {
        console.log('Text editor created')
      })
    })

  }, err => {
    vscode.workspace.showErrorMessage('Error occurred while creating note.');
    console.error(err);
  })

}

// Create the given file
function createFile (folderPath, fileName, contents) {
  return new Promise((resolve, reject) => {
    if (folderPath == null || fileName == null) {
      reject();
    }
    const fullPath = path.join(folderPath, fileName);
    fs.writeFile(fullPath, contents, err => {
      if (err) reject(err);
      resolve(fullPath);
    });
  });
}