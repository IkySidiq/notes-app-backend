require('dotenv').config(); //* Otomatis mengacu pada .env secara default

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const notes = require('./api/notes');
const NotesService = require('./services/postgres/NotesService');
const NotesValidator = require('./validator/notes');
const ClientError = require('./exceptions/ClientError');

const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

console.log('[DEBUG] import UsersValidator berhasil');
console.log('[DEBUG] UsersValidator:', UsersValidator);
console.log('[DEBUG] typeof UsersValidator.validateUserPayload:', typeof UsersValidator.validateUserPayload);

const init = async () => {
  const notesService = new NotesService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

    await server.register(Jwt); // <--- WAJIB INI DULU

    // TODO: Kalo auth.strategy cocok dari keys, verify dan update, nantinya secara otomatis mengizinkan mengakses ke route yang dituju
    server.auth.strategy('notesapp_jwt', 'jwt', { //* params terakhir dari auth.strategy adalah object yang berisi keys, verify dan validate. Untuk tiap valuenya tidak boleh sembarang, harus sesuai aturan bawaan dari JWT.
    keys: process.env.ACCESS_TOKEN_KEY, //* Ini adalah secret key yang akan memverifikasi signature yang dikirim di dalam token
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE, //* Masa aktif token berhenti mengacu kesini
    },
    validate: (artifacts) => ({ //* Saat token valid, validate akan mengembalikan isValid: true dan credentials
      isValid: true,
      credentials: { //* Credential harus 100% sesuai dengan isi payload dari token
        id: artifacts.decoded.payload.id,
      },
    }),
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
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      //* Kalo error muncul dari sisi Hapi, bukan client atau server, maka biarkan Hapi menanggapinya sendiri. isServer akan true jika status code di atas 500, dan false jika dibawah 500. Tidak semua yang di bawah 500 itu dihasilkan karena kesalahan client
      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
