const { mongoose } = require("mongoose");

function connectDB() {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('MongoDB Connected')).catch(err => console.error(err));
}

module.exports = connectDB;