const mongoose = require('mongoose');
require('dotenv').config();

// Define Schema
const projectMapSchema = new mongoose.Schema({
  wrikeProjectId: { type: String, required: true },
  webworkProjectId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ProjectMap = mongoose.model('ProjectMap', projectMapSchema);

module.exports = ProjectMap;

// Sample User Data
// const sampleUser = new ProjectMap({
//     wrikeProjectId: "IEAGN4Q5I5QODJP4",
//     timeDoctorUserId: "Z-EK7zBSbqIpf8AI",
//     timeDoctorProjectId: "Z-KdBsajoORah14T"  
// });

// // Insert Sample User
// sampleUser.save()
//   .then(() => {
//     console.log("Sample user inserted successfully!");
//     mongoose.connection.close();
//   })
//   .catch(err => console.error("Error inserting sample user:", err));
