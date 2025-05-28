import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { Prisma } from "@prisma/client";

export default NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                // Check if the user exists in the database
                const existingUser = await Prisma.user.findUnique({
                    where: { email: user.email },
                });

                // If the user does not exist, create a new user
                if (!existingUser) {
                    await Prisma.user.create({
                        data: {
                            name: user.name,
                            email: user.email,
                            provider: account.provider,
                            providerId: account.providerAccountId,
                        },
                    });
                    console.log(`New user created: ${user.email}`);

                } else {
                    console.log(`User loged in: ${user.email}`);
                }
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        },
        async session({ session, token }) {
            // Attach user ID to session
            session.user.id = token.sub;
            return session;
        },
        async jwt({ token, user }) {
            // Attach user ID to JWT token
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
});

