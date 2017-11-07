# VS Notes
Take markdown notes from VS Code quickly and easily.

![](https://github.com/patleeman/VSNotes/raw/master/img/vsnotes_commands.png)

# Features
1. Access commands quickly from the VS Code command palette `Ctrl/Cmd + Shift + p`.
2. Set a base folder for your notes and all notes created will be saved in that folder.
3. Easily access latest notes with `List Recent Notes` command.
4. Open your note folder in a new window.

# Quick Start
- Install the extension from the VS Code Extension menu.
- Open the command pallette `Ctrl/Cmd + Shift + p` and type `vsnotes`. Select Run Setup.
- Click start and then select a directory to save your notes to.

To modify other settings, open the VS Code settings `Preferences > Settings` or hit `Ctrl/Cmd + ,` and type in vsnotes in the search bar. To override the setting, copy it over to your user settings file and modify.

# Taking Notes
VSNotes is just a quick way to create markdown files in a single location and access them. Harness the power of VSCode and the extension ecosystem to customize your note taking workflow.


## Creating a note
When creating a new note, VS Notes will look at the `vsnotes.defaultNoteTitle` setting to grab the format for the file name. This string contains several tokens that is converted by VS Notes when a note is created. Tokens can be modified in the `vsnotes.tokens` setting, but shouldn't be modified unless necessary. When asked to input a title for your new note, VSNotes can detect file paths and will create subfolders as necessary.

### Tokens:
Tokens are added to the defaultNoteTitle setting and will automatically insert desired data into the file name of the note.

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


# Settings
Available settings

```
// Default location to save notes.
"vsnotes.defaultNotePath": "",

// Tokens used to replace text.
"vsnotes.tokens": [
{
    "type": "datetime",
    "token": "{dt}",
    "format": "YYYY-MM-DD_HH-mm",
    "description": "Insert current datetime"
},
{
    "type": "title",
    "token": "{title}",
    "description": "Insert note title",
    "format": "Untitled"
},
{
    "type": "extension",
    "token": "{ext}",
    "description": "Insert file extension",
    "format": "md"
}
],

// Default note title utilizing tokens
"vsnotes.defaultNoteTitle": "{dt}_{title}.{ext}",

// Number of recent files to show when running command `List Notes`
"vsnotes.listRecentLimit": 15,

// Automatically convert spaces in notes titles to symbol. To disable set to `null`
"vsnotes.noteTitleConvertSpaces": "_",
```

# Tips and tricks
- [Supercharge your note taking workflow with snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets)
- [Take advantage of built in markdown features in VSCode](https://code.visualstudio.com/docs/languages/markdown)

# Roadmap & Features
- Tags: Utilizing YAML encoded front matter on a markdown note with a tags array to tag notes. VS Note can keep an index in the main notes folder and use that to quickly access notes.

# Changelog

v 0.1.0
- Initial release
