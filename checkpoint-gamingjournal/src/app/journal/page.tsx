
import { Metadata } from "next"
import Journal from "./JournalPage"

// Set the page title for Journal page
export const metadata: Metadata = {
  title: "Journal | CheckPoint"
}

export default function Page() {
    return <Journal />
}
