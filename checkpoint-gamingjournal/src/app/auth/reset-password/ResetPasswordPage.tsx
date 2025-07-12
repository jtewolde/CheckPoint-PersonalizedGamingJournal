'use client'

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import { PasswordInput, Button } from "@mantine/core";

import toast from "react-hot-toast";
import { Send, Lock } from "lucide-react";

import classes from './reset.module.css';


export default function ResetPasswordPage() {
    
    // State variables for text inputs and loading state
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const searchParams = useSearchParams();
    const token = searchParams.get("token") as string;

    // Redirect if token is not preset
    useEffect(() => {
        if (!token) {
            redirect('/auth/signin');
        }
    }, [token, router]);
    
    // Function to handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate password and confirm password
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            toast.error("Passwords do not match!");
            setLoading(false);
            return;
        }

        const { error } = await authClient.resetPassword({
            newPassword: password,
            token
        });

        if (error) {
            setPasswordError(error.message ?? "An unknown error occurred.");
            toast.error(error.message ?? "An unknown error occurred.");
        } else {
            toast.success("Password reset successfully!");
            router.push('/auth/signin');
        }
    }


    return (
        <div className={classes.formContainer}>

            <h1 className={classes.formTitle}>Reset Your Password</h1>

            <p className={classes.formSubtitle}>Enter your new password below. <br />
                Use a strong password that includes a mix of letters, numbers, and symbols.
            </p>

            <form className={classes.form} onSubmit={handleSubmit}>

                <PasswordInput className={classes.password} label="New Password" placeholder="Your password" leftSection={<Lock size={20} />} mt="sm" size="md" value={password} onChange={(e) => setPassword(e.currentTarget.value)} error={passwordError}/>

                <PasswordInput className={classes.password} label="Confirm Password" placeholder="Confirm password" leftSection={<Lock size={20} />} mt="sm" size="md" value={confirmPassword} onChange={(e) => setConfirmPassword(e.currentTarget.value)} error={passwordError}/>

                <Button className={classes.submitButton} color="gray" type="submit" mt='md' size="lg" radius='lg' rightSection={<Send size={20} />} loading={loading} >
                    Reset Password
                </Button>
            
            </form>

        </div>

    )
    
    
}