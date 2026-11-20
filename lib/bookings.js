const STORAGE_KEY = "eu-lux-bookings-v1";

export function getBookings() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  window.dispatchEvent(new Event("bookings-updated"));
}

export function createBooking(details) {
  const booking = {
    ...details,
    id: crypto.randomUUID(),
    reference: `EUL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  saveBookings([booking, ...getBookings()]);
  return booking;
}

export function updateBooking(id, changes) {
  saveBookings(getBookings().map((booking) => booking.id === id ? { ...booking, ...changes } : booking));
}

export function removeBooking(id) {
  saveBookings(getBookings().filter((booking) => booking.id !== id));
}