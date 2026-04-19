const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  displayName: { type: String },
  avatarUrl: { type: String },
  profileUrl: { type: String },
  email: { type: String },
  accessToken: { type: String },
  galaxyName: { type: String },
  lastSynced: { type: Date },
  totalCommits: { type: Number, default: 0 },
  totalRepos: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
