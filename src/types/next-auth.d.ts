import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      telegramId: string
      telegramPhotoUrl?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    telegramId: string
    telegramPhotoUrl?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    telegramId: string
    telegramPhotoUrl?: string
  }
}