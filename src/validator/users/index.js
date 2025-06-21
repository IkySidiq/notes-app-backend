const InvariantError = require('../../exceptions/InvariantError');
const { UserPayloadSchema } = require('./schema');

console.log('[DEBUG] file validator/users/index.js KELOAD');
console.log('[DEBUG] UserPayloadSchema:', UserPayloadSchema);
console.log('[DEBUG] typeof UserPayloadSchema.validate:', typeof UserPayloadSchema?.validate);
 
const UsersValidator = {
  validateUserPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload);
 
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;