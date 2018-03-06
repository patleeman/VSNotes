# Change Log
All notable changes to the "vsnotes" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.5.0] - 2018-3-6
- Add search command
- Update dependencies and close moment.js vulnerability
- Updated Open Note Folder command to open in a new window

## [0.4.2] - 2017-11-15
### Fixes
- Fix Tags not populating on editor view and in quick pick if more than a few notes in notes folder.
- Fix List Recent Notes not respecting ignore patterns

## [0.4.1] - 2017-11-14
### Fixes
- [Windows note path getting mangled](https://github.com/patleeman/VSNotes/issues/3)

## [0.4.0] - 2017-11-14
### Added
- Commit and push command added.
- Commit and push command setting added.
- Commit and push default commit message added.

## [0.3.1] - 2017-11-13
### Added
- Icon

## [0.3.0] - 2017-11-13
### Added
- Explorer tree view. 0.3.0 adds a tree view to the explorer (left sidebar) that displays tags and files inside the note directory.
- Added file ignore pattern to settings. Ignore filenames and exclude them from listings using regex.

### Removed
-  Removed hardcoded dependency on markdown files. VS Notes now shows all files not ignored in the ignore pattern setting.

## [0.2.0] - 2017-11-9
### Added
- `List Tags` Command. VSNotes will recurse notes directory and look for YAML encoded frontmatter with a tags key. Tags are then indexed and shown.
- Automatically execute snippet on new note creation. VS Notes will now automatically execute a snippet named `vsnotes` after creating a new note.

## [0.1.0] - 2017-11-7
### Added
- Initial release