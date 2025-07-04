const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class NotesService {
  constructor() {
    this._notes = [];
  }

   
  addNote({ title, body, tags }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
 
    const newNote = {
      title, tags, body, id, createdAt, updatedAt,
    };
 
    this._notes.push(newNote);

  //* Best practice! Jika ingin mengecek truthy or falsy pada unique key gunakan saja some
  const isSuccess = this._notes.some((note) => note.id === id); 
    if (!isSuccess) {
      //! saat throw new InvariantError dijalankan, maka kondisi if (error instanceof ClientError) pada handler.js akan bernilai true
      throw new InvariantError('Catatan gagal ditambahkan');
    }
 
    return id;
  }

    getNotes() {
    return this._notes;
  }

    //* Best Practice! Jika ingin mencari berdasarkan unique key, gunakan saja find
    getNoteById(id) { 
    const note = this._notes.find((n) => n.id === id);
    if (!note) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
    return note;
  }

  editNoteById(id, { title, body, tags }) {
    const index = this._notes.findIndex((note) => note.id === id);
 
    if (index === -1) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
 
    const updatedAt = new Date().toISOString();
 
    this._notes[index] = {
      ...this._notes[index],
      title,
      tags,
      body,
      updatedAt,
    };
  }

    deleteNoteById(id) {
    const index = this._notes.findIndex((note) => note.id === id);
    if (index === -1) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
    this._notes.splice(index, 1);
  }
}

module.exports = NotesService;