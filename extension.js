const vscode = require('vscode');

const newNote = require('./src/newNote');
const instantNote = require('./src/instantNote');
const listNotes = require('./src/listNotes');
const listTags = require('./src/listTags')
const setupNotes = require('./src/setupNotes');
const VSNotesTreeView = require('./src/treeView');
const commitPush = require('./src/commitPush');
const search = require('./src/search');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const tv = new VSNotesTreeView()
    vscode.window.registerTreeDataProvider('vsnotes', tv);

    // Refresh View
    vscode.commands.registerCommand('extension.refreshVSNotesView', () => tv.refresh());

    // Create a new note
    let newNoteDisposable = vscode.commands.registerCommand('extension.newNote', newNote);
    context.subscriptions.push(newNoteDisposable);

    // Create a new instant note
    let instantNoteDisposable = vscode.commands.registerCommand('extension.instantNote', instantNote);
    context.subscriptions.push(instantNoteDisposable);

    // List recent notes in notes folder
    let listNotesDisposable = vscode.commands.registerCommand('extension.listNotes', listNotes);
    context.subscriptions.push(listNotesDisposable);

    // List tags
    let listTagsDisposable = vscode.commands.registerCommand('extension.listTags', listTags);
    context.subscriptions.push(listTagsDisposable);

    // Run setup
    let setupDisposable = vscode.commands.registerCommand('extension.setupNotes', setupNotes);
    context.subscriptions.push(setupDisposable);

    // Commit and Push
    let commitPushDisposable = vscode.commands.registerCommand('extension.commitPush', commitPush);
    context.subscriptions.push(commitPushDisposable);

    // Search
    let searchDisposable = vscode.commands.registerCommand('extension.search', search, {context: context});
    context.subscriptions.push(searchDisposable);

    // Open note folder in new workspace
    let openNoteFolderDisposable = vscode.commands.registerCommand('extension.openNoteFolder', () => {
      const uri = vscode.Uri.file(vscode.workspace.getConfiguration('vsnotes').get('defaultNotePath'));
      return vscode.commands.executeCommand('vscode.openFolder', uri, true);
    })
    context.subscriptions.push(openNoteFolderDisposable);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;