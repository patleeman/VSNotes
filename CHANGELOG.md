# Change Log
All notable changes to the "vsnotes" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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