const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/auth/github/callback`,
  scope: ['user:email', 'read:user', 'repo'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });

    if (user) {
      user.accessToken = accessToken;
      user.avatarUrl = profile.photos?.[0]?.value;
      user.displayName = profile.displayName || profile.username;
      await user.save();
    } else {
      user = await User.create({
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        avatarUrl: profile.photos?.[0]?.value,
        profileUrl: profile.profileUrl,
        email: profile.emails?.[0]?.value,
        accessToken,
        galaxyName: `${profile.username}'s Galaxy`,
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
