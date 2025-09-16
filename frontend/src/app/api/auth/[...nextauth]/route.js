import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

const handler = NextAuth({
  providers: [
    Keycloak({
      issuer: process.env.KEYCLOAK_ISSUER,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET, // REQUIRED for Confidential clients
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
        token.roles = profile?.realm_access?.roles ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      session.access_token = token.access_token;
      session.id_token = token.id_token;
      session.user = { ...session.user, roles: token.roles ?? [],
        sub: token.sub,   
       };
      return session;
    },
  },
});

export { handler as GET, handler as POST };
