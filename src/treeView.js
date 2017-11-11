const vscode = require('vscode');
const fs = require('fs-extra');
const path = require('path');
const klaw = require('klaw');
const matter = require('gray-matter');


class VSNotesTreeView  {
  constructor () {
    const config = vscode.workspace.getConfiguration('vsnotes');
    this.baseDir = config.get('defaultNotePath');
    this.ignorePattern = new RegExp(config.get('ignorePatterns')
      .map(function (pattern) {return '(' + pattern + ')'})
      .join('|'));

    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh () {
    this._onDidChangeTreeData.fire();
  }

  getChildren (node) {
    if (node) {
      switch (node.type) {
        case 'rootTag':
          this.tags = Promise.resolve(this._getTags(this.baseDir))
          return this.tags;
        case 'tag':
          console.log('tag', node)
          return node.files;
        case 'rootFile':
          return Promise.resolve(this._getDirectoryContents(this.baseDir));
        case 'file':
          return Promise.resolve(this._getDirectoryContents(node.path));
      }
    } else {
      return [
        {
          type: 'rootFile'
        },
        {
          type: 'rootTag'
        }
      ];
    }
  }

  getTreeItem (node) {
    switch (node.type) {
      case 'rootTag':
        return new vscode.TreeItem('Tags', vscode.TreeItemCollapsibleState.Collapsed);
      case 'rootFile':
        return new vscode.TreeItem('Files', vscode.TreeItemCollapsibleState.Collapsed);
      case 'tag':
        return new vscode.TreeItem(node.tag, vscode.TreeItemCollapsibleState.Collapsed);
      case 'file':
        const state = node.stats.isDirectory() ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        const treeItem = new vscode.TreeItem(node.file, state)
        treeItem.command = {
          command: 'vscode.open',
          title: '',
          arguments: [vscode.Uri.file(node.path)]
        }
        return treeItem;
    }
  }

  // Given a filepath, return an array of TreeItems
  _getDirectoryContents (filePath) {
    return new Promise ((resolve, reject) => {
      fs.readdir(filePath).then(files => {
        let items = [];
        files.forEach(file => {

          if (!this.ignorePattern.test(file)) {
            console.log(file, this.ignorePattern.test(file))
            items.push({
              type: 'file',
              file: file,
              path: path.join(filePath, file),
              stats: fs.statSync(path.join(filePath, file))
            });
          }
        });
        console.log('items', items)
        resolve(items);
      }).catch(err => {
        reject(err);
      })
    })
  }

  _getTags () {
    return new Promise((resolve, reject) => {
      let tagIndex = {}

      klaw(this.baseDir)
        .on('data', item => {
          const fileName = path.basename(item.path);
          if (!this.ignorePattern.test(fileName)) {
            fs.readFile(item.path).then(fileContents => {
              const parsedFrontMatter = matter(fileContents)
              if ('tags' in parsedFrontMatter.data) {
                for (let tag of parsedFrontMatter.data.tags) {

                  const payload = {
                    type: 'file',
                    file: fileName,
                    path: item.path,
                    stats: fs.statSync(item.path)
                  }

                  if (tag in tagIndex) {
                    tagIndex[tag].push(payload)
                  } else {
                    tagIndex[tag] = [payload]
                  }
                }
              }
            }).catch(err => {
              console.error(err)
            })
          }
        })
        .on('error', (err, item) => {
          reject(err)
          console.error('Error while walking notes folder for tags: ', item, err);
        })
        .on('end', () => {
          let tags = []
          for (let tag of Object.keys(tagIndex)) {

            tags.push({
              type: 'tag',
              tag: tag,
              files: tagIndex[tag]
            })
          }

          resolve(tags)
        })
      })
  }
}

module.exports = VSNotesTreeView;