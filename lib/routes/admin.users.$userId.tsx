import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../../src/components/app-shell";
import { ArrowLeft, Mail, Calendar, Building, GraduationCap, Activity, FileText, Clock, TrendingUp, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/users/$userId")({
  component: UserDetail,
}) as any;

function UserDetail() {
  // Mock user data - in production, this would be fetched based on userId
  const user = {
    id: "1",
    fullName: "John Doe",
    email: "john.doe@university.edu",
    studentId: "STU001",
    institution: "State University",
    joinedDate: "2024-01-15",
    lastActive: "2 hours ago",
    assessmentsCount: 5,
    avgBurnoutScore: 42,
    riskLevel: "Moderate",
  };

  const assessments = [
    {
      id: "1",
      date: "2024-01-20",
      score: 42,
      level: "Moderate",
      factors: [
        { label: "Sleep 6h (below recommended)", contribution: 4 },
        { label: "Stress level 7/10", contribution: 21 },
        { label: "Heavy study load (7h/day)", contribution: 3 },
      ],
    },
    {
      id: "2",
      date: "2024-01-18",
      score: 38,
      level: "Moderate",
      factors: [
        { label: "Sleep 6.5h (below recommended)", contribution: 2 },
        { label: "Stress level 6/10", contribution: 18 },
        { label: "3 assignments due", contribution: 8 },
      ],
    },
    {
      id: "3",
      date: "2024-01-15",
      score: 45,
      level: "Moderate",
      factors: [
        { label: "Sleep 5.5h (below recommended)", contribution: 6 },
        { label: "Stress level 8/10", contribution: 24 },
        { label: "Heavy study load (8h/day)", contribution: 6 },
      ],
    },
  ];

  const checkIns = [
    { date: "2024-01-20", mood: 4 },
    { date: "2024-01-18", mood: 3 },
    { date: "2024-01-15", mood: 3 },
  ];

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

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (mood === 3) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 4) return "Good";
    if (mood === 3) return "Okay";
    return "Poor";
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-foreground">User Details</h1>
          <p className="mt-2 text-muted-foreground">View detailed information and activity history</p>
        </div>

        {/* User Profile Card */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold text-primary">{user.fullName.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{user.fullName}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Student ID</p>
                    <p className="text-sm font-medium text-foreground">{user.studentId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Institution</p>
                    <p className="text-sm font-medium text-foreground">{user.institution}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-medium text-foreground">{user.joinedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Last Active</p>
                    <p className="text-sm font-medium text-foreground">{user.lastActive}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:text-right">
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getRiskLevelColor(user.riskLevel)}`}>
                {user.riskLevel} Risk
              </span>
              <p className="text-sm text-muted-foreground">Avg Burnout Score: {user.avgBurnoutScore}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{user.assessmentsCount}</p>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{checkIns.length}</p>
                <p className="text-sm text-muted-foreground">Check-ins</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{user.avgBurnoutScore}</p>
                <p className="text-sm text-muted-foreground">Avg Burnout Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment History */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-foreground">Assessment History</h3>
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{assessment.date}</span>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRiskLevelColor(assessment.level)}`}>
                        {assessment.level}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {assessment.factors.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{factor.label}</span>
                          <span className="font-medium text-foreground">+{factor.contribution}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-foreground">{assessment.score}</p>
                    <p className="text-sm text-muted-foreground">Burnout Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Check-in History */}
        <div>
          <h3 className="mb-4 text-xl font-semibold text-foreground">Check-in History</h3>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Mood</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {checkIns.map((checkIn, index) => (
                  <tr key={index} className="hover:bg-secondary/20">
                    <td className="px-6 py-4 text-sm text-foreground">{checkIn.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getMoodColor(checkIn.mood)}`}>
                        {getMoodLabel(checkIn.mood)} ({checkIn.mood}/5)
                      </span>
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
