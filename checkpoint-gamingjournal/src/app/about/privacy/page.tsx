
import { Metadata } from "next"
import PrivacyPolicyPage from "./PrivacyPolicy";

// Set the page title for library page
export const metadata: Metadata = {
  title: "Terms | CheckPoint"
}

export default function Page(){
    return <PrivacyPolicyPage />;
}
