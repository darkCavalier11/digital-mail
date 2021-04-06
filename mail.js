var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mailSchema = new Schema({
    subject: String,
    text: String,
    published_date: { type: Date, default: Date.now  }
});

module.exports = mongoose.model('mail', mailSchema);
