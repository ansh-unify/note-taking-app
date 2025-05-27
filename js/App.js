import NotesView from "./NotesView.js";
import NotesDB from "./NotesDB.js";

export default class App {
    constructor(root) {
        this.notes = [];
        this.activeNote = null;
        this.view = new NotesView(root, this._handlers());
        this.filteredNotes = [];

        this._refreshNotes();
    }

    async _refreshNotes() {
        const notes = await NotesDB.getAllNotes();
        this._setNotes(notes);

        if (notes.length > 0) {
            this._setActiveNote(notes[0]);
        }
    }

    _setNotes(notes) {
        this.notes = notes;
        this.view.updateNoteList(notes);
        this.view.updateNotePreviewVisibility(notes.length > 0);
    }

    _setActiveNote(note) {
        this.activeNote = note;
        this.view.updateActiveNote(note);
    }

    _handlers() {
        return {
            onNoteSelect: noteId => {
                const selectedNote = this.notes.find(note => note.id == noteId);
                this._setActiveNote(selectedNote);
            },
            onNoteAdd: async () => {
                const newNote = {
                    title: "Untitled Note",
                    body: "Type your note here...",
                    tags: []
                };

                await NotesDB.saveNote(newNote);
                this._refreshNotes();
            },
            onNoteEdit: async (title, body, tags = []) => {
                await NotesDB.saveNote({
                    id: this.activeNote.id,
                    title,
                    body,
                    tags
                });

                this._refreshNotes();
            },
            onNoteDelete: async (noteId) => {
                await NotesDB.deleteNote(noteId);
                this._refreshNotes();
            },
            onNotesExport: async () => {
                const notes = await NotesDB.getAllNotes();
                const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `smart-notes-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            },
            onNotesImport: async (file) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const notes = JSON.parse(e.target.result);
                        for (const note of notes) {
                            await NotesDB.saveNote(note);
                        }
                        this._refreshNotes();
                    } catch (err) {
                        alert('Error importing notes. Please check the file format.');
                        console.error(err);
                    }
                };
                reader.readAsText(file);
            },
            onSearch: async (searchText) => {
                if (searchText.trim() === "") {
                    const allNotes = await NotesDB.getAllNotes();
                    this._setNotes(allNotes);
                    return;
                }

                const allNotes = await NotesDB.getAllNotes();
                const filteredNotes = allNotes.filter(note => {
                    const searchContent = `${note.title} ${note.body} ${note.tags?.join(" ")}`.toLowerCase();
                    return searchContent.includes(searchText.toLowerCase());
                });

                this._setNotes(filteredNotes);
            }
        };
    }
}