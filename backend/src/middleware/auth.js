import * as jose from "jose";

const {
  KEYCLOAK_ISSUER,
  KEYCLOAK_AUDIENCE,          // 👈 expected audience (backend-service clientId)
  KEYCLOAK_INTERNAL_URL,      // 👈 internal Docker URL (http://keycloak:8080)
  KEYCLOAK_REALM,
} = process.env;

if (!KEYCLOAK_ISSUER || !KEYCLOAK_AUDIENCE) {
  console.warn("[auth] Missing KEYCLOAK_ISSUER or KEYCLOAK_AUDIENCE env vars");
}

// Build JWKS fetcher from the internal URL (works inside Docker)
const JWKS = jose.createRemoteJWKSet(
  new URL(`${KEYCLOAK_INTERNAL_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`)
);

/**
 * Middleware to verify Bearer JWT tokens
 */
export function authenticate() {
  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization || "";
      if (!auth.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: { message: "Missing Bearer token", details: null } });
      }

      const token = auth.slice(7);

      const { payload } = await jose.jwtVerify(token, JWKS, {
        issuer: KEYCLOAK_ISSUER,       // must match "iss" claim
        audience: KEYCLOAK_AUDIENCE,   // must match "aud" claim (your backend clientId)
      });

      req.user = payload; // contains sub, preferred_username, realm_access, resource_access, etc.
      next();
    } catch (err) {
      return res.status(401).json({
        error: { message: "Invalid or expired token", details: err.message },
      });
    }
  };
}

/**
 * Require a specific realm role
 */
export function requireRealmRole(role) {
  return (req, res, next) => {
    const roles = req.user?.realm_access?.roles || [];
    if (roles.includes(role)) return next();
    return res
      .status(403)
      .json({ error: { message: `Missing required role: ${role}`, details: null } });
  };
}

/**
 * Require a client role for a given clientId
 */
export function requireClientRole(clientId, role) {
  return (req, res, next) => {
    const roles = req.user?.resource_access?.[clientId]?.roles || [];
    if (roles.includes(role)) return next();
    return res
      .status(403)
      .json({ error: { message: `Missing ${clientId} role: ${role}`, details: null } });
  };
}
