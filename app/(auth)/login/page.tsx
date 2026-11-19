import { Suspense } from "react"
import { LoginForm } from "./LoginForm"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="gn-card flex h-80 items-center justify-center p-8 text-sm text-slate-500">
          Loading sign in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
