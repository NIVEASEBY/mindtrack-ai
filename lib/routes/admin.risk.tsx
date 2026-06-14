import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../../src/components/app-shell";
import { ArrowLeft, AlertTriangle, Shield, Mail, Send, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllUsers, getAssessments } from "../../lib/api/store-supabase";

export const Route = createFileRoute("/admin/risk")({
  component: AdminRisk,
}) as any;

function AdminRisk() {
  const [highRiskUsers, setHighRiskUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHighRiskUsers();
  }, []);

  async function loadHighRiskUsers() {
    try {
      const allUsers = await getAllUsers();
      const usersWithRisk = await Promise.all(
        allUsers.map(async (user) => {
          const assessments = await getAssessments(user.id);
          const latestAssessment = assessments[0];
          if (!latestAssessment) return null;
          
          const avgScore = assessments.length > 0
            ? Math.round(assessments.reduce((sum: number, a: any) => sum + a.score, 0) / assessments.length)
            : 0;
          
          const riskLevel = avgScore < 30 ? "Low" : avgScore < 55 ? "Moderate" : avgScore < 75 ? "High" : "Severe";
          
          if (riskLevel === "High" || riskLevel === "Severe") {
            return {
              ...user,
              riskLevel,
              burnoutScore: avgScore,
              lastAssessment: latestAssessment.date,
              factors: latestAssessment.factors.map((f: any) => f.label),
              trend: "stable", // Would need historical data to calculate trend
            };
          }
          return null;
        })
      );
      
      setHighRiskUsers(usersWithRisk.filter((u): u is any => u !== null));
    } catch (error) {
      console.error('Error loading high-risk users:', error);
    } finally {
      setLoading(false);
    }
  }

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

  const getTrendIcon = (trend: string) => {
    if (trend === "increasing") {
      return <TrendingUp className="h-4 w-4 text-red-600" />;
    }
    return <div className="h-4 w-4 rounded-full bg-yellow-500" />;
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-foreground">Risk Monitoring</h1>
          <p className="mt-2 text-muted-foreground">Monitor users with high burnout risk and take action</p>
        </div>

        {/* Alert Banner */}
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">3 Users at High Risk</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                These users have burnout scores above 60 and may need immediate attention. Consider reaching out or escalating to counseling services.
              </p>
            </div>
          </div>
        </div>

        {/* High Risk Users List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-muted-foreground">Loading high-risk users...</p>
            </div>
          ) : highRiskUsers.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-muted-foreground">No high-risk users found</p>
            </div>
          ) : (
            highRiskUsers.map((user) => (
              <div key={user.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <h3 className="text-xl font-semibold text-foreground">{user.fullName}</h3>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRiskLevelColor(user.riskLevel)}`}>
                        {user.riskLevel} Risk
                      </span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(user.trend)}
                        <span className="text-sm text-muted-foreground capitalize">{user.trend} trend</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last assessment: {user.lastAssessment}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium text-foreground">Key Risk Factors:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.factors.map((factor: any, index: number) => (
                          <span key={index} className="inline-flex rounded-lg border border-border bg-secondary/40 px-3 py-1 text-xs text-foreground">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 lg:text-right">
                    <div className="rounded-xl border border-border bg-secondary/40 p-4">
                      <p className="text-3xl font-bold text-foreground">{user.burnoutScore}</p>
                      <p className="text-sm text-muted-foreground">Burnout Score</p>
                    </div>
                    <div className="flex gap-2 lg:justify-end">
                      <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/60">
                        <Send className="h-4 w-4" />
                        Send Alert
                      </button>
                      <Link
                        to="/admin/users/$userId"
                        params={{ userId: user.id }}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/60"
                      >
                        <Shield className="h-4 w-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Risk Summary */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Risk Summary</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Users Needing Attention</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="text-2xl font-bold text-red-600">1</p>
              <p className="text-sm text-muted-foreground">Severe Risk</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="text-2xl font-bold text-orange-600">2</p>
              <p className="text-sm text-muted-foreground">High Risk</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="text-2xl font-bold text-foreground">70.3</p>
              <p className="text-sm text-muted-foreground">Avg. High Risk Score</p>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Recommended Actions</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-4">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Send wellness check emails to high-risk users</p>
                <p className="text-sm text-muted-foreground">Automated outreach to users with scores above 60</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-4">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Escalate severe cases to counseling services</p>
                <p className="text-sm text-muted-foreground">Users with scores above 75 should be referred to professional support</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-4">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Schedule follow-up assessments</p>
                <p className="text-sm text-muted-foreground">Reassess high-risk users weekly to monitor progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
