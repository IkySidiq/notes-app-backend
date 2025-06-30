const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');
 
const TokenManager = {
  //* Saat token digenerate ulang, isi tokennya akan selalu berbeda
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken); //* Isi artifacts akan otomatis dirangkai oleh jwt.token.decode. Kalo lupa tanya chat gpt
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY); //* Untuk mengecek apakah signaturenya cocok atau tidak
      const { payload } = artifacts.decoded; //* artifacts adalah objek, dan decoded adalah objek yang berada di dalam artifacts. Jadi ini adalah object of objects. Jadi ini proses mengambil payload yang ada di dalam decode yang dimana decodenya ada di dalam artifacts
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};
 
module.exports = TokenManager;