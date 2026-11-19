import { ProfileEditor } from "@/components/profile/profile-editor"

export const metadata = {
  title: "Admin Profile - GearNest",
}

export default function AdminProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfileEditor />
    </div>
  )
}
