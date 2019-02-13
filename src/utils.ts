import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';

// Resolves the home tilde.
export const resolveHome = (filepath: string | vscode.Uri): string | vscode.Uri => {
  if (path == null || !filepath) {
    return '';
  }

  if (filepath[0] === '~') {
    return path.join(os.homedir(), (<string>filepath).slice(1));
  }
  return filepath;
};
