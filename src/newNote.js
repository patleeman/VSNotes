
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

  if (noteFolder == null || !noteFolder) {
    vscode.window.showErrorMessage('Default note folder not found. Please run setup.');
    return
  }

  // Get the name for the note
  const inputBoxPromise = vscode.window.showInputBox({
    prompt: 'Note Title. Replaces title token. Current Format: ' + defaultNoteTitle + '',
    value: '',
  })

  inputBoxPromise.then(noteName => {
    if (noteName == null || !noteName) {
      console.log('Input cancelled')
      return false
    }

    let fileName = replaceTokens(defaultNoteTitle, noteName, tokens);

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


function replaceTokens (format, title, tokens) {
  console.log('replaceTokens', format, title, tokens)
  const pattern = /(?:\{)(.+?)(?:\})/g;
  var result;
  while ((result = pattern.exec(format)) != null) {
    for (let token of tokens) {
      if (token.token === result[0]) {
        switch (token.type) {
          case "datetime":
            format = format.replace(result[0], moment().format(token.format));
            break;
          case "title":
            let prependedPath = ''
            // Check if its a nested path
            const splitTitle = title.split(path.sep);
            console.log('split title ', splitTitle, path.sep)
            if (splitTitle.length > 1) {
              title = splitTitle[splitTitle.length - 1];
              prependedPath = splitTitle.slice(0,splitTitle.length - 1);
            }
            format = prependedPath.concat(format.replace(token.token, title)).join(path.sep);
            console.log(format)
            break;
          case "extension":
            format = format.replace(token.token, token.format)
            break;
        }
      }
    }
  }
  console.log('final format ', format)
  return format;
}