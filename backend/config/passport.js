require("dotenv").config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const Candidate = require("../models/Candidate");

async function findOrCreate(profile, provider, email, name, photo) {
  if (!email) {
    email = `${provider}_${profile.id}@nopromptjobs.local`;
  }

  let candidate = await Candidate.findOne({ email });

  if (!candidate) {
    candidate = await Candidate.create({
      name: name || "Candidate",
      email,
      password: "",
      role: "candidate",
      authProvider: provider,
      providerId: profile.id,
      profileImageUrl: photo || "",
      isEmailVerified: true,
    });
  }

  return candidate;
}

/* GOOGLE */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:5000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const candidate = await findOrCreate(
            profile,
            "google",
            profile.emails?.[0]?.value,
            profile.displayName,
            profile.photos?.[0]?.value
          );

          return done(null, candidate);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️ Google OAuth disabled: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing");
}

/* FACEBOOK */
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL:
          process.env.FACEBOOK_CALLBACK_URL ||
          "http://localhost:5000/api/auth/facebook/callback",
        profileFields: ["id", "displayName", "emails", "photos"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const candidate = await findOrCreate(
            profile,
            "facebook",
            profile.emails?.[0]?.value,
            profile.displayName,
            profile.photos?.[0]?.value
          );

          return done(null, candidate);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️ Facebook OAuth disabled: FACEBOOK_APP_ID or FACEBOOK_APP_SECRET missing");
}

/* LINKEDIN */
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL:
          process.env.LINKEDIN_CALLBACK_URL ||
          "http://localhost:5000/api/auth/linkedin/callback",
        scope: ["openid", "profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const candidate = await findOrCreate(
            profile,
            "linkedin",
            profile.emails?.[0]?.value,
            profile.displayName,
            profile.photos?.[0]?.value
          );

          return done(null, candidate);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️ LinkedIn OAuth disabled: LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET missing");
}

/* MICROSOFT */
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL:
          process.env.MICROSOFT_CALLBACK_URL ||
          "http://localhost:5000/api/auth/microsoft/callback",
        scope: ["user.read"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.[0]?.value ||
            profile._json?.mail ||
            profile._json?.userPrincipalName;

          const candidate = await findOrCreate(
            profile,
            "microsoft",
            email,
            profile.displayName,
            ""
          );

          return done(null, candidate);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️ Microsoft OAuth disabled: MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET missing");
}

module.exports = passport;