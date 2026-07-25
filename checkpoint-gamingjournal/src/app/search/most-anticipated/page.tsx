import { Metadata } from "next";
import MostAnticipated from "./mostAnticipated";

// Set the page title for Search page
export const metadata: Metadata = {
  title: "Most Anticipated | CheckPoint",
};

export default function Page() {
  return <MostAnticipated />;
}
