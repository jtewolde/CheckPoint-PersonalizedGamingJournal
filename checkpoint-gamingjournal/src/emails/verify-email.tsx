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

interface verifyEmailProps {
  username: string;
  verifyUrl: string;
}

const baseUrl = process.env.NODE_ENV === "production" ? process.env.VERCEL_URL : 'http://localhost:3000';

const verifyEmail = (props: verifyEmailProps) => {
    const {username, verifyUrl} = props;

    return (
        <Html lang="en">
          <Head />
            <Body style={main}>

              <Preview>CheckPoint Email Verification - Action Required</Preview>

              <Container style={container}>

                <Img src={`${baseUrl}/static/CheckPointLogoEmail.png`} style={logo} alt="CheckPoint" width={260} height={90}/>

                <Section style={textSection}>

                  <Text style={title}> Verify your Email </Text>

                  <Text style={text}> Hello There, {username}! </Text>

                  <Text style={text}>
                    Welcome to CheckPoint! With this website, CheckPoint is a web application designed for gamers to track their progress in the games they are playing and plan to play in the future. 
                    It helps users log their gaming sessions, create journal entries for games they play, and visualize their progress over time. 
                    With CheckPoint, you'll never forget where you left off in a game!
                  </Text>

                  <Text style={text} >
                    To get started, please verify your email address by clicking the button below.
                  </Text>

                  <Button style={button} href={verifyUrl} >
                    Verify your Email
                  </Button>

                  <Text style={text}>
                    Thanks!
                  </Text>

                </Section>

              </Container>
              
            </Body>
        </Html>
    )
}

export default verifyEmail;

const main = {
  backgroundColor: '#fbf3f5',
  padding: '10px 0'
}

const container = {
  backgroundColor: 'white',
  border: '1px solid black',
  padding: '45px'
}

const textSection = {
  padding: '0 20px',
  backgroundColor: '#f0f0f0',
  borderRadius: '8px',
  marginTop: '30px'
}

const title = {
  fontSize: '24px',
  fontFamily: "'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: 'bold',
  marginTop: '20px',
  marginBottom: '25px'
}

const text = {
  fontSize: '16px',
  fontFamily: "'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '400',
  color: 'black',
  lineHeight: '25px'
}

const logo = {
  margin: '0 auto'
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