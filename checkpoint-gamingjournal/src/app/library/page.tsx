
import { Metadata } from "next"
import Library from "./LibraryPage"

// Set the page title for library page
export const metadata: Metadata = {
  title: "Library | CheckPoint"

export default function Page(){
    return <Library />;
}