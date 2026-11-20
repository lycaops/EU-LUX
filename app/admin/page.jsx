import BookingDashboard from "@/components/BookingDashboard";
import { requireAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  return <BookingDashboard admin />;
}