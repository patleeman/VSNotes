# VS Notes
Take markdown notes from VS Code quickly and easily.

# Features
1. Access commands quickly from the VS Code command palette `Ctrl/Cmd + Shift + p`
2. Set a base folder for your notes and all notes created will be saved in that folder.

# Quick Start
- Install the extension from the VS Code Extension menu.
- Open the command pallette `Ctrl/Cmd + Shift + p` and type `vsnotes`. Select Run Setup.
- Select a directory to save notes to.

To modify other settings, open the VS Code settings `Preferences > Settings` or hit `Ctrl/Cmd + ,` and type in vsnotes in the search bar. Settings explained below.

# Taking Notes

## Creating a note
When creating a new note, VS Notes will look at the `vsnotes.defaultNoteTitle` setting to grab the format for the file name. This string contains several tokens that is converted by VS Notes when a note is created. Tokens can be modified in the `vsnotes.tokens` setting. When asked to input a title for your new note, VSNotes can detect file paths and will create folders to store notes inside.

### Tokens:
- datetime: Inserts the current date time in a format specified by the format key. [Formatting](https://momentjs.com/docs/#/displaying/format/)
    ```
    {
        "type": "datetime",
        "token": "{dt}",
        "format": "YYYY-MM-DD_HH-mm",
        "description": "Insert current datetime"
    }
    ```
- title: When you create a new note, VS Notes will ask you for a title for the note. After entering a title, it will replace this token with the input text.
    ```
    {
        "type": "title",
        "token": "{title}",
        "description": "Insert note title",
        "format": "Untitled"
    },
    ```
- extension: The file extension for the file. Defaults to markdown but you can change it to whatever you want.
    ```
    {
        "type": "extension",
        "token": "{ext}",
        "description": "Insert file extension",
        "format": "md"
    }
    ```

### File Path Detection

VS Notes understands file paths and will create folders as necessary. When prompted for a note title, inputting a path will nest the new note under the folders designated in the path. All paths are generated from the main notes folder.

i.e. A title separated by a `/` character on macs/linux will generate a meetings folder with a note named my meeting notes within it (formatted as per `vsnotes.defaultNoteTitle`).


# Settings
