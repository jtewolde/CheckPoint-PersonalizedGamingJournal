
import { Metadata } from "next";
import Chat from "./ChatPage";

// Set the page title for chat page
export const metadata: Metadata = {
  title: "Chat | CheckPoint"
}

export default function Page(){
    return <Chat />
}