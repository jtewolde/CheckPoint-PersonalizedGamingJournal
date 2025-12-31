
import { Metadata } from "next";
import JournalForm from "./JournalFormPage";

// Set the page title for journal form page
export const generateMetadata = () => ({
  title: "Journal Form | CheckPoint"
})

export default function Page() {
  return <JournalForm />
}