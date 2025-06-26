
import { Metadata } from "next";
import Profile from "./ProfilePage";

// Set the page title for Profile page
export const metadata: Metadata = {
  title: "Settings - Profile | CheckPoint"
}

export default function Page(){
  return <Profile />
}