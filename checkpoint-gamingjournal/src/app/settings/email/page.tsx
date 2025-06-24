
import { Metadata } from "next";
import Email from "./EmailPage";

// Set the page title for Email page
export const metadata: Metadata = {
  title: "Settings - Email | CheckPoint"
}

export default function Page(){
  return <Email />
}