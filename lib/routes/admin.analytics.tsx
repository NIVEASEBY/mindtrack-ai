import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../../src/components/app-shell";
import { ArrowLeft, TrendingUp, Users, Activity, Calendar, BarChart3, PieChart } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
}) as any;

function AdminAnalytics() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Detailed platform analytics and user engagement metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Users" value="24" change="+12%" icon={Users} />
          <MetricCard title="Active This Week" value="18" change="+8%" icon={Activity} />
          <MetricCard title="Total Assessments" value="156" change="+15%" icon={BarChart3} />
          <MetricCard title="Avg. Session Duration" value="8m 32s" change="+5%" icon={Calendar} />
        </div>

        {/* Charts Section */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* User Growth Chart */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-foreground">User Growth Over Time</h3>
            <div className="h-64 rounded-lg bg-secondary/20 p-4">
              <div className="flex h-full items-end justify-between gap-2">
                {[
                  { label: "Jan", value: 5 },
                  { label: "Feb", value: 8 },
                  { label: "Mar", value: 12 },
                  { label: "Apr", value: 15 },
                  { label: "May", value: 19 },
                  { label: "Jun", value: 24 },
                ].map((data) => (
                  <div key={data.label} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t bg-primary transition-all hover:bg-primary/80"
                      style={{ height: `${(data.value / 24) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{data.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Level Distribution */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Risk Level Distribution</h3>
            <div className="space-y-4">
              {[
                { label: "Low Risk", count: 8, percentage: 33, color: "bg-green-500" },
                { label: "Moderate Risk", count: 10, percentage: 42, color: "bg-yellow-500" },
                { label: "High Risk", count: 4, percentage: 17, color: "bg-orange-500" },
                { label: "Severe Risk", count: 2, percentage: 8, color: "bg-red-500" },
              ].map((data) => (
                <div key={data.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-foreground">{data.label}</span>
                    <span className="text-muted-foreground">{data.count} users ({data.percentage}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className={`h-2 rounded-full ${data.color} transition-all`} style={{ width: `${data.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">72%</p>
                <p className="text-sm text-muted-foreground">Weekly Active Rate</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">6.5</p>
                <p className="text-sm text-muted-foreground">Avg. Assessments/User</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">42</p>
                <p className="text-sm text-muted-foreground">Avg. Burnout Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Institution Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Institution Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Institution</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Users</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Avg. Burnout</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">High Risk %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: "State University", users: 12, avgBurnout: 45, highRisk: 25 },
                  { name: "City College", users: 8, avgBurnout: 38, highRisk: 13 },
                  { name: "Tech Institute", users: 4, avgBurnout: 42, highRisk: 25 },
                ].map((inst) => (
                  <tr key={inst.name} className="hover:bg-secondary/20">
                    <td className="px-6 py-4 font-medium text-foreground">{inst.name}</td>
                    <td className="px-6 py-4 text-foreground">{inst.users}</td>
                    <td className="px-6 py-4 text-foreground">{inst.avgBurnout}</td>
                    <td className="px-6 py-4">
                      <span className={inst.highRisk > 20 ? "text-red-600" : "text-green-600"}>{inst.highRisk}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({ title, value, change, icon: Icon }: { title: string; value: string; change: string; icon: any }) {
  const isPositive = change.includes("+");
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <span className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
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
