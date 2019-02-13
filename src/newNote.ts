// const vscode = require('vscode');
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as moment from 'moment';
import { resolveHome } from './utils';

interface Note {
  folder: string;
  template?: string;
}

// This function handles creation of a new note in default note folder
export function newNote() {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const folder = <string>resolveHome(config.get('defaultNotePath', ''));
  const templates = config.get('templates', []);

  if (!templates || !templates.length) {
    createNote({ folder });
    return;
  }

  vscode.window
    .showQuickPick(templates, {
      placeHolder: 'Please select a template. Hit esc to use default.',
    })
    .then(
      template => {
        console.log(template);
        createNote({ folder, template });
      },
      err => {
        console.error(err);
      }
    );
}

export function newNoteInWorkspace() {
  const workspaces = vscode.workspace.workspaceFolders;
  if (workspaces == null || workspaces.length === 0) {
    vscode.window.showErrorMessage('No workspaces open.');
    return;
  } else if (workspaces.length === 1) {
    createNote({ folder: workspaces[0].uri.fsPath });
  } else {
    const spaces: string[] = [];
    workspaces.forEach(workspace => {
      spaces.push(workspace.name);
    });

    // Show dialog and ask which workspace to use.
    vscode.window.showQuickPick(spaces).then(workspaceName => {
      workspaces.every(workspace => {
        if (workspace.name === workspaceName) {
          const uri = workspace.uri;
          createNote({ folder: uri.fsPath });
          return false;
        }
        return true;
      });
    });
  }
}

function createNote({ folder: noteFolder, template }: Note) {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const defaultNoteTitle = config.get('defaultNoteTitle');
  const defaultNoteName = config.get<string>('defaultNoteName');
  const tokens = config.get('tokens');
  const noteTitleConvertSpaces = config.get('noteTitleConvertSpaces');

  if (noteFolder == null || !noteFolder) {
    vscode.window.showErrorMessage('Default note folder not found. Please run setup.');
    return;
  }

  // Get the name for the note
  const inputBoxPromise = vscode.window.showInputBox({
    prompt: `Note title? Current Format ${defaultNoteTitle}. Hit enter for instant note.`,
    value: '',
  });

  inputBoxPromise.then(
    noteName => {
      // Check for aborting the new note dialog
      if (noteName == null) {
        return false;
      }

      // Check for empty string but confirmation in the new note dialog
      if (noteName == '' || !noteName) {
        noteName = defaultNoteName;
      }

      let fileName = replaceTokens(defaultNoteTitle, noteName, tokens);

      if (noteTitleConvertSpaces != null) {
        fileName = fileName.replace(/\s/g, noteTitleConvertSpaces);
      }

      // Create the file
      const createFilePromise = createFile(noteFolder, fileName);
      createFilePromise.then(filePath => {
        if (typeof filePath !== 'string') {
          console.error('Invalid file path');
          return false;
        }

        vscode.window
          .showTextDocument(vscode.Uri.file(filePath), {
            preserveFocus: false,
            preview: false,
          })
          .then(() => {
            console.log('Note created successfully: ', filePath);

            createTemplate({ template });
          });
      });
    },
    err => {
      vscode.window.showErrorMessage('Error occurred while creating note.');
      console.error(err);
    }
  );
}

function createTemplate({ template }) {
  const config = vscode.workspace.getConfiguration('vsnotes');

  if (template) {
    vscode.commands
      .executeCommand('editor.action.insertSnippet', ...[{ langId: 'markdown', name: `vsnote_${template}` }])
      .then(
        res => {
          vscode.window.showInformationMessage(`Note for "${template}" created!`);
          console.log('template created: ', res);
        },
        err => {
          vscode.window.showErrorMessage('Template creation error.');
          console.error('template creation error: ', err);
        }
      );
  } else {
    // default template
    const snippetLangId = config.get('defaultSnippet.langId');
    const snippetName = config.get('defaultSnippet.name');

    // Insert the default note text
    if (snippetLangId != null && snippetName != null) {
      vscode.commands
        .executeCommand('editor.action.insertSnippet', ...[{ langId: snippetLangId, name: snippetName }])
        .then(
          res => {
            console.log(res);
          },
          err => {
            console.error(err);
          }
        );
    }
  }
}

// Create the given file if it doesn't exist
function createFile(folderPath, fileName) {
  return new Promise((resolve, reject) => {
    if (folderPath == null || fileName == null) {
      reject();
    }
    const fullPath = path.join(folderPath, fileName);
    // fs-extra
    fs.ensureFile(fullPath)
      .then(() => {
        resolve(fullPath);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function replaceTokens(format, title, tokens) {
  let newFormat = format;
  const pattern = /(?:\{)(.+?)(?:\})/g;
  let result;
  while ((result = pattern.exec(format)) != null) {
    for (let token of tokens) {
      if (token.token === result[0]) {
        switch (token.type) {
          case 'datetime':
            newFormat = newFormat.replace(new RegExp(result[0], 'g'), moment().format(token.format));
            break;
          case 'title':
            let prependedPath = [];
            // Check if its a nested path
            const splitTitle = title.split(path.sep);
            if (splitTitle.length > 1) {
              title = splitTitle[splitTitle.length - 1];
              prependedPath = splitTitle.slice(0, splitTitle.length - 1);
            }
            newFormat = prependedPath.concat(newFormat.replace(new RegExp(token.token, 'g'), title)).join(path.sep);
            break;
          case 'extension':
            newFormat = newFormat.replace(new RegExp(token.token, 'g'), token.format);
            break;
        }
      }
    }
  }
  return newFormat;
}
