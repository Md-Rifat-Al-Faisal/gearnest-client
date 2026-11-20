"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Shield,
  Trash2,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Mail,
  Calendar,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

interface AdminUser {
  id: string
  name: string
  email: string
  role: "customer" | "owner" | "admin"
  image?: string
  phone?: string
  address?: string
  createdAt?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Current session to prevent self-demotion / self-deletion
  const { data: session } = authClient.useSession()
  const currentUserId = session?.user?.id

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    user: AdminUser | null
  }>({
    open: false,
    user: null,
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await apiRequest("/api/admin/users")
      const data = await res.json()

      if (res.ok && data.users) {
        setUsers(data.users)
      } else {
        toast.error(data.message || "Failed to load platform users")
      }
    } catch {
      toast.error("Network error fetching user directory")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: "customer" | "owner" | "admin") => {
    if (userId === currentUserId) {
      toast.error("You cannot change or demote your own admin account role.")
      return
    }

    try {
      setUpdatingId(userId)
      const res = await apiRequest(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success(`User role updated to ${newRole}`)
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        )
      } else {
        toast.error(data.message || "Failed to update user role")
      }
    } catch {
      toast.error("Network error while updating role")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return
    const { id } = deleteModal.user

    if (id === currentUserId) {
      toast.error("You cannot delete your own admin account.")
      return
    }

    try {
      setUpdatingId(id)
      const res = await apiRequest(`/api/admin/users/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success("User account deleted successfully")
        setUsers((prev) => prev.filter((u) => u.id !== id))
      } else {
        toast.error(data.message || "Failed to delete user account")
      }
    } catch {
      toast.error("Network error while deleting user")
    } finally {
      setUpdatingId(null)
      setDeleteModal({ open: false, user: null })
    }
  }

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesRole =
      roleFilter === "all" ? true : u.role.toLowerCase() === roleFilter.toLowerCase()

    const term = search.toLowerCase().trim()
    const matchesSearch =
      !term ||
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)

    return matchesRole && matchesSearch
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [search, roleFilter])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-amber-500" />
          Platform User Management
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage system accounts, assign RBAC access roles, and moderate user permissions
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="admin-users-search" className="sr-only">
            Search users
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="admin-users-search"
            name="search"
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="admin-users-role" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Role:
          </label>
          <select
            id="admin-users-role"
            name="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="customer">Customers</option>
            <option value="owner">Fleet Owners</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="size-10 mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Users Found</h3>
            <p className="text-xs text-slate-500">No registered users match the selected criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4">Change Access Role</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedUsers.map((user) => {
                    const isSelf = user.id === currentUserId
                    const isUpdating = updatingId === user.id
                    const regDate = user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"

                    const roleStyle =
                      user.role === "admin"
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        : user.role === "owner"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                              {user.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.image} alt={user.name} className="size-full object-cover" />
                              ) : (
                                <Users className="size-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {user.name || "Unnamed User"}
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/10 text-amber-600 font-semibold border border-amber-500/20">
                                    You
                                  </span>
                                )}
                              </span>
                              {user.phone && <span className="text-[11px] text-slate-400">{user.phone}</span>}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 align-middle text-slate-600 dark:text-slate-300">
                          {user.email}
                        </td>

                        {/* Current Role */}
                        <td className="py-3.5 px-4 align-middle">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleStyle}`}
                          >
                            <Shield className="size-3" />
                            <span className="capitalize">{user.role}</span>
                          </span>
                        </td>

                        {/* Registered Date */}
                        <td className="py-3.5 px-4 align-middle text-slate-500 dark:text-slate-400">
                          {regDate}
                        </td>

                        {/* Change Role Selector */}
                        <td className="py-3.5 px-4 align-middle">
                          <label htmlFor={`role-select-${user.id}`} className="sr-only">
                            Change role for {user.name}
                          </label>
                          <select
                            id={`role-select-${user.id}`}
                            name="userRole"
                            disabled={isSelf || isUpdating}
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value as "customer" | "owner" | "admin")
                            }
                            className={`px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                            }`}
                            title={isSelf ? "Self-demotion disabled" : "Assign new role"}
                          >
                            <option value="customer">Customer</option>
                            <option value="owner">Fleet Owner</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 align-middle text-right">
                          <button
                            type="button"
                            disabled={isSelf || isUpdating}
                            onClick={() => setDeleteModal({ open: true, user })}
                            className={`p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors ${
                              isSelf ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                            }`}
                            title={isSelf ? "Cannot delete own account" : "Delete user"}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {filteredUsers.length}
                  </span>{" "}
                  platform users
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </button>

                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  Permanently Delete User
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Account: {deleteModal.user.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete user <strong>{deleteModal.user.name}</strong>? This action
              is permanent and removes the user and their associated access permissions.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, user: null })}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={Boolean(updatingId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {updatingId ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
