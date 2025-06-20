import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { resend } from "./resend";
import db from "./db";

export const auth = betterAuth({
    database: mongodbAdapter(db),

    cors: {
    origin: [
      "https://checkpoint-gaming.vercel.app",
      "https://checkpoint-gaming-qpy6bmti8-joseph-tewoldes-projects.vercel.app"
    ],
    credentials: true
  },

    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        requireEmailVerification: true
    },

    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ( { user, url}) => {
            console.log("Email Vertification for: ", user.email)
            await resend.emails.send({
                from: "Acme <onboarding@resend.dev>",
                to: user.email,
                subject: "CheckPoint Email Vertification",
                html: `Please click the link to verify your email to use CheckPoint: ${url}`,
            });
        }
    },

    account: {
        accountLinking:{
            enabled: true,
            trustedProviders: ["google", "discord"],
        }
    },

    user: {
        modelName: "users",
        deleteUser: {
            enabled:true
        },

        additionalFields: {
            games: {
                type: "string[]",
                defaultValue: [],
                required: false,
            }
        }
    },

    game: {
        modelName: "games",

        fields:{
            igdbId: {
                type: "string",
                required: true,
            },
            name: {
                type: "string",
                required: true,
            },
            coverImageId: {
                type: "string",
                required: false,
            },
            status: {
                type: "string",
                required: false,
                enum: ["playing", "completed", "on_hold", "dropped", "plan_to_play"],
                defaultValue: "No Status Given",
            },
            summary: {
                type: "string",
                required: false,
            },
            journalEntries: {
                type: "string[]",
                required: false,
                defaultValue: [],
            },
            userId: {
                type: "string",
                required: true,
            },
        }
    },

    journalEntry: {
        modelName: "journalEntries",

        fields:{
            gameId: {
                type: "string",
                required: true,
            },
            userId: {
                type: "string",
                required: true,
            },
            title: {
                type: "string",
                required: true,
            },
            content:{
                type:"string",
                required:true,
            },
            date:{
                type:"date",
                required:true,
            },
        }
    },

    socialProviders: {
        google:{
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        },
        discord:{
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
        }
    },

    // Enable the bearer token authentication
    plugins: [bearer()]

})