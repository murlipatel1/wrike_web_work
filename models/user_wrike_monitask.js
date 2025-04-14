const mongoose = require('mongoose');
require('dotenv').config();

// Define Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  wrikeId: { type: String, required: true, unique: true },
  monitaskId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

// Sample User Data
// const sampleUser = new User({
//   email: "mad.redefinesolutions@gmail.com",
//   wrikeId: "KUAUQARN",
//   timedoctorId: "Z-EK7zBSbqIpf8AI"  
// });
// const sampleUser2 = new User({
//  email: "temp1madhuram@gmail.com",
//   wrikeId: "KUAUQARN",
//   timedoctorId: "Z-EhbjBSbqIpi64E"  
// });

// Insert Sample User
// sampleUser.save()
//   .then(() => {
//     console.log("Sample user inserted successfully!");
//     mongoose.connection.close();
//   })
//   .catch(err => console.error("Error inserting sample user:", err));

// sampleUser2.save()
//   .then(() => {
//     console.log("Sample user inserted successfully!");
//     mongoose.connection.close();
//   })
//   .catch(err => console.error("Error inserting sample user:", err));
