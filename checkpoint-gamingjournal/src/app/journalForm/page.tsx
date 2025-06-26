
import { Metadata } from "next";
import JournalForm from "./JournalFormPage";

// Set the page title for journal form page
export const generateMetadata = () => ({
  title: "JournalForm | CheckPoint"
})

export default function Page() {
  return <JournalForm />
}