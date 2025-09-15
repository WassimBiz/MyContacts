const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  phone:     { type: String, required: true }, // Bonus: 10–20 caractères (géré côté routes)
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

contactSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Contact', contactSchema);
