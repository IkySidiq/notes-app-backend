//! Ini adalah file plug-in Notes. Jika ingin menambah plug-in, buat file barunya. ❌ Tidak disarankan menyatukan dua plugin berbeda dalam satu file plugin.

const NotesHandler = require('./handler');
const routes = require('./routes');

//! Module.exports adalah bawaan node.js. Isi di dalam module.exports akan bisa diexport. Ada juga export yang biasa tanpa module.
//! Ini namanya adalah plug-in object
module.exports = {
  name: 'notes',
  version: '1.0.0',
  //! register meminta value seperti ini `async function (server, options)`
  //* Async pada register sangat dirokemndasikan. Async di register itu untuk antisipasi kebutuhan asynchronous, bukan keharusan mutlak.
  register: async (server, { service, validator }) => {
    //* Saat insance dikirim sebagai callback, maka __this nya akan hilang. Sekarang cek file api/notes/routes.js 
    //* ini adalah contoh dari depedency injection
    const notesHandler = new NotesHandler(service, validator);
    //! server.route perlu didaftarkan di dalam register. Karena kalau tidak, ketika routes diakses seperti mengirim request http, routesnya tidak akan pernah ditemukan karena tidak pernah didaftarkan di dalam server 
    server.route(routes(notesHandler)); 
  },
};
