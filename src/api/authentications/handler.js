const ClientError = require('../../exceptions/ClientError');
 
class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
 
    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }
 
  //! login (autentikasi) adalah proses verifikasi identitas dan pengelolaan token, bukan proses manajemen data user (seperti daftar user, tambah user, atau ambil profil). Makanya disimpan di class Autentikasi bukan di class UserHandler
  async postAuthenticationHandler(request, h) {
    console.log('usersService:', this._usersService);
    console.log('available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this._usersService)));

    this._validator.validatePostAuthenticationPayload(request.payload);
 
    const { username, password } = request.payload;
    const id = await this._usersService.verifyUserCredential(username, password);
 
    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });
 
    await this._authenticationsService.addRefreshToken(refreshToken);
 
    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }
 
  async putAuthenticationHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload);
 
    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken); //* Untuk mengecek apakah token yang baru saja di payload ada juga di DB ada atau tidak
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken); //* Untuk mengecek apakah token di DB dan di client match atau tidak
 
    const accessToken = this._tokenManager.generateAccessToken({ id });
    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }
 
  async deleteAuthenticationHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);
 
    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);
 
    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}
 
module.exports = AuthenticationsHandler;