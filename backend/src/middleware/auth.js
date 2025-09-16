
import * as jose from 'jose';

const {
  KEYCLOAK_ISSUER,   
 
} = process.env;

if (!KEYCLOAK_ISSUER ) {
  console.warn('[auth] Expect env KEYCLOAK_ISSUER and KEYCLOAK_AUDIENCE');
}

const JWKS = jose.createRemoteJWKSet(
  new URL(`${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`)
);

// Verifies Bearer token, audience and issuer, attaches payload to req.user
export function authenticate() {
  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization || '';
      if (!auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: { message: 'Missing Bearer token', details: null } });
      }
      const token = auth.slice(7);

      const { payload } = await jose.jwtVerify(token, JWKS, {
        issuer: KEYCLOAK_ISSUER
      });

      req.user = payload; // includes sub, preferred_username, realm_access, resource_access, etc.
      next();
    } catch (err) {
      return res.status(401).json({ error: { message: 'Invalid or expired token', details: err.message } });
    }
  };
}

// Checks a realm role on the token (realm_access.roles)
export function requireRealmRole(role) {
  return (req, res, next) => {
    const roles = req.user?.realm_access?.roles || [];
    if (roles.includes(role)) return next();
    return res.status(403).json({ error: { message: `Missing required role: ${role}`, details: null } });
  };
}

// Checks a client role (resource_access[clientId].roles)
export function requireClientRole(clientId, role) {
  return (req, res, next) => {
    const roles = req.user?.resource_access?.[clientId]?.roles || [];
    if (roles.includes(role)) return next();
    return res.status(403).json({ error: { message: `Missing ${clientId} role: ${role}`, details: null } });
  };
}
