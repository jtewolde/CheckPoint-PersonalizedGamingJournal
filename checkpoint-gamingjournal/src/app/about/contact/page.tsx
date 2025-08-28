
import { Metadata } from "next";
import Contact from "./ContactPage";

// Set the page title for contact page
export const metadata: Metadata = {
  title: "Contact | CheckPoint"
}

export default function Page(){
    return <Contact />
}