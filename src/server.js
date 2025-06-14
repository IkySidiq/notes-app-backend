//* Server adalah entry pointnya, karena server.js lah yang dijalankan pertama kali oleh node menggunakan node src/server.js

const Hapi = require('@hapi/hapi');
const notes = require('./api/notes'); //! Secara default, Jika Hapi diberikan nama folder nya saja seperti "notes", ia akan mencari index.js. Karena index.js adalah default entry pointnya
const NotesService = require('./services/inMemory/NoteService');
const NotesValidator = require('./validator/notes');
 
const init = async () => {
  const notesService = new NotesService(); //* Best practice! Soalnya instance ini hanya dipanggil sekali di dalam function itu sendiri. Jadi tidak perlu disimpan diluar function, cakupannya cukup lokal saja
  const server = Hapi.server({
    port: 3000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
 
  await server.register({
    plugin: notes, //* Notes ini hanya merujuk pada file yang memiliki plug-in object
    options: {
      service: notesService,
      validator: NotesValidator 
    },
  });
 
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
 
init();