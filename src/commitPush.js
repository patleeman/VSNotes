const vscode = require('vscode');

module.exports = function () {
  console.log('commitPush')
  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (gitExtension != null) {
    console.log('gitextension', gitExtension.exports)
    gitExtension.activate().then(gitApi => {
      console.log('git', gitApi);

    }, err => {
      console.error(err)
    })
  } else {
    vscode.window.showErrorMessage('Git extension not found. VS Notes only supports Git at the moment. To request other SCMs, open an issue.');
  }
}