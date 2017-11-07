
const vscode = require('vscode');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

// This function handles creation of a new note
module.exports = function () {

  // Get note folder
  const config = vscode.workspace.getConfiguration('vsnotes');
  const noteFolder = config.get('defaultNotePath');
  const filenameFormat = config.get('defaultFilenameFormat');

  if (noteFolder == null || !noteFolder) {
    vscode.window.showErrorMessage('Default note folder not found. Please run setup.');
    return
  }

  // Get the name for the note
  const filename = generateFilename(filenameFormat)
  const titleIdx = filename.indexOf('{title}')
  const inputBoxPromise = vscode.window.showInputBox({
    prompt: 'Note Title',
    value: filename,
    valueSelection: [titleIdx, titleIdx + 7]
  })

  inputBoxPromise.then(noteName => {
    if (noteName == null || !noteName) {
      console.log('Input cancelled')
      return false
    }

    // Create the file
    const createFilePromise = createFile(noteFolder, noteName, '')
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

// Create the given file if it doesn't exist
function createFile (folderPath, fileName) {
  return new Promise((resolve, reject) => {
    if (folderPath == null || fileName == null) {
      reject();
    }
    const fullPath = path.join(folderPath, fileName);
    // fs-extra
    fs.ensureFile(fullPath).then(() => {
      resolve(fullPath)
    }).catch(err => {
      reject(err)
    })
  });
}

// Generate a filename from a file name template
function generateFilename (filenameTemplateString) {
  const pattern = /(?:\{)(.+?)(?:\})/g;
  var result;
  while ((result = pattern.exec(filenameTemplateString)) != null) {
    switch (result[0]) {
      case '{title}':
        break;
      default:
        const time = moment().format(result[1]);
        filenameTemplateString = filenameTemplateString.replace(result[0], time);
    }
  }

  if (!filenameTemplateString.endsWith('.md')) {
    filenameTemplateString += '.md';
  }

  return filenameTemplateString;
}