'use client'

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import { TextInput, Textarea, Button } from "@mantine/core";

import toast from "react-hot-toast";
import { Send } from "lucide-react";

import classes from './journalForm.module.css';

export default function ResetPasswordPage() {
    
    // State variables for text inputs and loading state
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const searchParams = useSearchParams();
    const token = searchParams.get("token");


    return (
        <div className={classes.formContainer}>

            <h1 className={classes.formTitle}>Reset Password</h1>

        </div>

    )
    
    
}