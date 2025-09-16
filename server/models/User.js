const mongoose = require('mongoose');

const emailRegex = /.+@.+\..+/;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [emailRegex, 'Invalid email format']
  },
  passwordHash: {
    type: String,
    required: true
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Normalisation JSON (ne jamais exposer le hash)
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
