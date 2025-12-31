
import { Metadata } from "next";
import CentralSearchPage from "./CentralSearchPage";

// Set the page title for Search page
export const metadata: Metadata = {
  title: "Search | CheckPoint"
}

export default function Page() {
    return <CentralSearchPage />
}