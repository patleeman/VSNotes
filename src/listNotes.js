
const vscode = require('vscode');
const klaw = require('klaw');
const path = require('path');
const moment = require('moment');

module.exports = function () {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const noteFolder = config.get('defaultNotePath');
  const listRecentLimit = config.get('listRecentLimit');
  const noteFolderLen = noteFolder.length;
  let files = [];

  // Using klaw, recursively iterate through notes directory.
  klaw(noteFolder)
    .on('data', item => {
      if (item.path.toLowerCase().endsWith('.md')) {
        files.push(item);
      }
    })
    .on('error', (err, item) => {
      vscode.window.showErrorMessage('Error occurred while scanning file: ' + item)
      console.error('Error while walking notes folder: ', item, err);
    })
    .on('end', () => {
      // Sort files and generate path array
      files = files.sort(function (a, b) {
        const aTime = new Date(a.stats.mtime);
        const bTime = new Date(b.stats.mtime);
        if (aTime > bTime) {
          return 1;
        } else if (aTime < bTime) {
          return -1;
        } else {
          return 0;
        }
      });
      const shortPaths = [];
      for (let j = 0; j < files.length; j++) {
        if (j >= listRecentLimit) {
          break;
        }
        shortPaths.push(files[j].path.slice(noteFolderLen + 1, files[j].path.length));
      }

      vscode.window.showQuickPick(shortPaths.reverse()).then(res => {
        if (res != null && res ) {
          vscode.window.showTextDocument(vscode.Uri.file(path.join(noteFolder, res))).then(file => {
            console.log('Opening file.');
          }, err => {
            console.error(err);
          })
        }
      }, err => {
        console.error(err);
      })
    });
}
