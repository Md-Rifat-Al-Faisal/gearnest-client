"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Shield,
  Trash2,
  Search,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

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
      roleFilter === "all" ? true : (u.role || "").toLowerCase() === roleFilter.toLowerCase()

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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-accent-text" />
          Platform User Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage system accounts, assign RBAC access roles, and moderate user permissions
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="admin-users-search" className="sr-only">
            Search users
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="admin-users-search"
            name="search"
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="admin-users-role" className="text-xs font-semibold text-muted-foreground">
            Role:
          </label>
          <select
            id="admin-users-role"
            name="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 rounded-lg border border-border bg-surface text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground cursor-pointer"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="customer">Customers</option>
            <option value="owner">Fleet Owners</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="size-10 mx-auto text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground font-heading">No Users Found</h3>
            <p className="text-xs text-muted-foreground">No registered users match the selected criteria.</p>
          </div>
        ) : (
          <>
            <div className="w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-surface-2 text-muted-foreground font-bold text-[11px] uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4">Change Access Role</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
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
                        ? "bg-danger/10 text-danger border-danger/20"
                        : user.role === "owner"
                          ? "bg-primary/10 text-accent-text border-primary/20"
                          : "bg-surface-2 text-foreground border-border"

                    return (
                      <tr
                        key={user.id}
                        className="odd:bg-surface even:bg-surface-2/40 hover:bg-surface-2 transition-colors"
                      >
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full overflow-hidden bg-surface-2 flex items-center justify-center shrink-0 border border-border">
                              {user.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.image} alt={user.name} className="size-full object-cover" />
                              ) : (
                                <Users className="size-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-foreground flex items-center gap-1.5">
                                {user.name || "Unnamed User"}
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-primary/10 text-accent-text font-semibold border border-primary/20">
                                    You
                                  </span>
                                )}
                              </span>
                              {user.phone && <span className="text-[11px] text-muted-foreground">{user.phone}</span>}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 align-middle text-foreground">
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
                        <td className="py-3.5 px-4 align-middle text-muted-foreground">
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
                            className={`px-2.5 py-1 rounded-lg border border-border bg-surface-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
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
                            className={`p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors ${
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 bg-surface-2/40">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                  </span>{" "}
                  of <span className="font-semibold text-foreground">{filteredUsers.length}</span> users
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    <span>Previous</span>
                  </Button>
                  <div className="px-3 py-1.5 text-xs font-bold text-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete User Modal */}
      {deleteModal.open && deleteModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-band/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-danger/10 text-danger border border-danger/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground font-heading">Delete User Account</h3>
                <p className="text-xs text-muted-foreground">{deleteModal.user.email}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete the account for{" "}
              <strong className="text-foreground">{deleteModal.user.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModal({ open: false, user: null })}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleDeleteUser}
                disabled={Boolean(updatingId)}
              >
                {updatingId ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
