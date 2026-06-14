import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../../src/components/app-shell";
import { Users, Search, Filter, Download, Eye, Trash2, Mail, Calendar, Building, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllUsers, getAssessments } from "../../lib/api/store-supabase";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
}) as any;

function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const allUsers = await getAllUsers();
      const usersWithStats = await Promise.all(
        allUsers.map(async (user: any) => {
          const assessments = await getAssessments(user.id);
          const avgScore = assessments.length > 0
            ? Math.round(assessments.reduce((sum: number, a: any) => sum + a.score, 0) / assessments.length)
            : 0;
          const riskLevel = avgScore < 30 ? "Low" : avgScore < 55 ? "Moderate" : avgScore < 75 ? "High" : "Severe";
          return {
            ...user,
            joinedDate: new Date().toISOString().split('T')[0], // Placeholder since we don't have created_at in User type
            lastActive: "Recently",
            assessmentsCount: assessments.length,
            avgBurnoutScore: avgScore,
            riskLevel,
          };
        })
      );
      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      (filterRole === "all" || user.riskLevel === filterRole) &&
      (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Moderate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "High":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "Severe":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const exportToCSV = () => {
    if (filteredUsers.length === 0) return;
    const headers = ["Full Name", "Email", "Student ID", "Institution", "Risk Level", "Assessments Count", "Avg Burnout Score", "Last Active"];
    const rows = filteredUsers.map(u => [
      u.fullName,
      u.email,
      u.studentId,
      u.institution,
      u.riskLevel,
      u.assessmentsCount,
      u.avgBurnoutScore,
      u.lastActive
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mindtrack_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Management</h1>
              <p className="mt-2 text-muted-foreground">View and manage all registered users</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={exportToCSV}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/60"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground">{loading ? "..." : users.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-green-600">{loading ? "..." : users.filter((u) => u.riskLevel === "Low").length}</p>
            <p className="text-sm text-muted-foreground">Low Risk</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-yellow-600">{loading ? "..." : users.filter((u) => u.riskLevel === "Moderate").length}</p>
            <p className="text-sm text-muted-foreground">Moderate Risk</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-red-600">{loading ? "..." : users.filter((u) => u.riskLevel === "High" || u.riskLevel === "Severe").length}</p>
            <p className="text-sm text-muted-foreground">High/Severe Risk</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/40">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Institution</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Risk Level</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Assessments</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-secondary/20">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{user.studentId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{user.institution}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRiskLevelColor(user.riskLevel)}`}>
                          {user.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">{user.assessmentsCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{user.lastActive}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to="/admin/users/$userId"
                            params={{ userId: user.id }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No users found matching your search</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
