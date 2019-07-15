# VS NOTES

VS Notes is a simple tool that takes care of the creation and management of plain text notes and harnesses the power of VS Code via the Command Palette.

![](https://github.com/patleeman/VSNotes/raw/master/img/vsnotes_commands.png)

<!-- TOC -->

- [VS NOTES](#vs-notes)
- [Demo Video](#demo-video)
- [Repository](#repository)
- [Features](#features)
- [Quick Start](#quick-start)
- [Taking Notes](#taking-notes)
  - [Note Filename](#note-filename)
    - [Filename Tokens](#filename-tokens)
    - [File Path Detection](#file-path-detection)
    - [Default Template](#default-template)
    - [Custom Templates](#custom-templates)
    - [Tags](#tags)
    - [Custom Activity Bar Section & Explorer View](#custom-activity-bar-section--explorer-view)
    - [Commit and Push](#commit-and-push)
- [Settings](#settings)
- [Tips and tricks](#tips-and-tricks)
- [Roadmap & Features](#roadmap--features)
- [Change log](#change-log)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [Reviews](#reviews)

<!-- /TOC -->

# Demo Video

[Click to watch 1 min demo video.](https://www.youtube.com/watch?v=Kcf4rpRDmlQ)

[![](https://i3.ytimg.com/vi/Kcf4rpRDmlQ/maxresdefault.jpg)](https://www.youtube.com/watch?v=Kcf4rpRDmlQ)

# Repository
[VS Notes is MIT Licensed and available on Github](https://github.com/patleeman/VSNotes)

# Features
1. Access commands quickly from the VS Code command palette `Ctrl/Cmd + Shift + p`.
2. Set a base folder for your notes and all notes created will be saved in that folder.
3. Easily access latest notes with `List Recent Notes` command.
4. Retrieve notes via tags in YAML encoded frontmatter on your notes.
5. Open your note folder in a new window.
6. View your notes and tags in your filebar.
7. Automatically insert a VS Code snippet upon creation of a new note.
8. Commit and push to your upstream repository with a single command.
9. *New* Create a note in a currently open workspace.

# Quick Start

- Install the extension from the VS Code Extension menu or [click install on this page.](https://marketplace.visualstudio.com/items?itemName=patricklee.vsnotes).
- Open the command palette `Ctrl/Cmd + Shift + p` and type `vsnotes`. Select Run Setup.
- Click start and then select a directory to save your notes to.

> To modify other settings, open the VS Code settings `Preferences > Settings` or hit `Ctrl/Cmd + ,` and type in vsnotes in the search bar. To override the setting, copy it over to your user settings file and modify.

- Access VSNotes commands in the command pallette by pressing `ctrl/cmd + shift + p` and typing vsnotes.

# Taking Notes
VSNotes is just a quick way to create files in a single location and retrieve them later. Harness the power of VSCode and the extension ecosystem to customize your note taking workflow. The default file type is markdown and features are built around taking markdown notes. However if you want to save your notes as other types of plain text files, you can change the settings to append a different file extension.

[New in 0.6.0] Create a note in one of the currently open workspaces with the new Create note in workspace command. If you have multiple workspaces open, you will be down a dropdown list to pick which workspace to create a note in.

## Note Filename
When creating a new note, VS Notes will look at the `vsnotes.defaultNoteTitle` setting to grab the format for the file name. This string contains several [tokens](#filename-tokens) that is converted by VS Notes when a note is created. Tokens can be modified in the `vsnotes.tokens` setting, but shouldn't be modified unless necessary. When asked to input a title for your new note, VSNotes can [detect file paths and will create subfolders as necessary](#file-path-detection).

### Filename Tokens
Tokens are added to the `defaultNoteTitle` setting and will automatically insert desired data into the file name of the note. This gives us the ability to specify a simple title for a note and have additional metadata added to the file name.

- datetime: Inserts the current date time in a format specified by the format key. [Formatting options](https://momentjs.com/docs/#/displaying/format/). Don't modify type or token keys unless you know what you're doing.

    ```
    {
        "type": "datetime",
        "token": "{dt}",
        "format": "YYYY-MM-DD_HH-mm",
        "description": "Insert current datetime"
    }
    ```

- title: When you create a new note, VS Notes will ask you for a title for the note. After entering a title, it will replace this token with the input text. There shouldn't be any need to modify this setting.

    ```
    {
        "type": "title",
        "token": "{title}",
        "description": "Insert note title",
        "format": "Untitled"
    },
    ```

- extension: The file extension for the file. Defaults to markdown but you can change it to whatever you want. For example, if you prefer plain text notes, change it to `.txt`.

    ```
    {
        "type": "extension",
        "token": "{ext}",
        "description": "Insert file extension",
        "format": "md"
    }
    ```

### File Path Detection

VSNotes understands file paths and will create folders as necessary. When prompted for a note title, inputting a path will nest the new note under the folders designated in the path. All paths are generated from the main notes folder.

*Input text delimited by your system's file path separator. Windows: `\` Mac/Linux: `/`*

![](https://github.com/patleeman/VSNotes/raw/master/img/vsnotes_path_detection.png)

*VSCode generates necessary subfolders and places the new note inside*

![](https://github.com/patleeman/VSNotes/raw/master/img/vsnotes_path_detection_completed.png)


### Default Template

[New in 0.2.0] VS Notes will automatically execute a snippet after creating a note to pre-populate the note with a handy form template. The default snippet is called `vsnote_template_default` and created for the markdown language. You can override it by adding this option to your settings.json file and pointing it to a [custom snippet you've created](https://code.visualstudio.com/docs/editor/userdefinedsnippets).

```
  "vsnotes.defaultSnippet": {
    "langId": "markdown",
    "name": "vsnote_template_default"
  },
```

- Set `langId` to the desired language and `name` to a snippet's name.
- Set `langId` to a language and `name` to `null` and a menu will open with all available snippets for your chosen language.
- Set both `langId` and `name` to null to disable automatic snippet insertion.

### Custom Templates

[New in 0.7.0] VS Notes adds the ability to choose markdown snippets on new note creation. To use this new feature, you first must add markdown snippets with a  `vsnote_template_` prefix.

Navigate to `Code > Preferences > User Snippets > Markdown` and add additional snippets. For example:

```
  "vsnote_template_meeting": {
    "prefix": "vsnote_template_meeting",
    "body": [
      "---",
      "tags:",
      "\t- meeting",
      "---",
      "\n# Meeting: $1 - $CURRENT_DATE/$CURRENT_MONTH/$CURRENT_YEAR\n",
      "$2",
    ],
    "description": "Generic Meeting Template",
  },
```

Once you create your snippet in `settings.json`, add the `vsnotes.templates` to your settings and add the name of the template (without the `vsnote_template_` prefix)

```
"vsnotes.templates": [
  "meeting",
],
```

Afterwards when you execute the `Create a New Note` command, you will be shown a prompt to select which template you'd like to use for your new note. To use the default template, hit escape.

### Tags
[New in 0.2.0] VS Notes adds the ability to pull tags out of documents containing a [YAML](http://yaml.org/) [frontmatter block (a la jekyll's frontmatter)](https://jekyllrb.com/docs/frontmatter/). YAML frontmatter is a way to encode machine parsable data in a way that is friendly to read and write.

If a file in your note folder has YAML frontmatter with a tag array, VS Notes will extract the tags from the note and show you all notes with specific tags.

Example YAML frontmatter

```
// file.md
---
tags:
  - tag1
  - tag2
---

The rest of the document goes here
...
```

VS Notes ships with a default YAML encoded snippet that it will insert on creation of a new note.

### Custom Activity Bar Section & Explorer View
![](https://github.com/patleeman/VSNotes/raw/master/img/vsnotes_view.png)

[New in 0.5.1] VS Notes moves the treeview into it's own custom location in the activity bar.

Access your notes no matter what you're doing. This new treeview adds a quick way to access your tags or files at any time by placing a small window in your explorer (file bar) that displays your tags and the contents of your note folder. Now you don't have to navigate away from a project or open a new window to reference your notes. Quick and easy.

[New in 0.5.1] Show or hide the tags or files section of the treeview with the `treeviewHideTags` and `treeviewHideFiles` settings.

### Commit and Push

[New in 0.4.0] The Commit and Push command is a simple way to add all changes, commit, and push your changes if a version control system like Git is set up in your notes folder. The default command is set up for *nix style systems and requires the git command be accessible.

To customize the command and the default command and commit message, update the settings: `vsnotes.commitPushShellCommand` and `vsnotes.commitPushDefaultCommitMessage`.

# Settings
Available settings

```
  // The default commit message used if none is provided with the Commit and Push command.
  "vsnotes.commitPushDefaultCommitMessage": "VS Notes Commit and Push",

  // Shell command to execute in the note directory when the Commit and Push command is executed. The {msg} token will be replaced with the contents of an input box shown or, if empty, the default commit message.
  "vsnotes.commitPushShellCommand": "git add -A && git commit -m \"{msg}\" && git push",

  // Default title for new notes.
  "vsnotes.defaultNoteName": "New_Note",

  // Path to directory to save notes. Use ~/ to denote a relative path from home folder.
  "vsnotes.defaultNotePath": "",

  // Default note title. Utilizes tokens set in vsnotes.tokens.
  "vsnotes.defaultNoteTitle": "{dt}_{title}.{ext}",

  // Default vscode snippet to execute after creating a note. Set both langId and name to null to disable.
  "vsnotes.defaultSnippet": {
    "langId": "markdown",
    "name": "vsnotes"
  },

  // Regular expressions for file names to ignore when parsing documents in note folder.
  "vsnotes.ignorePatterns": [
    "^\\."
  ],

  // Number of recent files to show when running command `List Notes`.
  "vsnotes.listRecentLimit": 15,

  // Automatically convert blank spaces in title to character. To disable set to `null`.
  "vsnotes.noteTitleConvertSpaces": "_",

  // Tokens used to replace text in file name.
  "vsnotes.tokens": [
    {
      "type": "datetime",
      "token": "{dt}",
      "format": "YYYY-MM-DD_HH-mm",
      "description": "Insert formatted datetime."
    },
    {
      "type": "title",
      "token": "{title}",
      "description": "Insert note title from input box.",
      "format": "Untitled"
    },
    {
      "type": "extension",
      "token": "{ext}",
      "description": "Insert file vsnotes.",
      "format": "md"
    }
  ],

  // Hide the files section in the sidebar. Requires application restart.
  "vsnotes.treeviewHideFiles": false,

  // Hide the tags section in the sidebar. Requires application restart.
  "vsnotes.treeviewHideTags": false

  // Define templates names (`vsnote_template_NAME`)
  "vsnotes.templates": ["meeting"],
```

# Tips and tricks
- [Customize your default template with snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets). Create your own snippets and automatically have them populate when creating a new note with the `vsnotes.defaultSnippet` setting.
- [Take advantage of built in markdown features in VSCode](https://code.visualstudio.com/docs/languages/markdown). VS Code has some very rich Markdown features to take advantage of.
- [Supercharge your markdown workflow with extensions](https://marketplace.visualstudio.com/search?term=markdown&target=VSCode&category=All%20categories&sortBy=Relevance). Find extensions in the marketplace to add markdown functionality to your workflow.

# Roadmap & Features

[See Github Issues](https://github.com/patleeman/VSNotes/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)

# Change log

[See CHANGELOG.md](./CHANGELOG.md)

# Contributing

[See CONTRIBUTING.md](./CONTRIBUTING.md)

# Contributors

These lovely people have helped make VS Notes a better tool for everybody! Thank you!

- [Github code contributions](https://github.com/patleeman/VSNotes/graphs/contributors)
- VSCode icon created by [Phil Helm](https://github.com/phelma)


# Reviews

[Do you like VS Notes? Leave a review.](https://marketplace.visualstudio.com/items?itemName=patricklee.vsnotes#review-details)
