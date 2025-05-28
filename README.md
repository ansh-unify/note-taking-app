# Smart Notes

A simple web-based note-taking application with features to create, edit, delete, import, export, and search notes. Initially used LocalStorage for storage, then experimented with IndexedDB for persistent storage and version history.

## Features

- Create, edit, and delete notes
- Import and export notes as JSON
- Search notes by title, body, or tags
- Version history (up to 10 versions per note)
- Responsive UI with sidebar and preview

## JavaScript Concepts Used

- **ES6 Modules**: Modular code structure with `import`/`export`
- **Classes**: Object-oriented design with `App`, `NotesView`, `NotesDB`
- **Async/Await**: Asynchronous operations for IndexedDB interactions
- **Promises**: Handling database operations and file reading
- **DOM Manipulation**: Dynamic UI updates and event handling
- **Event Listeners**: Click, blur, and input events for interactivity
- **LocalStorage**: Initial storage solution in `NotesAPI`
- **IndexedDB**: Persistent storage for notes and version history
- **JSON Handling**: Import/export notes as JSON
- **Array Methods**: `filter`, `find`, `sort` for note management
- **LocalStorage**: Fallback storage in `NotesAPI`
- **File API**: Reading imported JSON files
- **Blob/URL**: Creating downloadable JSON files

## Getting Started

1. Clone the repository
2. Open `index.html` in a browser
3. Start creating and managing notes!