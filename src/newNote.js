
const vscode = require('vscode');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

// This function handles creation of a new note
module.exports = function () {

  // Get settings
  const config = vscode.workspace.getConfiguration('vsnotes');
  const noteFolder = config.get('defaultNotePath');
  const defaultNoteTitle = config.get('defaultNoteTitle');
  const tokens = config.get('tokens');
  console.log('tokens first', tokens)
  const titleStart = defaultNoteTitle.indexOf('{title}') || 0;
  const titleEnd = titleStart + 7 > defaultNoteTitle.length ? defaultNoteTitle.length : titleStart + 7

  if (noteFolder == null || !noteFolder) {
    vscode.window.showErrorMessage('Default note folder not found. Please run setup.');
    return
  }

  // Get the name for the note
  const inputBoxPromise = vscode.window.showInputBox({
    prompt: 'Note Title',
    value: defaultNoteTitle,
    valueSelection: [titleStart, titleEnd]
  })

  inputBoxPromise.then(noteName => {
    if (noteName == null || !noteName) {
      console.log('Input cancelled')
      return false
    }

    let fileName = replaceTokens(noteName, tokens);

    // Create the file
    const createFilePromise = createFile(noteFolder, fileName, '')
    createFilePromise.then(filePath => {
      if (typeof filePath !== 'string') {
        console.error('Invalid file path')
        return false
      }

      vscode.window.showTextDocument(vscode.Uri.file(filePath), {
        preserveFocus: false,
        preview: false,
      }).then(() => {
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


function replaceTokens (tokenString, tokens) {
  console.log('tokens', tokens)
  const pattern = /(?:\{)(.+?)(?:\})/g;
  var result;
  while ((result = pattern.exec(tokenString)) != null) {
    for (let token of tokens) {
      // If the token matches
      console.log(token.token, result[0])
      if (token.token === result[0]) {
        switch (token.type) {
          case "datetime":
            tokenString = tokenString.replace(result[0], moment().format(token.format));
            break;
          case "title":
            tokenString = tokenString.replace(token.token, token.format)
            break;
          case "extension":
            tokenString = tokenString.replace(token.token, token.format)
            break;
        }
      }
    }
  }
  return tokenString;
}