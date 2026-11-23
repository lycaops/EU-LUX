import AdminNavigation from "@/components/AdminNavigation";
import { requireAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminWorkspaceLayout({ children }) {
  await requireAdmin();
  return (
    <>
      <AdminNavigation />
      {children}
    </>
  );
}
