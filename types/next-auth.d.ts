import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      displayName?: string
      avatar?: string
      role: 'BUYER' | 'SELLER' | 'ADMIN'
      image?: string
      name?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    username?: string
  }
}
