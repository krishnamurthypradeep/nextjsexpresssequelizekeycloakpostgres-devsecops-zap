import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      issuer: process.env.KEYCLOAK_ISSUER, // must equal Keycloak token iss (http://localhost:8080/realms/product-portfolio)
      wellKnown: `${process.env.KEYCLOAK_INTERNAL_URL}/realms/product-portfolio/.well-known/openid-configuration`,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.preferred_username || profile.name || profile.email,
          email: profile.email,
          roles: profile.realm_access?.roles ?? [],
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.access_token = account.access_token;
        token.id_token = account.id_token;
        token.refresh_token = account.refresh_token;
        token.expires_at = Date.now() + (account.expires_in ?? 0) * 1000;
      }
      if (profile) {
        token.roles = profile.realm_access?.roles ?? [];
        token.sub = profile.sub; // ✅ persist user id
      }
      return token;
    },

    async session({ session, token }) {
      session.access_token = token.access_token;
      session.id_token = token.id_token;
      session.user = {
        ...session.user,
        sub: token.sub,       // ✅ available in frontend
        roles: token.roles ?? [],
      };
      return session;
    },
  },
});

export { handler as GET, handler as POST };
