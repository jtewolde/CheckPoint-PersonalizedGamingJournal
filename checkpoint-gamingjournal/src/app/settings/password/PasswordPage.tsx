'use client'

import React from 'react'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button, Title, PasswordInput} from '@mantine/core';
import { Lock, Save } from 'lucide-react';

import { authClient } from '@/lib/auth-client';

import toast from 'react-hot-toast';
import classes from './password.module.css'

export default function PasswordPage(){

    const router = useRouter();

    const [provider, setProvider] = useState('')
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false)

    // Check if the user is authenticated
    useEffect(() => {
    const checkAuth = async () => {
        const { data } = await authClient.getSession();
        if (!data?.user) {
        // If the user isn't authenticated, redirect to the sign-in page
        router.push('/auth/signin')
        }
    }
    
    checkAuth();
    }, [router]);

    // Function to handle password change
    const handleChangePassword = async () => {
        setLoading(true);
        setPasswordError('');

        // Validate new password and confirm password
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        const {data, error} = await authClient.changePassword({
            newPassword: newPassword,
            currentPassword: currentPassword,
            revokeOtherSessions: true,
            fetchOptions: {
                onRequest: () => {
                    setLoading(true);
                },
                onResponse: () => {
                    setLoading(false);
                },
                onSuccess: () => {
                    setLoading(false);
                    toast.success("Password changed successfully!");
                    router.push('/dashboard');
                },
                onError: (ctx) => {
                    setLoading(false);
                    setPasswordError(ctx.error?.message || "Failed to change password");
                    toast.error(ctx.error?.message || "Failed to change password");
                }
            }
        })
    }

    return(
        <div className={classes.passwordContainer} >
            
            <Title order={1} className={classes.title}>Change Password</Title>

            <PasswordInput className={classes.passwordInput} label="Current Password" placeholder="Current password" leftSection={<Lock size={20} />} mt="md" size="lg" value={currentPassword} onChange={(e) => setCurrentPassword(e.currentTarget.value)} error={passwordError}/>

            <PasswordInput className={classes.passwordInput} label="Password" placeholder="Your password" leftSection={<Lock size={20} />} mt="md" size="lg" value={newPassword} onChange={(e) => setNewPassword(e.currentTarget.value)} error={passwordError}/>

            <PasswordInput className={classes.passwordInput} label="Confirm Password" placeholder="Confirm password" leftSection={<Lock size={20} />} mt="md" size="lg" value={confirmPassword} onChange={(e) => setConfirmPassword(e.currentTarget.value)} error={passwordError}/>

            <Button className={classes.changeButton} radius='md' color='grape' rightSection={<Save size={20} />} mt="xl" size="md" loading={loading} disabled={!currentPassword || !newPassword || !confirmPassword} onClick={handleChangePassword}>
                Save Changes
            </Button>

        </div>
    )

}