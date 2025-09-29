
import { Metadata } from "next"
import NotFound from "./notFound"

// Set the page title for Journal page
export const metadata: Metadata = {
  title: `Not Found | CheckPoint`
}

export default function Page() {
    return <NotFound />
}
