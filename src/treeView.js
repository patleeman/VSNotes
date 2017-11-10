const vscode = require('vscode');
const fs = require('fs-extra');
const path = require('path');
const klaw = require('klaw');
const matter = require('gray-matter');


class VSNotesTreeView  {
  constructor () {
    const config = vscode.workspace.getConfiguration('vsnotes');
    this.baseDir = config.get('defaultNotePath');

    console.log('setup complete')
  }

  getChildren (node) {
    if (node) {
      console.log('node', node)
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
          type: 'rootTag'
        },
        {
          type: 'rootFile'
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
        return new vscode.TreeItem(node.file, state)
    }
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
              type: 'file',
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

  _getTags () {
    return new Promise((resolve, reject) => {
      let tagIndex = {}

      klaw(this.baseDir)
        .on('data', item => {
          fs.readFile(item.path).then(fileContents => {
            const parsedFrontMatter = matter(fileContents)
            if ('tags' in parsedFrontMatter.data) {
              for (let tag of parsedFrontMatter.data.tags) {

                const payload = {
                  type: 'file',
                  file: path.basename(item.path),
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