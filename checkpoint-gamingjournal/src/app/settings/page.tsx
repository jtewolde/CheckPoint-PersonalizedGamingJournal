// app/settings/page.tsx

import { redirect } from "next/navigation";

export default function SettingsHome() {
  redirect('/settings/profile');
}
