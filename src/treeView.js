const vscode = require('vscode');
const fs = require('fs-extra');
const path = require('path');
const klaw = require('klaw');

class VSNotesTreeView  {
  constructor () {
    const config = vscode.workspace.getConfiguration('vsnotes');
    this.baseDir = config.get('defaultNotePath');

    console.log('setup complete')
  }

  getChildren (node) {
    if (node) {
      console.log('not root', node)
      return Promise.resolve(this._getDirectoryContents(node.path))
    } else {
      console.log('root')
      return Promise.resolve(this._getDirectoryContents(this.baseDir))
    }
  }

  getTreeItem (node) {
    const state = node.stats.isDirectory() ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    return new vscode.TreeItem(node.file, state)
  }

  // Given a filepath, return an array of TreeItems
  _getDirectoryContents (filePath) {
    return new Promise ((resolve, reject) => {
      fs.readdir(filePath).then(files => {
        let items = [];
        files.forEach(file => {
          if (!file.startsWith('.')) {
            const fileStats = fs.statSync(path.join(filePath, file));
            items.push({
              file: file,
              path: path.join(filePath, file),
              stats: fileStats
            });
          }
        })
        console.log('items', items)
        resolve(items);
      }).catch(err => {
        reject(err);
      })
    })
  }

}

module.exports = VSNotesTreeView;