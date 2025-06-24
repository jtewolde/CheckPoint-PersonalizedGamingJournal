
import { Metadata } from "next";
import Dashboard from "./DashboardPage";

// Set the page title for dashboard page
export const metadata: Metadata = {
  title: "Dashboard | CheckPoint"
}

export default function Page(){
  return <Dashboard />
}