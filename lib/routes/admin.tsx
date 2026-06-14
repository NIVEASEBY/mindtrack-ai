import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminGuard } from "../../src/components/ui/admin-guard";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
}) as any;

function AdminLayout() {
  return (
    <AdminGuard>
      <Outlet />
    </AdminGuard>
  );
}
