
import { Metadata } from "next";
import SearchResults from "./SearchPage";
import SearchPage2 from "./SearchPage2";

// Set the page title for Search page
export const metadata: Metadata = {
  title: "Search | CheckPoint"
}

export default function Page() {
    return <SearchPage2 />
}