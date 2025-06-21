require('dotenv').config(); //* Otomatis mengacu pada .env secara default

const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const NotesService = require('./services/postgres/NotesService');
const NotesValidator = require('./validator/notes');
const ClientError = require('./exceptions/ClientError');

const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

console.log('[DEBUG] import UsersValidator berhasil');
console.log('[DEBUG] UsersValidator:', UsersValidator);
console.log('[DEBUG] typeof UsersValidator.validateUserPayload:', typeof UsersValidator.validateUserPayload);

const init = async () => {
  const notesService = new NotesService();
  const usersService = new UsersService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  //* Best practice agar tidak menuliskan await server.register terus menerus
  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  // 💡 Tambahkan extension function di sini
server.ext('onPreResponse', (request, h) => {
  const { response } = request;

  if (response instanceof ClientError) {
    const newResponse = h.response({
      status: 'fail',
      message: response.message,
    });
    newResponse.code(response.statusCode);
    return newResponse;
  }

  if (response instanceof Error) {
    console.error('[🔥 ERROR SERVER]', response); // 🛠 Tambahkan ini
  }

  return h.continue;
});

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
