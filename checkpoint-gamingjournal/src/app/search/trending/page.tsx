
import { Metadata } from "next";
import TrendingPage from "./TrendingGamesPage";

// Set the page title for Search page
export const metadata: Metadata = {
  title: "Trending Games | CheckPoint"
}

export default function Page() {
    return <TrendingPage />
}