import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { type JWTPayload, SignJWT, jwtVerify } from "jose";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Twitter from "next-auth/providers/twitter";
import { SiweMessage } from "siwe";
import { cookies } from "next/headers";

// Environment variables implicitly required here: 
//
// - AUTH_SECRET
// - AUTH_GITHUB_ID
// - AUTH_GITHUB_SECRET

const CSRF_TOKEN_COOKIE_NAME = "authjs.csrf-token";
const SESSION_COOKIE_NAME = "authjs.session-token";

const encodedKeyCache = new Map<string, Uint8Array>();

function encodeKey(key: string): Uint8Array {
  let result = encodedKeyCache.get(key);
  if (!result) {
    result = new TextEncoder().encode(key);
    encodedKeyCache.set(key, result);
  }
  return result;
}

async function sign(secret: string, payload: JWTPayload) {
  const key = encodeKey(secret);
  const token = new SignJWT(payload).setProtectedHeader({ alg: "HS256" })

  if (payload.iss) {
    token.setIssuer(payload.iss);
  }

  if (payload.sub) {
    token.setSubject(payload.sub);
  }

  if (payload.aud) {
    token.setAudience(payload.aud);
  }

  if (payload.exp) {
    token.setExpirationTime(payload.exp);
  }

  return token.sign(key);
}

async function verify(secret: string, input: string): Promise<any> {
  const key = encodeKey(secret);
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export const config: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: 3600,  // 1 hour
  },

  jwt: {
    async encode({
      token,
      secret,
      maxAge,
    }) {
      if (typeof secret !== 'string') {
        throw new Error('Secret should be a string')
      }
      if (typeof maxAge !== 'number') {
        throw new Error('MaxAge should be a number')
      }
      if (!token || typeof token !== 'object') {
        throw new Error('Token should be an object')
      }
      token.exp = Math.floor(Date.now() / 1000) + maxAge;
      return sign(secret, token);
    },
    async decode({
      token,
      secret
    }) {
      if (!token || typeof secret !== 'string') {
        return null
      }
      return verify(secret, token);
    },
  },

  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: token
      }
    },

    async jwt({ token, user, trigger, account, profile }) {
      if (trigger !== 'signIn' || !user) {
        return token
      }

      if (account?.provider === 'credentials') {
        // logging in with ethereum
        return token
      }

      const provider = account?.provider
      if (!provider) {
        return token
      }

      // TODO refactor to use a configurable cookie name
      const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value
      if (!sessionCookie) {
        console.warn('No session cookie found')
        return token
      }

      const secret = encodedKeyCache.entries().next().value[0]
      const currentSession = await verify(secret, sessionCookie)

      const linkedAccounts = (currentSession.linkedAccounts ?? {}) as Record<string, string>
      switch (provider) {
        case 'github':
          linkedAccounts[provider] = profile?.login as string
          break;
        case 'twitter':
          linkedAccounts[provider] = (profile?.data as any)?.username as string
          break;
        default:
          console.warn('Unknown provider', provider, profile)
          break;
      }

      return {
        ...currentSession,
        linkedAccounts
      }
    }
  },

  providers: [Credentials({
    credentials: {
      message: { label: "Message", type: "text", placeholder: "0x0" },
      signature: { label: "Signature", type: "text", placeholder: "0x0" },
    },

    async authorize(credentials) {
      const { message, signature } = credentials;

      if (typeof message !== 'string' || typeof signature !== 'string') {
        return null;
      }

      try {
        const siwe = new SiweMessage(
          JSON.parse(message) as Partial<SiweMessage>
        );

        const csrfToken = cookies().get(CSRF_TOKEN_COOKIE_NAME)?.value.split("|")[0]
        const { success, data } = await siwe.verify({
          signature: signature,
          nonce: csrfToken,
        });

        if (!success) {
          return null;
        }

        return {
          id: data.address
        };
      } catch (e) {
        console.error(e);
        return null;
      }
    }
  }), Github({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }), Twitter({
    clientId: process.env.TWITTER_ID,
    clientSecret: process.env.TWITTER_SECRET,
  })],
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(config);
