//* Gunakan nama class ClientError untuk  menyatakan bahwa error ini berasal dari kesalahan di pihak klien (client-side), bukan server.
class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ClientError';
  }
}
 
module.exports = ClientError;