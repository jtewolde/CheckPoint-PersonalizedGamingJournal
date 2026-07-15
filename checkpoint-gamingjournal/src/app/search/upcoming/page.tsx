
import { Metadata } from "next";
import UpcomingPage from '../upcoming/upcomingPage'

// Set the page title for Search page
export const metadata: Metadata = {
  title: "Trending Games | CheckPoint"
}

export default function Page() {
    return <UpcomingPage />
}