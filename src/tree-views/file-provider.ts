import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { resolveHome } from '../utils';

export class FileTreeDataProvider implements vscode.TreeDataProvider<FileTreeItem> {
  config = vscode.workspace.getConfiguration('vsnotes');
  hideFiles: boolean;
  ignorePattern: RegExp;
  onChangeEmitter: vscode.EventEmitter<FileTreeItem> = new vscode.EventEmitter<FileTreeItem>();
  onDidChangeTreeData: vscode.Event<FileTreeItem> = this.onChangeEmitter.event;
  baseDir: string;

  constructor() {
    this.hideFiles = this.config.get('treeviewHideFiles', false);
    this.ignorePattern = new RegExp(this.config.get('ignorePatterns', [])
      .map(pattern => `(${pattern})`)
      .join('|'));
    this.baseDir = resolveHome(this.config.get('defaultNotePath'));
  }

  refresh = () => this.onChangeEmitter.fire();

  getChildren = (fileTreeItem?: FileTreeItem): Promise<FileTreeItem[]> => {
    let fileTreeItems: FileTreeItem[] = [];

    if (fileTreeItem) {
      return fileTreeItem.type === 'rootFile' ?
        Promise.resolve(this.getDirectoryContents(this.baseDir)) :
        Promise.resolve(this.getDirectoryContents(fileTreeItem.path))
    } else {
      if (!this.hideFiles) {
        fileTreeItems.push({
          collapsibleState: vscode.TreeItemCollapsibleState.None,
          label: '',
          fileName: '',
          path: '',
          type: 'rootFile'
        })
      }
      return Promise.resolve(fileTreeItems);
    }
  }

  getTreeItem = (element: FileTreeItem): vscode.TreeItem => {
    if (element.type === 'rootFile') {
      let rootFileTreeItem = new vscode.TreeItem('Files', vscode.TreeItemCollapsibleState.Collapsed);
      rootFileTreeItem.iconPath = {
        light: path.join(__filename, '..', '..', 'media', 'light', 'file-directory.svg'),
        dark: path.join(__filename, '..', '..', 'media', 'dark', 'file-directory.svg')
      };
      return rootFileTreeItem;
    }

    else {
      let isDir = element.stats && element.stats.isDirectory()
      const state = isDir ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
      let fileTreeItem = new vscode.TreeItem(element.fileName, state)
      fileTreeItem.command = {
        command: 'vscode.open',
        title: '',
        arguments: [vscode.Uri.file(element.path)]
      }
      if (isDir) {
        fileTreeItem.iconPath = {
          light: path.join(__filename, '..', '..', 'media', 'light', 'file-directory.svg'),
          dark: path.join(__filename, '..', '..', 'media', 'dark', 'file-directory.svg')
        };
      } else {
        fileTreeItem.iconPath = {
          light: path.join(__filename, '..', '..', 'media', 'light', 'file.svg'),
          dark: path.join(__filename, '..', '..', 'media', 'dark', 'file.svg')
        };
      }
      return fileTreeItem;

    }
  }
  
  private getDirectoryContents = (filePath: string): Promise<FileTreeItem[]> => 
    new Promise ((resolve, reject) => {
      fs.readdir(filePath).then(files => {
        let fileTreeItems: FileTreeItem[] = [];
        files.forEach(file => {
          if (!this.ignorePattern.test(file)) {
            fileTreeItems.push({
              type: 'file',
              label: '',
              fileName: file,
              path: path.join(filePath, file),
              stats: fs.statSync(path.join(filePath, file))
            });
          }
        });
        resolve(fileTreeItems);
      }).catch(err => {
        reject(err);
      })
    })
}

class FileTreeItem extends vscode.TreeItem {
  type: string;
  fileName: string;
  path: string;
  stats?: fs.Stats;

  constructor(
    type: string,
    fileName: string,
    path: string,
		label: string, 
		collapsibleState: vscode.TreeItemCollapsibleState,
    stats?: fs.Stats, 
		command?: vscode.Command
	) {
		super(label, collapsibleState);
    this.type = type;
    this.fileName = fileName;
    this.path = path;
    this.stats = stats;
		this.command = command;
  }
  
}