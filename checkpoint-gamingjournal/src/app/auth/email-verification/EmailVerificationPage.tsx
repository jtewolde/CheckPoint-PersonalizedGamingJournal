'use client';

import { Overlay } from "@mantine/core";

import classes from './verification.module.css';

export default function EmailVerificationPage() {
    return(
        <div className={classes.container}>
            <Overlay
            gradient="linear-gradient(180deg, #1f1c2c 10%,rgb(47, 45, 58) 20%)"
            opacity={0.05}
            zIndex={0}
            />

            <div className={classes.content}>
                <h1 className={classes.title}>Email Verification</h1>
                
            </div>

        </div>
    )
}