import NextAuth, { Session, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const response = await fetch('http://localhost:8000/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials?.username,
              password: credentials?.password
            })
          });

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          const data = await response.json();
          if (response.ok && data) {
            const user: User = {
              id: credentials?.username as string,
              token: data.access_token,
              is_admin: data.is_admin
            };
            return user;
          }
          return null;
        } catch (error) {
          console.error('Login failed:', error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.is_admin = user.is_admin; // Add is_admin to the JWT token
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.is_admin = token.is_admin as boolean; // Add is_admin to the session
      return session;
    }
  },
  trustHost: true
});
