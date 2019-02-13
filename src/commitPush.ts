import * as vscode from 'vscode';
import * as process from 'child_process';
import { resolveHome } from './utils';

export default function() {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const noteFolder = <string>resolveHome(config.get('defaultNotePath', ''));
  const command = config.get('commitPushShellCommand', '');
  const defaultCommitMessage = config.get<string>('commitPushDefaultCommitMessage');
  const options = {
    cwd: noteFolder,
  };

  vscode.window
    .showInputBox({
      prompt: `Commit Message`,
      value: defaultCommitMessage,
    })
    .then(commitMessage => {
      if (commitMessage != null && commitMessage) {
        const fullCommand = command.replace(new RegExp('{msg}'), commitMessage);
        process.exec(fullCommand, options, function(err, stdout, stderr) {
          if (err) {
            vscode.window.showErrorMessage('Commit and push failed to execute. Check console for more information');
            console.error('Commit and push failed. Here is the error: ', err);
          } else {
            vscode.window.showInformationMessage(`Commit and Push executed!`);
            console.log(stdout, stderr);
          }
        });
      } else {
        vscode.window.showInformationMessage(`Commit and Push cancelled.`);
      }
    });
}
