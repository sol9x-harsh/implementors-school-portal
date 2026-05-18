import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/mongodb';
import Admin from '@/lib/models/Admin';
import Student from '@/lib/models/Student';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email Address',
          type: 'email',
          placeholder: 'scholar@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        await dbConnect();

        let dbUser: any = null;
        let role: string = '';

        // 1. Try to find in Admin collection
        dbUser = await Admin.findOne({ email: credentials.email }).select(
          '+password',
        );
        if (dbUser) {
          role = 'ADMIN';
        } else {
          // 2. If not found, try Student collection
          dbUser = await Student.findOne({ email: credentials.email }).select(
            '+password',
          );
          if (dbUser) {
            role = 'STUDENT';
          }
        }

        if (!dbUser || !dbUser.password) {
          throw new Error('No user found with this email address');
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          dbUser.password,
        );

        if (!isPasswordMatch) {
          throw new Error('Invalid password');
        }

        return {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          role: role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
