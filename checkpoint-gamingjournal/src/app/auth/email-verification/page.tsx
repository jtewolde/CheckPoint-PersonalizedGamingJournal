
import { Metadata } from "next"
import EmailVerificationPage from "./EmailVerificationPage";

// Set the page title for reset password page
export const metadata: Metadata = {
  title: "Email Vertification | CheckPoint"
}

export default function Page(){
    return <EmailVerificationPage />;
}
