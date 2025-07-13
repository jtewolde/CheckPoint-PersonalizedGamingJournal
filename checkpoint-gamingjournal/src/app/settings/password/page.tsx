
import { Metadata } from "next";
import PasswordPage from "./PasswordPage";

// Set the page title for Password page
export const metadata: Metadata = {
  title: "Settings - Password | CheckPoint"
}

export default function Page(){
  return <PasswordPage />
}
