import { ProfileEditor } from "@/components/profile/profile-editor"

export const metadata = {
  title: "My Profile - GearNest",
}

export default function CustomerProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfileEditor />
    </div>
  )
}
