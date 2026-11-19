import { ProfileEditor } from "@/components/profile/profile-editor"

export const metadata = {
  title: "Partner Profile - GearNest",
}

export default function OwnerProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfileEditor />
    </div>
  )
}
