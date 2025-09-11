
import { Metadata } from "next";
import PopularPage from "./PopularGamesPage";

// Set the page title for Search page
export const metadata: Metadata = {
  title: "Popular Games | CheckPoint"
}

export default function Page() {
    return <PopularPage />
}