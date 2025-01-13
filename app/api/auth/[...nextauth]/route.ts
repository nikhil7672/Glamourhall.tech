   // app/api/auth/[...nextauth]/route.ts
   import NextAuth from 'next-auth'
   import GoogleProvider from 'next-auth/providers/google'
   declare module 'next-auth' {
    interface Session {
      accessToken?: string;
    }
  }
   const handler = NextAuth({
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       }),
     ],
     secret: process.env.NEXTAUTH_SECRET,
     callbacks: {
       async jwt({ token, account }) {
         if (account) {
           token.accessToken = account.access_token
         }
         return token
       },
       async session({ session, token }) {
         session.accessToken = token.accessToken as string | undefined
         return session
       },
     },
   })

   export { handler as GET, handler as POST }