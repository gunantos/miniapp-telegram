import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        telegramId: { label: "Telegram ID", type: "text" },
        telegramInitData: { label: "Telegram Init Data", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.telegramId) {
          return null
        }

        try {
          // Find user by Telegram ID
          let user = await db.user.findUnique({
            where: { telegramId: credentials.telegramId }
          })

          // If user doesn't exist, create a new one
          if (!user) {
            user = await db.user.create({
              data: {
                telegramId: credentials.telegramId,
                name: `User_${credentials.telegramId}`,
                email: `user_${credentials.telegramId}@telegram.local`
              }
            })
          }

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            telegramId: user.telegramId,
            telegramPhotoUrl: user.telegramPhotoUrl
          }
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.telegramId = user.telegramId
        token.telegramPhotoUrl = user.telegramPhotoUrl
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.telegramId = token.telegramId as string
        session.user.telegramPhotoUrl = token.telegramPhotoUrl as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin"
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here"
}