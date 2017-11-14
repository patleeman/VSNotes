const vscode = require('vscode');
const { exec } = require('child_process');

// Experiment using the vscode git extension to commit and push
// module.exports = function () {
//   console.log('commitPush')
//   const gitExtension = vscode.extensions.getExtension('vscode.git');
//   if (gitExtension != null) {
//     console.log('gitextension', gitExtension.exports)
//     gitExtension.activate().then(gitApi => {
//       console.log('git', gitApi);

//     }, err => {
//       console.error(err)
//     })
//   } else {
//     vscode.window.showErrorMessage('Git extension not found. VS Notes only supports Git at the moment. To request other SCMs, open an issue.');
//   }
// }

module.exports = function () {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const noteFolder = config.get('defaultNotePath');
  const command = config.get('commitPushShellCommand');
  const defaultCommitMessage = config.get('commitPushDefaultCommitMessage');
  const options = {
    cwd: noteFolder
  }

  vscode.window.showInputBox({
    prompt: `Commit Message`,
    value: defaultCommitMessage,
  }).then(commitMessage => {
    if (commitMessage != null && commitMessage) {
      const fullCommand = command.replace(new RegExp('{msg}'), commitMessage);
      exec(fullCommand, options, function (err, stdout, stderr) {
        if (err || stderr) {
          vscode.window.showErrorMessage('Whoops! Commit and Push failed! Check the dev console for error message.');
          console.error(err, stderr);
        } else {
          vscode.window.showInformationMessage(`Commit and Push executed successfully!`);
          console.log(stdout);
        }
      })
    } else {
      vscode.window.showInformationMessage(`Commit and Push cancelled.`);
    }
  })
}