import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as klaw from 'klaw';
import * as matter from 'gray-matter';
import { resolveHome } from './utils';

export class VSNotesTreeView implements vscode.TreeDataProvider<VSNotesNode> {
  config = vscode.workspace.getConfiguration('vsnotes');
  baseDir = <string>resolveHome(this.config.get('defaultNotePath', ''));
  ignorePattern: RegExp = new RegExp(
    this.config
      .get('ignorePatterns', [])
      .map(function(pattern) {
        return '(' + pattern + ')';
      })
      .join('|')
  );
  hideTags: boolean = this.config.get('treeviewHideTags', false);
  hideFiles: boolean = this.config.get('treeviewHideFiles', false);
  onChangeEmitter: vscode.EventEmitter<VSNotesNode> = new vscode.EventEmitter<VSNotesNode>();
  onDidChangeTreeData: vscode.Event<VSNotesNode> = this.onChangeEmitter.event;

  refresh() {
    this.onChangeEmitter.fire();
  }

  getChildren(node?: VSNotesNode): Promise<Node[]> | Promise<Tag[]> | Promise<File[]> | File[] {
    if (node) {
      switch (node.type) {
        case 'rootTag':
          return Promise.resolve(this.getTags());
        case 'tag':
          return (<Tag>node).files;
        case 'rootFile':
          return Promise.resolve(this.getDirectoryContents(this.baseDir));
        case 'file':
          return Promise.resolve(this.getDirectoryContents((<File>node).path));
        default:
          throw new Error(`Unreachable Case: ${node.type}`);
      }
    } else {
      let treeview: Node[] = [];
      if (!this.hideFiles) {
        treeview.push({
          type: 'rootFile',
        });
      }
      if (!this.hideTags) {
        treeview.push({
          type: 'rootTag',
        });
      }
      return Promise.resolve(treeview);
    }
  }

  getTreeItem(node: VSNotesNode): vscode.TreeItem {
    switch (node.type) {
      case 'rootTag':
        let rootTagTreeItem = new vscode.TreeItem('Tags', vscode.TreeItemCollapsibleState.Collapsed);
        rootTagTreeItem.iconPath = {
          light: path.join(__filename, '..', '..', 'media', 'light', 'tag.svg'),
          dark: path.join(__filename, '..', '..', 'media', 'dark', 'tag.svg'),
        };
        return rootTagTreeItem;
      case 'rootFile':
        let rootFileTreeItem = new vscode.TreeItem('Files', vscode.TreeItemCollapsibleState.Collapsed);
        rootFileTreeItem.iconPath = {
          light: path.join(__filename, '..', '..', 'media', 'light', 'file-directory.svg'),
          dark: path.join(__filename, '..', '..', 'media', 'dark', 'file-directory.svg'),
        };
        return rootFileTreeItem;
      case 'tag':
        let tagTreeItem = new vscode.TreeItem((<Tag>node).tag, vscode.TreeItemCollapsibleState.Collapsed);
        tagTreeItem.iconPath = {
          light: path.join(__filename, '..', '..', 'media', 'light', 'tag.svg'),
          dark: path.join(__filename, '..', '..', 'media', 'dark', 'tag.svg'),
        };
        return tagTreeItem;
      case 'file':
        let isDir = (<File>node).stats.isDirectory();
        let state = isDir ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
        let fileTreeItem = new vscode.TreeItem((<File>node).file, state);

        if (isDir) {
          fileTreeItem.iconPath = {
            light: path.join(__filename, '..', '..', 'media', 'light', 'file-directory.svg'),
            dark: path.join(__filename, '..', '..', 'media', 'dark', 'file-directory.svg'),
          };
        } else {
          fileTreeItem.command = {
            command: 'vscode.open',
            title: '',
            arguments: [vscode.Uri.file((<File>node).path)],
          };
          fileTreeItem.iconPath = {
            light: path.join(__filename, '..', '..', 'media', 'light', 'file.svg'),
            dark: path.join(__filename, '..', '..', 'media', 'dark', 'file.svg'),
          };
        }
        return fileTreeItem;
      default:
        throw new Error(`Unreachable Case: ${node.type}`);
    }
  }

  // Given a filepath, return an array of TreeItems
  private getDirectoryContents = (filePath: string): Promise<File[]> => {
    return new Promise((resolve, reject) => {
      fs.readdir(filePath)
        .then(files => {
          let items: File[] = [];
          files.forEach(file => {
            if (!this.ignorePattern.test(file)) {
              items.push({
                type: 'file',
                file: file,
                path: path.join(filePath, file),
                stats: fs.statSync(path.join(filePath, file)),
              });
            }
          });
          resolve(items);
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  private getTags = (): Promise<Tag[]> => {
    return new Promise((resolve, reject) => {
      let files: Promise<TagFile>[] = [];

      klaw(this.baseDir)
        .on('data', item => {
          files.push(
            new Promise((res, rej) => {
              const fileName = path.basename(item.path);
              if (!item.stats.isDirectory() && !this.ignorePattern.test(fileName)) {
                fs.readFile(item.path)
                  .then(contents => {
                    res({
                      path: item.path,
                      contents: contents,
                      payload: {
                        type: 'file',
                        file: fileName,
                        path: item.path,
                        stats: item.stats,
                      },
                    });
                  })
                  .catch(err => {
                    console.error(err);
                    res();
                  });
              } else {
                res();
              }
            })
          );
        })
        .on('error', (err, item) => {
          reject(err);
          console.error('Error while walking notes folder for tags: ', item, err);
        })
        .on('end', () => {
          Promise.all(files)
            .then(files => {
              let tagIndex: TagIndex = this.buildTagIndex(files);
              let tags: Tag[] = this.buildTagList(tagIndex);

              // Sort tags alphabetically
              tags.sort((a, b) => (a.tag > b.tag ? 1 : b.tag > a.tag ? -1 : 0));

              resolve(tags);
            })
            .catch(err => {
              console.error(err);
            });
        });
    });
  };

  // Build a tag index first
  private buildTagIndex = (files: TagFile[]): TagIndex => {
    let tagIndex: TagIndex = {};
    for (let i = 0; i < files.length; i++) {
      if (files[i] != null && files[i].contents) {
        let parsedFrontMatter = matter(files[i].contents || '');
        if ('tags' in parsedFrontMatter.data) {
          for (let tag of parsedFrontMatter.data.tags) {
            if (tag in tagIndex) {
              tagIndex[tag].push(files[i].payload);
            } else {
              tagIndex[tag] = [files[i].payload];
            }
          }
        }
      }
    }
    return tagIndex;
  };

  private buildTagList = (tagIndex: TagIndex): Tag[] => {
    let tags: Tag[] = [];
    for (let tag of Object.keys(tagIndex)) {
      tags.push({
        type: 'tag',
        tag: tag,
        files: tagIndex[tag],
      });
    }
    return tags;
  };
}

interface Node {
  type: string;
}
interface Tag extends Node {
  tag: string; // Tag name, actually.
  files: File[];
}

interface File extends Node {
  type: string;
  file: string; // File name, actually
  path: string;
  stats: fs.Stats;
}

type VSNotesNode = Node | File | Tag;

interface TagFile {
  path: string;
  contents: Buffer;
  payload: File;
}

interface TagIndex {
  [tag: string]: File[];
}
