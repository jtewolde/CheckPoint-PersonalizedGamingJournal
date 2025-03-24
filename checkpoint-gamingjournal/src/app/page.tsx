import { Button, Container, Overlay, Text, Title } from '@mantine/core';
import classes from './page.module.css';

import Image from "next/image";

export default function Home() {
  return (
    <div className= {classes.hero}>
      <Overlay
        gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, .65) 40%)"
        opacity={1}
        zIndex={0}
      />

      <Container size={'md'} className={classes.container}>

         <Title className={classes.title}> Your Personal Gaming Journal </Title>
         <Text className={classes.text} size="xl" mt="xl">
          Build 
         </Text>


      </Container>
      
    </div>

  );
}
