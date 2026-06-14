import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../../src/components/app-shell";
import { ArrowLeft, Search, Filter, Download, AlertTriangle, TrendingUp, Calendar, User } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllAssessments, getAllUsers } from "../../lib/api/store-supabase";

export const Route = createFileRoute("/admin/assessments")({
  component: AdminAssessments,
}) as any;

function AdminAssessments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  async function loadAssessments() {
    try {
      const allAssessments = await getAllAssessments();
      const allUsers = await getAllUsers();
      const userMap = new Map(allUsers.map(u => [u.id, u]));
      
      const assessmentsWithUsers = allAssessments.map(assessment => {
        const user = userMap.get(assessment.userId);
        return {
          ...assessment,
          userName: user?.fullName || 'Unknown',
          userEmail: user?.email || 'unknown@example.com',
        };
      });
      
      setAssessments(assessmentsWithUsers);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAssessments = assessments.filter(
    (assessment) =>
      (filterRisk === "all" || assessment.level === filterRisk) &&
      (assessment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
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
    if (filteredAssessments.length === 0) return;
    const headers = ["User Name", "User Email", "Date", "Burnout Score", "Risk Level", "Contributing Factors"];
    const rows = filteredAssessments.map(a => [
      a.userName,
      a.userEmail,
      a.date ? new Date(a.date).toLocaleString() : "",
      a.score,
      a.level,
      (a.factors || []).map((f: any) => `${f.label} (+${f.contribution})`).join("; ")
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mindtrack_assessments_${new Date().toISOString().split('T')[0]}.csv`);
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
              <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Link>
              <h1 className="mt-4 text-3xl font-bold text-foreground">Assessment Overview</h1>
              <p className="mt-2 text-muted-foreground">View all burnout assessments across users</p>
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
            <p className="text-2xl font-bold text-foreground">{loading ? "..." : assessments.length}</p>
            <p className="text-sm text-muted-foreground">Total Assessments</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-green-600">{loading ? "..." : assessments.filter((a) => a.level === "Low").length}</p>
            <p className="text-sm text-muted-foreground">Low Risk</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-yellow-600">{loading ? "..." : assessments.filter((a) => a.level === "Moderate").length}</p>
            <p className="text-sm text-muted-foreground">Moderate Risk</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-red-600">{loading ? "..." : assessments.filter((a) => a.level === "High" || a.level === "Severe").length}</p>
            <p className="text-sm text-muted-foreground">High/Severe Risk</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
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

        {/* Assessment Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-muted-foreground">Loading assessments...</p>
            </div>
          ) : (
            filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{assessment.userName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{assessment.userEmail}</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{assessment.date}</span>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRiskLevelColor(assessment.level)}`}>
                        {assessment.level}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-foreground">Contributing Factors:</p>
                      {assessment.factors.map((factor: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{factor.label}</span>
                          <span className="font-medium text-foreground">+{factor.contribution}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-foreground">{assessment.score}</p>
                      <p className="text-sm text-muted-foreground">Burnout Score</p>
                    </div>
                    <Link
                      to="/admin/users/$userId"
                      params={{ userId: assessment.userId }}
                      className="text-sm text-primary hover:underline"
                    >
                      View User
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredAssessments.length === 0 && (
          <div className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No assessments found matching your search</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
