const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  sha: String,
  message: String,
  date: Date,
  additions: Number,
  deletions: Number,
});

const planetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  githubRepoId: { type: Number, required: true },
  name: { type: String, required: true },           // repo name = planet name
  fullName: { type: String },                        // owner/repo
  description: { type: String },
  language: { type: String },
  languages: { type: Map, of: Number },             // language breakdown
  commitCount: { type: Number, default: 0 },
  starCount: { type: Number, default: 0 },
  forkCount: { type: Number, default: 0 },
  size: { type: Number, default: 0 },               // in KB
  isPrivate: { type: Boolean, default: false },
  isFork: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  hasDeployment: { type: Boolean, default: false },  // deployed = completed planet
  homepage: { type: String },
  topics: [String],

  // Galaxy positioning (assigned on first sync, stable after)
  orbitRadius: { type: Number },                     // distance from galaxy center
  orbitAngle: { type: Number },                      // initial angle in radians
  orbitSpeed: { type: Number },                      // revolution speed
  planetSize: { type: Number },                      // computed from commits
  planetColor: { type: String },                     // hex, based on primary language
  solarSystemId: { type: Number },                   // group related repos

  recentCommits: [commitSchema],
  createdAt: { type: Date },
  pushedAt: { type: Date },
  updatedAt: { type: Date, default: Date.now },
});

planetSchema.index({ userId: 1, githubRepoId: 1 }, { unique: true });

module.exports = mongoose.model('Planet', planetSchema);
