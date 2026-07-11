const express = require("express");

const router = express.Router();

/* =========================================================
   CONTROLLER IMPORT
========================================================= */

const {
  getMyTrustPassport,
  refreshMyTrustPassport,
} = require("../controllers/trustPassportController");

/* =========================================================
   AUTH MIDDLEWARE IMPORT
========================================================= */

/*
  Supports all of these authMiddleware.js export styles:

  module.exports = authMiddleware;

  module.exports = {
    authMiddleware,
  };

  exports.authMiddleware = authMiddleware;

  module.exports = {
    protect: authMiddleware,
  };
*/

const authModule = require("../middleware/authMiddleware");

const authMiddleware =
  typeof authModule === "function"
    ? authModule
    : authModule.authMiddleware ||
      authModule.protect ||
      authModule.verifyToken ||
      authModule.authenticateToken;

/* =========================================================
   STARTUP VALIDATION
========================================================= */

if (typeof getMyTrustPassport !== "function") {
  throw new TypeError(
    "getMyTrustPassport is not exported correctly from trustPassportController.js"
  );
}

if (typeof refreshMyTrustPassport !== "function") {
  throw new TypeError(
    "refreshMyTrustPassport is not exported correctly from trustPassportController.js"
  );
}

if (typeof authMiddleware !== "function") {
  throw new TypeError(
    "No valid authentication middleware function was exported from middleware/authMiddleware.js"
  );
}

/* =========================================================
   TRUST PASSPORT ROUTES
========================================================= */

/*
  GET /api/trust-passport/me

  Returns the currently logged-in candidate's
  Trust Passport information.
*/

router.get(
  "/me",
  authMiddleware,
  getMyTrustPassport
);

/*
  POST /api/trust-passport/refresh

  Recalculates the currently logged-in candidate's
  Trust Passport.
*/

router.post(
  "/refresh",
  authMiddleware,
  refreshMyTrustPassport
);

/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;