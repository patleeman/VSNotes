
const fs = require('fs-extra');
const vscode = require('vscode');

function deleteNote(note) {
  fs.remove(note.path, err => {
      if(err) return console.error(err);
      console.log('successfully remove note');
      vscode.commands.executeCommand('vsnotes.refreshVSNotesView');
  });
}

module.exports = {
  deleteNote
}
