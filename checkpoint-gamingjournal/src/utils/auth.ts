import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import db from "./db";

export const auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        minPasswordLength: 8,
        maxPasswordLength: 128
    },

    user: {
        modelName: "users",

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
                type: "number",
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
            summary: {
                type: "string",
                required: false,
            },
            platforms:{
                type:"string[]",
                required:false,
            },
            genres:{
                type:"string[]",
                required:false,
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