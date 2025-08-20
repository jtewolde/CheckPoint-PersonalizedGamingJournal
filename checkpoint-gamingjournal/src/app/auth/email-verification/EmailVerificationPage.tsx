'use client';

import { authClient } from "@/lib/auth-client";

import { Overlay, Button } from "@mantine/core";
import toast from "react-hot-toast";
import { Send } from "lucide-react";

import classes from './verification.module.css';
import { useState } from "react";

export default function EmailVerificationPage() {
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState(localStorage.getItem("UnverifiedEmail") || '');

    // Function to resend verification email 
    const sendVerificationEmail = async () => {
        setLoading(true);

        const {data, error} = await authClient.sendVerificationEmail({
            email: userEmail
        })

        toast.success("Verification email sent successfully!");
        setLoading(false);
    }

    return(
        <div className={classes.container}>
            <Overlay
            gradient="linear-gradient(180deg, #1f1c2c 10%,rgb(47, 45, 58) 20%)"
            opacity={0.75}
            zIndex={0}
            />

            <div className={classes.content}>
                <h1 className={classes.title}>WELCOME TO CHECKPOINT</h1>

                <p className={classes.description}>
                    Almost There! 
                </p>

                <div className={classes.actions}>
                    <p className={classes.message}>
                        An email has been sent to your registered email address. 
                        <br />Please check your inbox and click on the verification link to activate your account!

                    </p>
                    <p className={classes.message}>
                        If you did not receive the email, please check your spam folder or click the button below to resend the verification email.
                    </p>

                    <Button className={classes.resendButton} variant="filled" size="md" radius='lg' color="blue" loading={loading} leftSection={<Send size={20} />} onClick={sendVerificationEmail}>
                        Resend Verification Email
                    </Button>

                </div>
                
            </div>

        </div>
    )
}