import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: {
    ...PrismaAdapter(prisma),
    createUser: async (data) => {
      return prisma.user.create({
        data: {
          ...data,
          passwordHash: "", // Inject empty string to bypass SQLite NOT NULL constraint for OAuth users
        },
      })
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "ubos_secret_key_logaritma_2026_supersecure_auth_token_xyz99",
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || "dummy_google_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || "dummy_google_secret",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).trim().toLowerCase()
        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.passwordHash) {
          console.log("[AUTH DEBUG] User not found or no password hash for email:", email);
          return null
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        console.log("[AUTH DEBUG] Passwords match?", passwordsMatch);

        if (!passwordsMatch) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      
      

      const ALLOWED_EMAILS = [
        "logaritma.tim@gmail.com",
        "tony@logaritma.id",
        "reza@logaritma.id",
        "bana@logaritma.id",
        "baim@logaritma.id"
      ];
      
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
          const userEmailLower = user.email.toLowerCase();
          const isPilot = ALLOWED_EMAILS.includes(userEmailLower);
          
          if (isPilot) {
            const { logPilotActivityRaw } = await import("./lib/pilotAudit");
            await logPilotActivityRaw(dbUser?.name || user.name || "Admin", user.email, "Login ke Dasbor Pilot", "Sesi otorisasi kokpit baru saja dimulai via " + (account?.provider === "google" ? "Google" : "Kredensial") + ".");
          }
          
          if (dbUser) {
              await prisma.user.update({
                  where: { email: user.email },
                  data: { lastLogin: new Date() }
              });
          }
        } catch (e) {
          console.error("Failed to track login:", e);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      const currentDayStr = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        year: "numeric", month: "numeric", day: "numeric"
      }).format(new Date());

      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
        token.staffBusinessId = (user as any).staffBusinessId || null
        
        // Coba ambil dari DB jika oauth
        if (!(user as any).staffBusinessId) {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
          if (dbUser) {
            token.role = dbUser.role
            token.staffBusinessId = dbUser.staffBusinessId
          }
        }
        
        // Simpan hari login untuk fitur "Wajib login tiap hari" (Reset tengah malam)
        token.loginDateStr = currentDayStr;
      }
      
      // Paksa logout jika:
      // 1. Tanggal login di token berbeda dengan tanggal hari ini (sudah ganti hari)
      // 2. Atau token ini dari sesi lama (sebelum ada fitur loginDateStr)
      if (!token.loginDateStr || token.loginDateStr !== currentDayStr) {
         // Hari berganti atau token tidak valid! Logout otomatis
         return { _expired: true } as any; // Return explicitly expired token
      }
      
      return token
    },
    async session({ session, token }) {
      // Jika token dikosongkan (karena kedaluwarsa tengah malam)
      if (!token || !token.email || token._expired) {
        return { expires: new Date(0).toISOString() } as any;
      }
      
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.staffBusinessId = token.staffBusinessId as string | null
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/`
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: true,
})
