import Image from "next/image";
import styles from "./page.module.css";
import { Header } from "./components/Header";
import { Button } from "@mantine/core";

export default function Home() {
  return (
    <div className= "home">
      <Header />
      <h1>Checkpoint Gaming Journal</h1>
      
    </div>

  );
}
