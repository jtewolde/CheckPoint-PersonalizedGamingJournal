
import { Metadata } from "next";
import SearchResults from "./SearchPage";

// Set the page title for Search page
export const metadata: Metadata = {
  title: "Search | CheckPoint"
}

export default function Page() {
    return <SearchResults />
}