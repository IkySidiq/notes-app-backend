const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
 
class NotesService {
  constructor() {
    this._pool = new Pool();
  }
 
  async addNote({ title, body, tags }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
 
    const query = {
      text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt],
    };
 
    //* Method .query adalah bawaan dari new Pool(). Method .query selalu mengembalikan  objek hasil query. Yang dikirim ke database hanya data yang diinsert saja. Tapi method .query setelah mengirimkan datanya akan mengembalikan objek hasil query untuk konsumsi di sisi JavaScript/Node.js, bukan bentuk data yang "dikirim ke database".
    const result = await this._pool.query(query);
 
    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }
 
    return result.rows[0].id;
  }

    async getNotes() {
    const result = await this._pool.query('SELECT * FROM notes');
    return result.rows.map(mapDBToModel); //* Untuk mengubah snake case ke camel case
  }

  async getNoteById(id) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
 
    return result.rows.map(mapDBToModel)[0];
  }
}