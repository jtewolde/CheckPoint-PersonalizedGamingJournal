
import { Metadata } from "next"
import ResetPasswordPage from "./ResetPasswordPage";

// Set the page title for reset password page
export const metadata: Metadata = {
  title: "Reset Password | CheckPoint"
}

export default function Page(){
    return <ResetPasswordPage />;
}
