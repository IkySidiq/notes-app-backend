 const chalk = require('chalk');
 
 class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
 
    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    this.getUsersByUsernameHandler = this.getUsersByUsernameHandler.bind(this);
  }
 
  //* Try-catch adalah prioritas. Jika ada validate error di dalam try, maka custom error yang ada di dalam validate tidak akan jalan. Sebaliknya, yang jalan adalah catch
  //* Try-catch tidak akan pernah dikirim ke server extention, karena sudah mengandle sendiri secara spesifik
async postUserHandler(request, h) {
  const payload = request.payload;

  //! Ini adalah best practice agar gampang untuk mendebug
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    //* Contoh penggunaan chalk. Chalk hanya untuk string saja, jadi hasil seperti payload yang merupakan objek jangan di chalk karena hasilnya nanti bisa tidak sesuai
    console.log(chalk.bgRed('[DEBUG] Payload tidak valid:'), payload);
    return h.response({
      status: 'fail',
      message: 'Payload harus berupa objek dan tidak boleh kosong',
    }).code(400);
  }

  console.log(chalk.bgBlue('[DEBUG] Payload diterima:'), payload);

  this._validator.validateUserPayload(payload);

  const { username, password, fullname } = payload;

  const userId = await this._service.addUser({ username, password, fullname });

  return h.response({
    status: 'success',
    message: 'User berhasil ditambahkan',
    data: { userId }, // TODO: PR INI MASIH KURANG DIPAHAMI
  }).code(201);
}


    async getUserByIdHandler(request, h) {
    const { id } = request.params;
 
    const user = await this._service.getUserById(id);
 
    return {
      status: 'success',
      data: {
        user,
    },
  }
  }

    async getUsersByUsernameHandler(request, h) {
    try {
      const { username = '' } = request.query;
      const users = await this._service.getUsersByUsername(username);
      return {
        status: 'success',
        data: {
          users,
        },
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

module.exports = UsersHandler;