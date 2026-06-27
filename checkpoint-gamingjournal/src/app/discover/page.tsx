
import { Metadata } from "next";
import DiscoverPage from "./discoverPage";

// Set the page title for Search page
export const metadata: Metadata = {
    title: "Discover | CheckPoint"
}

export default function Page() {
    return <DiscoverPage />
}