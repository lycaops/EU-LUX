const CONFIG_KEY = "eu-lux-booking-config-v1";

export const DEFAULT_BOOKING_CONFIG = {
  services: [
    { id: "transfer", name: "Transfer", note: "From one place to another", enabled: true },
    { id: "hourly", name: "Hourly", note: "Your chauffeur by the hour", enabled: true },
    { id: "tour", name: "Tour", note: "A private journey at your pace", enabled: true },
  ],
  vehicles: [
    { id: "v250", name: "Mercedes-Benz V-Class V250", passengers: 7, luggage: 7, image: "/n_v250.webp", note: "Executive comfort", enabled: true },
  ],
  extras: [
    { id: "child-seat", name: "Child Seat", price: "20", enabled: true },
    { id: "greeting", name: "Greetings Package", price: "35", enabled: true },
    { id: "refreshments", name: "Water & refreshments", price: "18", enabled: true },
    { id: "wifi", name: "Onboard Wi-Fi", price: "15", enabled: true },
  ],
  payments: [
    { id: "later", name: "Book and pay later", note: "Confirm now, pay before the journey", enabled: true },
    { id: "bank", name: "Bank transfer", note: "Receive transfer details after confirmation", enabled: true },
    { id: "card", name: "Card", note: "Secure card payment", enabled: true },
  ],
};

export function getBookingConfig() {
  if (typeof window === "undefined") return DEFAULT_BOOKING_CONFIG;
  try {
    return { ...DEFAULT_BOOKING_CONFIG, ...JSON.parse(window.localStorage.getItem(CONFIG_KEY) || "{}") };
  } catch {
    return DEFAULT_BOOKING_CONFIG;
  }
}

export function saveBookingConfig(config) {
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event("booking-config-updated"));
}
