
import { Metadata } from "next"
import RoadmapPage from "./page";

// Set the page title for library page
export const metadata: Metadata = {
  title: "Terms | CheckPoint"
}

export default function Page(){
    return <RoadmapPage />
}
