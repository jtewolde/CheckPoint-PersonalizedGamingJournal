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

                <Img src="https://uh2u77zswq.ufs.sh/f/w1tMu8eAipZ2e0vDbpaMUEKRO6IyHxzvVLhwGlS8stTYqAng" style={logo} alt="CheckPoint" width={260} height={90}/>

                <Section style={textSection}>

                  <Text style={title}> Verify your Email </Text>

                  <Text style={text}> Hello There, <b>{username}!</b></Text>

                  <Text style={text}>
                    Welcome to CheckPoint! With this website, CheckPoint is a web application designed for gamers to track their progress in the games they are playing and plan to play in the future. 
                    It helps users log their gaming sessions, create journal entries for games they play, and visualize their progress over time. 
                    With CheckPoint, you'll never forget where you left off in a game!
                  </Text>

                  <Text style={text} >
                    To get started, please verify your email address by clicking the button below.
                  </Text>

                  <Container style={{justifyContent: 'center', display: 'flex'}}>

                    <Button style={button} href={verifyUrl} >
                      Verify your Email
                    </Button>

                  </Container>

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
  backgroundColor: '#127fc8ff',
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