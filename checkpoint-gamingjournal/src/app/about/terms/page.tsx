
import { Metadata } from "next"
import TermsOfServicePage from "./TermsOfServicePage";

// Set the page title for library page
export const metadata: Metadata = {
  title: "Terms | CheckPoint"
}

export default function Page(){
    return <TermsOfServicePage />;
}
