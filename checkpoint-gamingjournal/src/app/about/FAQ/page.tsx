
import { Metadata } from "next";
import FAQ from "./FAQ_Page";

// Set the page title for FAQ page
export const metadata: Metadata = {
  title: "FAQ | CheckPoint"
}

export default function Page() {
    return <FAQ />
}