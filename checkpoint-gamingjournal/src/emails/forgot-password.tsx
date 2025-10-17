import * as React from "react";

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { px } from "@mantine/core";

interface ForgotPasswordEmailProps {
  username: string;
  resetUrl: string;
  userEmail: string;
}

const baseUrl = process.env.NODE_ENV === "production" ? process.env.VERCEL_URL : 'http://localhost:3000';

const ForgotPasswordEmail = (props: ForgotPasswordEmailProps) => {
    const {username ,resetUrl, userEmail} = props;

    return (
        <Html lang="en">

          <Head />
          
            <Body style={main}>

              <Preview>Reset Your Password - Action Required</Preview>

              <Container style={container}>

                <Img src="https://uh2u77zswq.ufs.sh/f/w1tMu8eAipZ2e0vDbpaMUEKRO6IyHxzvVLhwGlS8stTYqAng" style={logo} alt="CheckPoint" width={260} height={90}/>

                <Section style={textSection}>

                  <Text style={title}> Forgot Password </Text>

                  <Text style={text}> Hello There, <b>{username}!</b> </Text>

                  <Text style={text}>
                    Someone recently requested a password reset on your CheckPoint account using this email address: <b>{userEmail}</b>,
                    If this was indeed you, click on the reset password button below. Otherwise, you can ignore this email.
                  </Text>

                  <Text style={text} >
                    Remember to follow strong password guidelines when creating a password for your account!
                  </Text>

                  <Container style={{justifyContent: 'center', display: 'flex'}}>

                    <Button style={button} href={resetUrl}>
                      Reset your Password
                    </Button>

                  </Container>

                  <Text style={text}>
                    If the button above does not work, copy and paste the following link into your browser:
                    <Link href={resetUrl} style={{color: '#0a259c'}}>
                      {resetUrl}
                    </Link>
                  </Text>

                  <Text style={text}>
                    There is a 1 hour time limit on this link, so please reset your password as soon as possible.
                  </Text>

                  <Text style={text}>
                    Thanks!
                  </Text>

                </Section>

              </Container>
              
            </Body>

        </Html>
    )
}

export default ForgotPasswordEmail

const main = {
  backgroundColor: '#fbf3f5',
  padding: '10px 0'
}

const container: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: '#212121',
  border: '1px solid black',
  padding: '45px'
}

const textSection = {
  display: 'flex',
  justifyContent: 'center',
  padding: '0 20px',
  backgroundColor: '#464646ff',
  borderRadius: '8px',
  marginTop: '30px',
  color: 'white',
  border: '1px solid #525252ff'
}

const title = {
  fontSize: '28px',
  justifySelf: 'center',
  borderBottom: '3px solid white',
  fontFamily: "'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: 'bold',
  marginTop: '20px',
  marginBottom: '40px'
}

const text = {
  fontSize: '16px',
  fontFamily: "'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '400',
  color: 'white',
  lineHeight: '25px'
}

const logo = {
  margin: '0 auto',
  height: '100px'
}

const button = {
  backgroundColor: '#0a259c',
  borderRadius: '4px',
  color: 'white',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: '20px',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '14px 7px',
  cursor: 'pointer',
  marginTop: '20px',
  marginBottom: '20px'
}