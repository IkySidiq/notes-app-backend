const ClientError = require('../../exceptions/ClientError');
const InvariantError = require('../../exceptions/InvariantError');

class NotesHandler {
 constructor(service, validator) {
   this._service = service;
   this._validator = validator;
 
   this.postNoteHandler = this.postNoteHandler.bind(this);
   this.getNotesHandler = this.getNotesHandler.bind(this);
   this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
   this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
   this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
 }
 
async postNoteHandler(request, h) {
  try {
    this._validator.validateNotePayload(request.payload);
    const { title = 'untitled', body, tags } = request.payload;
    const { id: credentialId } = request.auth.credentials; //* Ini didapatkan dari validate auth.strategy di server.js
    const noteId = await this._service.addNote({
      title, body, tags, owner: credentialId,
    });
 
    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        noteId,
      },
    });
    response.code(201);
    return response;
  } catch (error) {
    throw error; //* Ini bisa berupa error client, contohnya saat error muncul dari validateNotePayload() yang isinya ada invariant error, atau juga bisa dari server itu sendiri. Pada akhirnya middleware akan tau apakah ini error custom atau error server
    /* //TODO: JADI ERROR HANDLING SEPERTI DI BAWAH SUDAH TIDAK PERLU DIGUNAKAN KARENA SUDAH DITANGANI OLEH MIDDLEWARE
    if (error instanceof ClientError) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode);
      return response;
    }
 
    // Server ERROR!
    const response = h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    });
    response.code(500);
    console.error(error);
    return response;
    */
  }
}
 
//* Tidak memerlukan verifyNoteOwner seperti function getNoteByIdHandler() karena di dalam getNotes() Query-nya langsung: SELECT * FROM notes WHERE owner = $1. Ini langsung mengambil catatan milik credentialId itu sendiri
//* Tidak memerlukan handling error untuk turunan client error. Karena jika catatannya kosongpun akan mengembalikan array kosong dan itu valid. Berbeda dengan getNoteByIdHandler() yang memerlukan id spesifik, maka jika catatan berdasarkan id tidak ditemukan itu adalah not found error
async getNotesHandler(request) {
  const { id: credentialId } = request.auth.credentials;
  const notes = await this._service.getNotes(credentialId);
  return {
    status: 'success',
    data: {
      notes,
    },
  };
}
 
  async getNoteByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
 
    await this._service.verifyNoteAccess(id, credentialId);
    const note = await this._service.getNoteById(id);
    return {
      status: 'success',
      data: {
        note,
      },
    };
  }
 
  async putNoteByIdHandler(request, h) {
    this._validator.validateNotePayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
 
    await this._service.verifyNoteAccess(id, credentialId);
    await this._service.editNoteById(id, request.payload);
    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }
 
async deleteNoteByIdHandler(request, h) {
  try {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyNoteOwner(id, credentialId);
    await this._service.deleteNoteById(id);
 
    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  } catch (error) {
    if (error instanceof ClientError) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode);
      return response;
    }
 
    // Server ERROR!
    const response = h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    });
    response.code(500);
    console.error(error);
    return response;
  }
}
}
 
module.exports = NotesHandler;