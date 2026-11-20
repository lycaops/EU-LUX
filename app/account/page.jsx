import BookingDashboard from "@/components/BookingDashboard";
import { requireCustomer } from "@/lib/supabase/customer";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  await requireCustomer();
  return <BookingDashboard />;
}