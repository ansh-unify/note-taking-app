export default class NotesDB {
    static dbName = "NotesDatabase";
    static dbVersion = 1;
    static notesStoreName = "notes";
    static versionsStoreName = "versions";

    static async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create notes store
                if (!db.objectStoreNames.contains(this.notesStoreName)) {
                    const notesStore = db.createObjectStore(this.notesStoreName, { keyPath: "id" });
                    notesStore.createIndex("updated", "updated", { unique: false });
                }

                // Create versions store
                if (!db.objectStoreNames.contains(this.versionsStoreName)) {
                    const versionsStore = db.createObjectStore(this.versionsStoreName, { 
                        keyPath: ["noteId", "timestamp"] 
                    });
                    versionsStore.createIndex("noteId", "noteId", { unique: false });
                }
            };
        });
    }

    static async getAllNotes() {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.notesStoreName], "readonly");
            const store = transaction.objectStore(this.notesStoreName);
            const request = store.getAll();

            request.onsuccess = () => {
                const notes = request.result;
                resolve(notes.sort((a, b) => new Date(b.updated) - new Date(a.updated)));
            };
            request.onerror = () => reject(request.error);
        });
    }

    static async saveNote(noteToSave) {
        const db = await this.initDB();
        return new Promise(async (resolve, reject) => {
            const transaction = db.transaction([this.notesStoreName], "readwrite");
            const store = transaction.objectStore(this.notesStoreName);

            // If no ID, create new note
            if (!noteToSave.id) {
                noteToSave.id = Date.now();
                noteToSave.created = new Date().toISOString();
            }
            
            noteToSave.updated = new Date().toISOString();
            noteToSave.tags = noteToSave.tags || [];

            const request = store.put(noteToSave);

            request.onsuccess = () => {
                // Save version history
                this.saveVersion(noteToSave.id, {
                    title: noteToSave.title,
                    body: noteToSave.body,
                    tags: noteToSave.tags,
                    updated: noteToSave.updated
                });
                resolve(noteToSave);
            };
            request.onerror = () => reject(request.error);
        });
    }

    static async deleteNote(id) {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.notesStoreName], "readwrite");
            const store = transaction.objectStore(this.notesStoreName);
            const request = store.delete(Number(id));

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    static async saveVersion(noteId, content) {
        const db = await this.initDB();
        return new Promise(async (resolve, reject) => {
            const transaction = db.transaction([this.versionsStoreName], "readwrite");
            const store = transaction.objectStore(this.versionsStoreName);

            const version = {
                noteId: Number(noteId),
                timestamp: new Date().toISOString(),
                ...content
            };

            // Keep only last 10 versions
            const index = store.index("noteId");
            const versions = await this.getVersionHistory(noteId);
            if (versions.length >= 10) {
                const oldestVersion = versions[0];
                await store.delete([noteId, oldestVersion.timestamp]);
            }

            const request = store.add(version);
            request.onsuccess = () => resolve(version);
            request.onerror = () => reject(request.error);
        });
    }

    static async getVersionHistory(noteId) {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.versionsStoreName], "readonly");
            const store = transaction.objectStore(this.versionsStoreName);
            const index = store.index("noteId");
            const request = index.getAll(Number(noteId));

            request.onsuccess = () => {
                const versions = request.result;
                resolve(versions.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                ));
            };
            request.onerror = () => reject(request.error);
        });
    }
}
