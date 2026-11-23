import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function mapBooking(row) {
  const pickup = new Date(row.pickup_at);
  return {
    id: row.id,
    reference: row.reference,
    customerId: row.customer_id,
    name: row.guest_name || "",
    email: row.guest_email || "",
    phone: row.guest_phone || "",
    service: row.service_type,
    vehicleName: row.vehicle_name || "",
    extras: row.extras || [],
    payment: row.payment_method,
    paymentStatus: row.payment_status,
    pickup: row.pickup_address,
    dropoff: row.dropoff_address,
    date: Number.isNaN(pickup.getTime()) ? "" : [
      pickup.getFullYear(),
      String(pickup.getMonth() + 1).padStart(2, "0"),
      String(pickup.getDate()).padStart(2, "0"),
    ].join("-"),
    time: Number.isNaN(pickup.getTime()) ? "" : [
      String(pickup.getHours()).padStart(2, "0"),
      String(pickup.getMinutes()).padStart(2, "0"),
    ].join(":"),
    passengers: row.passengers,
    luggage: row.luggage,
    flight: row.flight_number || "",
    notes: row.notes || "",
    status: row.status,
    createdAt: row.created_at,
  };
}

function pickupTimestamp(date, time) {
  const pickup = new Date(`${date}T${time || "00:00"}`);
  if (Number.isNaN(pickup.getTime())) {
    throw new Error("Choose a valid pick-up date and time.");
  }
  return pickup.toISOString();
}

export async function getBookings() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapBooking);
}

export async function createBooking(details) {
  const supabase = createSupabaseBrowserClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Sign in to your customer account before booking.");

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: user.id,
      guest_name: details.name,
      guest_email: details.email,
      guest_phone: details.phone || null,
      service_type: details.service === "tour" ? "daily" : details.service,
      vehicle_name: details.vehicleName || null,
      extras: details.extrasDetails || [],
      payment_method: ["bank", "card"].includes(details.payment) ? details.payment : "pay-later",
      pickup_address: details.pickup,
      dropoff_address: details.dropoff,
      pickup_at: pickupTimestamp(details.date, details.time),
      passengers: Number(details.passengers),
      luggage: Number(details.luggage),
      flight_number: details.flight || null,
      notes: details.notes || null,
      payment_status: "unpaid",
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapBooking(data);
}

export async function updateBooking(id, changes) {
  const supabase = createSupabaseBrowserClient();
  const payload = {};
  if (changes.status !== undefined) payload.status = changes.status;
  if (changes.name !== undefined) payload.guest_name = changes.name;
  if (changes.email !== undefined) payload.guest_email = changes.email;
  if (changes.phone !== undefined) payload.guest_phone = changes.phone || null;
  if (changes.pickup !== undefined) payload.pickup_address = changes.pickup;
  if (changes.dropoff !== undefined) payload.dropoff_address = changes.dropoff;
  if (changes.date !== undefined || changes.time !== undefined) {
    let current = changes;
    if (!changes.date || !changes.time) {
      const { data, error } = await supabase.from("bookings").select("pickup_at").eq("id", id).single();
      if (error) throw error;
      current = data;
    }
    if (!current) throw new Error("Unable to load the booking pick-up time.");
    const pickup = current.pickup_at ? new Date(current.pickup_at) : null;
    const date = changes.date || (pickup && [
      pickup.getFullYear(),
      String(pickup.getMonth() + 1).padStart(2, "0"),
      String(pickup.getDate()).padStart(2, "0"),
    ].join("-"));
    const time = changes.time || (pickup && [
      String(pickup.getHours()).padStart(2, "0"),
      String(pickup.getMinutes()).padStart(2, "0"),
    ].join(":"));
    payload.pickup_at = pickupTimestamp(date, time);
  }
  if (changes.passengers !== undefined) payload.passengers = changes.passengers;
  if (changes.luggage !== undefined) payload.luggage = changes.luggage;
  if (changes.notes !== undefined) payload.notes = changes.notes || null;

  const { data, error } = await supabase
    .from("bookings")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapBooking(data);
}

export async function removeBooking(id) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
}
