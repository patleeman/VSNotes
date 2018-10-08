
const vscode = require('vscode');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const {resolveHome} = require('./utils');

// This function handles creation of a new note
module.exports = function () {

  // Get settings
  const config = vscode.workspace.getConfiguration('vsnotes');
  const noteFolder = resolveHome(config.get('defaultNotePath'));
  const defaultNoteTitle = config.get('defaultNoteTitle');
  const defaultNoteName = config.get('defaultNoteName');
  const tokens = config.get('tokens');
  const snippetLangId = config.get('defaultSnippet.langId');
  const snippetName = config.get('defaultSnippet.name');
  const noteTitleConvertSpaces = config.get('noteTitleConvertSpaces');

  if (noteFolder == null || !noteFolder) {
    vscode.window.showErrorMessage('Default note folder not found. Please run setup.');
    return
  }

  // Get the name for the note
  const inputBoxPromise = vscode.window.showInputBox({
    prompt: `Note title? Current Format ${defaultNoteTitle}. Hit enter for instant note.`,
    value: "",
  })

  inputBoxPromise.then(noteName => {
    if (noteName == null || !noteName) {
      noteName = defaultNoteName
    }

    let fileName = replaceTokens(defaultNoteTitle, noteName, tokens);

    if (noteTitleConvertSpaces != null) {
      fileName = fileName.replace(/\s/g, noteTitleConvertSpaces);
    }

    // Create the file
    const createFilePromise = createFile(noteFolder, fileName, '');
    createFilePromise.then(filePath => {
      if (typeof filePath !== 'string') {
        console.error('Invalid file path')
        return false
      }

      vscode.window.showTextDocument(vscode.Uri.file(filePath), {
        preserveFocus: false,
        preview: false,
      }).then(() => {
        console.log('Note created successfully: ', filePath);
        // Insert the default note text
        if (snippetLangId != null && snippetName != null) {
          vscode.commands.executeCommand('editor.action.insertSnippet', ...[{ langId: snippetLangId, name: snippetName }]).then(res => {
            console.log(res)
          }, err => {
            console.error(err)
          })
        }
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
  let newFormat = format
  const pattern = /(?:\{)(.+?)(?:\})/g;
  let result;
  while ((result = pattern.exec(format)) != null) {
    for (let token of tokens) {
      if (token.token === result[0]) {
        switch (token.type) {
          case "datetime":
            newFormat = newFormat.replace(new RegExp(result[0], 'g'), moment().format(token.format));
            break;
          case "title":
            let prependedPath = [];
            // Check if its a nested path
            const splitTitle = title.split(path.sep);
            if (splitTitle.length > 1) {
              title = splitTitle[splitTitle.length - 1];
              prependedPath = splitTitle.slice(0,splitTitle.length - 1);
            }
            newFormat = prependedPath.concat(newFormat.replace(new RegExp(token.token, 'g'), title)).join(path.sep);
            break;
          case "extension":
            newFormat = newFormat.replace(new RegExp(token.token, 'g'), token.format)
            break;
        }
      }
    }
  }
  return newFormat;
}