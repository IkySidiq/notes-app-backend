const { NotePayloadSchema } = require('./schema');
 

//! Isi dari argumen payload harus persis dengan schema
const NotesValidator = {
  validateNotePayload: (payload) => {
    const validationResult = NotePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
};
 
module.exports = NotesValidator;