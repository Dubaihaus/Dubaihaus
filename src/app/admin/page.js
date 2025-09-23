// /src/app/admin/page.js
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function AdminPage() {
  // Check if user is logged in
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login") // send back to login
  }

  // (Optional) restrict only ADMINs
  if (session.user.role !== "ADMIN") {
    redirect("/") // kick out if not admin
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome {session.user.email}, you are logged in as {session.user.role}.
      </p>
    </div>
  )
}
