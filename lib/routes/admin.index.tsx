import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../../src/components/app-shell";
import { Users, BarChart3, FileText, Activity, Shield, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllUsers, getAllAssessments } from "../../lib/api/store-supabase";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
}) as any;

function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [u, a] = await Promise.all([
          getAllUsers(),
          getAllAssessments(),
        ]);
        setUsers(u);
        setAssessments(a);
      } catch (error) {
        console.error("Error loading admin stats:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalUsers = users.length;
  const activeAssessments = assessments.length;

  const userScores: Record<string, number[]> = {};
  assessments.forEach((a) => {
    if (!userScores[a.userId]) userScores[a.userId] = [];
    userScores[a.userId].push(a.score);
  });
  
  let highRiskCount = 0;
  Object.values(userScores).forEach((scores) => {
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    if (avg >= 55) highRiskCount++;
  });

  const avgBurnoutScore = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
    : 0;

  const recentActivities = assessments
    .slice(0, 5)
    .map((a) => {
      const u = users.find((usr) => usr.id === a.userId);
      return {
        user: u ? u.fullName : "Unknown User",
        action: `Completed assessment (Score: ${a.score} - ${a.level})`,
        time: formatRelativeTime(a.date),
      };
    });

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="mt-2 text-muted-foreground">Manage users, view analytics, and monitor platform health</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={loading ? "..." : String(totalUsers)} icon={Users} change="Real-time registered users" trend="down" />
          <StatCard title="Active Assessments" value={loading ? "..." : String(activeAssessments)} icon={FileText} change="Total logged surveys" trend="down" />
          <StatCard title="High Risk Users" value={loading ? "..." : String(highRiskCount)} icon={Activity} change="Avg burnout score >= 55" trend="up" />
          <StatCard title="Avg. Burnout Score" value={loading ? "..." : `${avgBurnoutScore}%`} icon={BarChart3} change="Combined platform average" trend="down" />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Manage Users"
              description="View and manage all registered users"
              icon={Users}
              to="/admin/users"
            />
            <QuickActionCard
              title="View Assessments"
              description="Browse all burnout assessments"
              icon={FileText}
              to="/admin/assessments"
            />
            <QuickActionCard
              title="Analytics Dashboard"
              description="Detailed platform analytics"
              icon={BarChart3}
              to="/admin/analytics"
            />
            <QuickActionCard
              title="Risk Monitoring"
              description="Monitor high-risk users"
              icon={Activity}
              to="/admin/risk"
            />
            <QuickActionCard
              title="System Settings"
              description="Configure platform settings"
              icon={Settings}
              to="/admin" // Redirect to admin home as a fallback for now
            />
            <QuickActionCard
              title="Access Control"
              description="Manage admin permissions"
              icon={Shield}
              to="/admin" // Redirect to admin home as a fallback for now
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Recent Activity</h2>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            {loading ? (
              <p className="text-muted-foreground text-center py-4">Loading activity...</p>
            ) : recentActivities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent activity found.</p>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-foreground">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ title, value, icon: Icon, change, trend = "up" }: { title: string; value: string; icon: any; change: string; trend?: "up" | "down" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <span className={`text-xs font-medium ${trend === "up" ? "text-destructive" : "text-green-600"}`}>
          {change}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, icon: Icon, to }: { title: string; description: string; icon: any; to: string }) {
  return (
    <Link to={to} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/50">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
