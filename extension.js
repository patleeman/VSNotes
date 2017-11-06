const vscode = require('vscode');

const newNote = require('./src/newNote.js');
const listNotes = require('./src/listNotes.js');
const setupNotes = require('./src/setupNotes.js');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Create a new note
    let newNoteDisposable = vscode.commands.registerCommand('extension.newNote', newNote);
    context.subscriptions.push(newNoteDisposable);

    // List recent notes in notes folder
    let listNotesDisposable = vscode.commands.registerCommand('extension.listNotes', listNotes);
    context.subscriptions.push(listNotesDisposable);

    // Run setup
    let setupDisposable = vscode.commands.registerCommand('extension.setupNotes', setupNotes);
    context.subscriptions.push(setupDisposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;