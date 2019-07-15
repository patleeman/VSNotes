const vscode = require('vscode');

const {newNote, newNoteInWorkspace} = require('./src/newNote');
const listNotes = require('./src/listNotes');
const listTags = require('./src/listTags')
const setupNotes = require('./src/setupNotes');
const VSNotesTreeView = require('./src/treeView');
const commitPush = require('./src/commitPush');
const search = require('./src/search');
const utils = require('./src/utils');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const tv = new VSNotesTreeView()
    vscode.window.registerTreeDataProvider('vsnotes', tv);

    // Refresh View
    vscode.commands.registerCommand('vsnotes.refreshVSNotesView', () => tv.refresh());

    // Create a new note
    let newNoteDisposable = vscode.commands.registerCommand('vsnotes.newNote', newNote);
    context.subscriptions.push(newNoteDisposable);

    // Create a new note in a current workspace
    let newNoteInWorkspaceDisposable = vscode.commands.registerCommand('vsnotes.newNoteInWorkspace', newNoteInWorkspace);
    context.subscriptions.push(newNoteInWorkspaceDisposable);

    // Open a note
    let listNotesDisposable = vscode.commands.registerCommand('vsnotes.listNotes', listNotes);
    context.subscriptions.push(listNotesDisposable);

    // List tags
    let listTagsDisposable = vscode.commands.registerCommand('vsnotes.listTags', listTags);
    context.subscriptions.push(listTagsDisposable);

    // Run setup
    let setupDisposable = vscode.commands.registerCommand('vsnotes.setupNotes', setupNotes);
    context.subscriptions.push(setupDisposable);

    // Commit and Push
    let commitPushDisposable = vscode.commands.registerCommand('vsnotes.commitPush', commitPush);
    context.subscriptions.push(commitPushDisposable);

    // Search
    let searchDisposable = vscode.commands.registerCommand('vsnotes.search', search, {context: context});
    context.subscriptions.push(searchDisposable);

    // Open note folder in new workspace
    let openNoteFolderDisposable = vscode.commands.registerCommand('vsnotes.openNoteFolder', () => {
      const uri = vscode.Uri.file(vscode.workspace.getConfiguration('vsnotes').get('defaultNotePath'));
      const folderPath = utils.resolveHome(uri)
      return vscode.commands.executeCommand('vscode.openFolder', folderPath, true);
    })
    context.subscriptions.push(openNoteFolderDisposable);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;