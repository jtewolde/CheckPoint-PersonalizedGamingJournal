'use client'

import React from 'react'
import { useState, useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function Dashboard (){

  const router = useRouter();

   // Check if the user is authenticated
        useEffect(() => {
          const checkAuth = async () => {
            const { data } = await authClient.getSession();
            if (!data?.user) {
              // If the user isn't authenicated, return to the sign in page
              return redirect("/auth/signin")
            }
          };
      
          checkAuth();
        }, [router]);

  return (
    <div>dashboard</div>
  )
}
