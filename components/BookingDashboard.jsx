"use client";

import { useEffect, useMemo, useState } from "react";
import { getBookings, removeBooking, updateBooking } from "@/lib/bookings";
import { getSignInGreeting } from "@/lib/supabase/greeting";
import AdminSignOut from "@/components/AdminSignOut";
import CustomerSignOut from "@/components/CustomerSignOut";
import { IconArrowUpRight, IconClose, IconSearch, IconSpark } from "@/components/Icons";

const STATUS_OPTIONS = ["pending", "confirmed", "assigned", "completed", "cancelled"];
const EMPTY_FILTER = "all";
const currency = (amount) => new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(amount);

// Charge types offered when preparing a fare. They are listed without values so the
// booking desk can fill in only the lines that apply and share the breakdown.
const FARE_LINE_TYPES = [
  "Base fare",
  "Distance (per km)",
  "Additional hours",
  "Waiting time",
  "Airport / station fee",
  "Night surcharge",
  "Tolls & parking",
  "Additional stop",
  "Child seat",
  "Discount",
];

function formatPickup(booking) {
  const date = booking.date ? new Date(`${booking.date}T${booking.time || "00:00"}`) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: booking.time ? "short" : undefined }).format(date)
    : "Date to be confirmed";
}

function getQuoteVatRate(booking) {
  const vatLine = booking.quoteBreakdown.find((line) => /^VAT \(([\d.]+)%\)$/.test(line.label));
  const match = vatLine?.label.match(/^VAT \(([\d.]+)%\)$/);
  return match ? Number(match[1]) : 10;
}

function FareEditor({ booking, onCancel, onSubmit, saving }) {
  const [lines, setLines] = useState(() => {
    const existing = (booking.quoteBreakdown || []).filter((line) => !/^VAT\s*\(/i.test(line.label));
    const typed = FARE_LINE_TYPES.map((label) => {
      const match = existing.find((line) => line.label === label);
      return { label, amount: match ? String(match.amount) : "" };
    });
    const others = existing
      .filter((line) => !FARE_LINE_TYPES.includes(line.label))
      .map((line) => ({ label: line.label, amount: String(line.amount) }));
    return [...typed, ...others];
  });
  const [vatRate, setVatRate] = useState(String(getQuoteVatRate(booking)));
  const [message, setMessage] = useState(booking.quoteMessage || "");

  const updateLine = (index, field, value) => setLines((current) =>
    current.map((line, position) => position === index ? { ...line, [field]: value } : line));

  const filled = lines
    .filter((line) => line.amount !== "" && Number.isFinite(Number(line.amount)) && line.label.trim())
    .map((line) => ({ label: line.label.trim(), amount: Math.round(Number(line.amount) * 100) / 100 }));
  const subtotal = Math.round(filled.reduce((sum, line) => sum + line.amount, 0) * 100) / 100;
  const rate = Number(vatRate) || 0;
  const vat = Math.round(subtotal * rate) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;

  const submit = (event) => {
    event.preventDefault();
    if (!filled.length) return;
    onSubmit({ breakdown: [...filled, { label: `VAT (${rate}%)`, amount: vat }], subtotal, vat, total, message: message.trim() });
  };

  return (
    <form className="fare-editor" onSubmit={submit}>
      <p className="fare-editor__hint">Fill in the amounts that apply. Empty lines stay out of the breakdown sent to the customer.</p>
      <div className="fare-editor__lines">
        {lines.map((line, index) => (
          <div className="fare-editor__line" key={index}>
            <input
              className="fare-editor__label"
              value={line.label}
              onChange={(event) => updateLine(index, "label", event.target.value)}
              aria-label={`Line ${index + 1} description`}
            />
            <input
              className="fare-editor__amount"
              type="number"
              min="0"
              step="0.01"
              value={line.amount}
              onChange={(event) => updateLine(index, "amount", event.target.value)}
              placeholder="0.00"
              aria-label={`Line ${index + 1} amount (EUR)`}
            />
          </div>
        ))}
      </div>
      <div className="fare-editor__totals">
        <label>VAT (%)<input type="number" min="0" step="0.01" value={vatRate} onChange={(event) => setVatRate(event.target.value)} /></label>
        <p><span>Subtotal</span><strong>{currency(subtotal)}</strong></p>
        <p><span>VAT</span><strong>{currency(vat)}</strong></p>
        <p className="fare-editor__total"><span>Total</span><strong>{currency(total)}</strong></p>
      </div>
      <label className="fare-editor__message">Message to customer<textarea rows="2" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Optional note shown with the breakdown" /></label>
      {!filled.length && <p className="fare-editor__error" role="alert">Add at least one amount before sending.</p>}
      <div className="fare-editor__actions">
        <button className="btn btn--solid" type="submit" disabled={saving || !filled.length}>{saving ? "Sending..." : "Send fare to customer"}</button>
        <button className="btn btn--ghost" type="button" onClick={onCancel}>Discard</button>
      </div>
    </form>
  );
}

export default function BookingDashboard({ admin = false }) {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [quoteEditing, setQuoteEditing] = useState(null);
  const [quoteSaving, setQuoteSaving] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const rows = await getBookings();
        if (active) {
          setBookings(rows);
          setError("");
        }
      } catch {
        if (active) setError("Unable to load bookings. Please refresh and try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    refresh();
    const params = new URLSearchParams(window.location.search);
    const created = params.get("created");
    if (params.get("signedIn") === "1") {
      getSignInGreeting(admin ? "admin" : "customer")
        .then((greeting) => { if (active) setNotice(greeting); })
        .catch(() => { if (active) setNotice("Welcome! You are signed in as a customer."); });
    }
    if (created) setNotice(`Request ${created} received.`);
    return () => { active = false; };
  }, [admin]);

  const visibleBookings = useMemo(() => bookings.filter((booking) => {
    const matchesStatus = filter === EMPTY_FILTER || booking.status === filter;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [booking.reference, booking.name, booking.email, booking.pickup, booking.dropoff]
      .some((value) => value?.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  }), [bookings, filter, search]);

  const counts = useMemo(() => STATUS_OPTIONS.reduce((all, status) => {
    all[status] = bookings.filter((booking) => booking.status === status).length;
    return all;
  }, {}), [bookings]);

  const changeStatus = async (booking, status) => {
    setError("");
    try {
      const updated = await updateBooking(booking.id, { status });
      setBookings((current) => current.map((item) => item.id === booking.id ? updated : item));
      setNotice(`${booking.reference} moved to ${status}.`);
    } catch {
      setError(`Unable to update ${booking.reference}. Please try again.`);
    }
  };

  const changePayment = async (booking) => {
    const next = booking.paymentStatus === "paid" ? "unpaid" : "paid";
    setError("");
    try {
      const updated = await updateBooking(booking.id, { paymentStatus: next });
      setBookings((current) => current.map((item) => item.id === booking.id ? updated : item));
      setNotice(`${booking.reference} payment marked ${next}.`);
    } catch {
      setError(`Unable to update payment for ${booking.reference}. Please try again.`);
    }
  };

  const copyReference = async (booking) => {
    setError("");
    try {
      await navigator.clipboard.writeText(booking.reference);
      setNotice(`${booking.reference} copied to the clipboard.`);
    } catch {
      setError("Unable to copy the reference. Please copy it manually.");
    }
  };

  const saveQuote = async (booking, quote) => {
    setError("");
    setQuoteSaving(booking.id);
    try {
      const updated = await updateBooking(booking.id, {
        subtotal: quote.subtotal,
        vat: quote.vat,
        total: quote.total,
        quoteStatus: "sent",
        quoteBreakdown: quote.breakdown,
        quoteMessage: quote.message,
        quotedAt: new Date().toISOString(),
      });
      setBookings((current) => current.map((item) => item.id === booking.id ? updated : item));
      setQuoteEditing(null);
      setNotice(`Fare sent to ${booking.reference}'s customer account.`);
    } catch {
      setError(`Unable to send a fare for ${booking.reference}. Please try again.`);
    } finally {
      setQuoteSaving("");
    }
  };

  const acceptQuote = async (booking) => {
    setError("");
    try {
      const updated = await updateBooking(booking.id, { quoteStatus: "accepted" });
      setBookings((current) => current.map((item) => item.id === booking.id ? updated : item));
      setNotice(`Fare accepted for ${booking.reference}.`);
    } catch {
      setError(`Unable to accept the fare for ${booking.reference}. Please try again.`);
    }
  };

  const deleteBooking = async (booking) => {
    if (!window.confirm(`Remove booking ${booking.reference}? This cannot be undone.`)) return;
    setError("");
    try {
      await removeBooking(booking.id);
      setBookings((current) => current.filter((item) => item.id !== booking.id));
      setNotice(`${booking.reference} removed.`);
      if (editing === booking.id) setEditing(null);
      if (quoteEditing === booking.id) setQuoteEditing(null);
    } catch {
      setError(`Unable to remove ${booking.reference}. Please try again.`);
    }
  };

  const saveEdit = async (event, booking) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    setError("");
    try {
      const updated = await updateBooking(booking.id, { ...data, passengers: Number(data.passengers), luggage: Number(data.luggage) });
      setBookings((current) => current.map((item) => item.id === booking.id ? updated : item));
      setEditing(null);
      setNotice(`${booking.reference} updated.`);
    } catch {
      setError(`Unable to update ${booking.reference}. Please try again.`);
    }
  };

  const paymentLabel = (status) => status === "paid" ? "Paid" : status === "refunded" ? "Refunded" : "Unpaid";

  return (
    <section className="workspace">
      <header className="workspace__header">
        <div>
          <p className="workspace__eyebrow">EU LUXURY · {admin ? "OPERATIONS" : "YOUR JOURNEYS"}</p>
          <h1>{admin ? "Booking desk" : "Your bookings"}</h1>
          <p className="workspace__intro">{admin ? "Review requests, prepare fares, and keep every journey in hand." : "Every detail of your chauffeur journeys, in one considered place."}</p>
        </div>
        <div className="workspace__header-actions">
          {admin && <AdminSignOut />}
          {!admin && <CustomerSignOut />}
          <a className="btn btn--solid workspace__new" href={admin ? "/" : "/book"}>{admin ? "View website" : "Request a journey"}<IconArrowUpRight /></a>
        </div>
      </header>

      <div className="workspace__metrics" aria-label="Booking totals">
        <div><span>All journeys</span><strong>{bookings.length}</strong></div>
        {STATUS_OPTIONS.slice(0, 4).map((status) => (
          <div key={status}><span>{status}</span><strong>{counts[status] || 0}</strong></div>
        ))}
      </div>

      <div className="workspace__toolbar">
        <label className="workspace__search"><span className="sr-only">Search bookings</span><IconSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, route or reference" /></label>
        <label className="workspace__filter"><span className="sr-only">Filter by status</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option>{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label>
      </div>

      {notice && <p className="workspace__notice" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><IconClose /></button></p>}
      {error && <p className="admin-login__error" role="alert">{error}</p>}

      <div className="booking-list">
        {loading ? <div className="workspace__empty"><p>Loading bookings...</p></div> : visibleBookings.length ? visibleBookings.map((booking) => (
          <article className="desk-card" key={booking.id}>
            <header className="desk-card__head">
              <div className="desk-card__tags">
                <span className="booking-card__reference">{booking.reference}</span>
                <span className={`booking-status booking-status--${booking.status}`}>{booking.status}</span>
                <span className={`booking-payment booking-payment--${booking.paymentStatus}`}>{paymentLabel(booking.paymentStatus)}</span>
              </div>
              <span className="desk-card__date">{formatPickup(booking)}</span>
            </header>

            <div className="desk-card__body">
              <div className="desk-card__col desk-card__col--journey">
                <div className="booking-card__route">
                  <div><span className="route-dot route-dot--start"/><div><small>Pick-up</small><strong>{booking.pickup}</strong></div></div>
                  <span className="route-line" aria-hidden="true" />
                  <div><span className="route-dot route-dot--end"/><div><small>Destination</small><strong>{booking.dropoff}</strong></div></div>
                </div>
                <ul className="desk-facts">
                  <li><span>Guest</span><strong>{booking.name}</strong></li>
                  <li><span>Email</span><strong>{booking.email}</strong></li>
                  <li><span>Phone</span><strong>{booking.phone || "Not provided"}</strong></li>
                  <li><span>Guests</span><strong>{booking.passengers} pax · {booking.luggage} bags</strong></li>
                  <li><span>Service</span><strong>{(booking.service || "transfer").replace("_", " ")}</strong></li>
                  <li><span>Payment</span><strong>{booking.payment}</strong></li>
                  {booking.distanceKm != null && <li><span>Distance</span><strong>{booking.distanceKm} km</strong></li>}
                  {booking.tourPackageName && <li><span>Package</span><strong>{booking.tourPackageName}</strong></li>}
                  {booking.notes && <li><span>Notes</span><strong>{booking.notes}</strong></li>}
                </ul>
                {booking.specialRequest && <p className="desk-card__request"><strong>Customer request</strong>{booking.specialRequest}</p>}
                {editing === booking.id && (
                  <form className="booking-edit" onSubmit={(event) => saveEdit(event, booking)}>
                    <label>Name<input name="name" defaultValue={booking.name} required /></label>
                    <label>Email<input name="email" type="email" defaultValue={booking.email} required /></label>
                    <label>Phone<input name="phone" defaultValue={booking.phone} /></label>
                    <label>Pick-up<input name="pickup" defaultValue={booking.pickup} required /></label>
                    <label>Destination<input name="dropoff" defaultValue={booking.dropoff} required /></label>
                    <label>Date<input name="date" type="date" defaultValue={booking.date} required /></label>
                    <label>Time<input name="time" type="time" defaultValue={booking.time} required /></label>
                    <label>Passengers<input name="passengers" type="number" min="1" max="7" defaultValue={booking.passengers} required /></label>
                    <label>Luggage<input name="luggage" type="number" min="0" max="10" defaultValue={booking.luggage || 0} /></label>
                    <label className="booking-edit__wide">Notes<textarea name="notes" rows="2" defaultValue={booking.notes || ""} /></label>
                    <div className="booking-edit__actions"><button className="btn btn--solid" type="submit">Save changes</button><button className="btn btn--ghost" type="button" onClick={() => setEditing(null)}>Discard</button></div>
                  </form>
                )}
              </div>

              <aside className="desk-card__col desk-card__col--fare">
                {booking.quoteStatus !== "none" ? (
                  <div className="desk-fare">
                    <div className="desk-fare__lines">
                      {booking.quoteBreakdown.map((line, index) => (
                        <p key={`${line.label}-${index}`}><span>{line.label}</span><strong>{currency(Number(line.amount))}</strong></p>
                      ))}
                    </div>
                    <p className="desk-fare__total"><span>Total</span><strong>{currency(booking.total)}</strong></p>
                    {booking.quoteMessage && <p className="desk-fare__message">{booking.quoteMessage}</p>}
                    {!admin && booking.quoteStatus === "sent" && <button className="btn btn--solid" type="button" onClick={() => acceptQuote(booking)}>Accept this fare</button>}
                  </div>
                ) : (
                  <p className="desk-fare__empty">No fare prepared yet.</p>
                )}
                {admin && quoteEditing === booking.id ? (
                  <FareEditor
                    booking={booking}
                    saving={quoteSaving === booking.id}
                    onCancel={() => setQuoteEditing(null)}
                    onSubmit={(quote) => saveQuote(booking, quote)}
                  />
                ) : admin && (
                  <button className="booking-action booking-action--primary desk-fare__action" type="button" onClick={() => setQuoteEditing(booking.id)}>
                    {booking.quoteStatus === "none" ? "Prepare fare" : "Revise fare"}
                  </button>
                )}
              </aside>
            </div>

            <footer className="desk-card__actions">
              {admin ? (
                <>
                  {booking.status === "pending" && <button className="booking-action booking-action--accept" type="button" onClick={() => changeStatus(booking, "confirmed")}>Confirm booking</button>}
                  {["pending", "confirmed"].includes(booking.status) && <button className="booking-action booking-action--accept" type="button" onClick={() => changeStatus(booking, "assigned")}>Assign chauffeur</button>}
                  {["pending", "confirmed", "assigned"].includes(booking.status) && <button className="booking-action" type="button" onClick={() => changeStatus(booking, "completed")}>Mark completed</button>}
                  {["pending", "confirmed", "assigned"].includes(booking.status) && <button className="booking-action booking-action--danger" type="button" onClick={() => changeStatus(booking, "cancelled")}>Cancel booking</button>}
                  {["completed", "cancelled"].includes(booking.status) && <button className="booking-action" type="button" onClick={() => changeStatus(booking, "pending")}>Reopen booking</button>}
                  <button className={`booking-action${booking.paymentStatus === "paid" ? "" : " booking-action--primary"}`} type="button" onClick={() => changePayment(booking)}>{booking.paymentStatus === "paid" ? "Mark as unpaid" : "Mark as paid"}</button>
                  {!["completed", "cancelled"].includes(booking.status) && <button className="booking-action" type="button" onClick={() => setEditing(booking.id)}>Edit details</button>}
                  {booking.email && <a className="booking-action booking-action--muted" href={`mailto:${booking.email}`}>Email customer</a>}
                  {booking.phone && <a className="booking-action booking-action--muted" href={`tel:${booking.phone}`}>Call customer</a>}
                  <button className="booking-action booking-action--muted" type="button" onClick={() => copyReference(booking)}>Copy reference</button>
                  <button className="booking-action booking-action--danger" type="button" onClick={() => deleteBooking(booking)}>Remove</button>
                </>
              ) : (
                !["completed", "cancelled"].includes(booking.status) && <button className="booking-action booking-action--danger" type="button" onClick={() => changeStatus(booking, "cancelled")}>Cancel journey</button>
              )}
            </footer>
          </article>
        )) : (
          <div className="workspace__empty"><span aria-hidden="true"><IconSpark /></span><h2>{bookings.length ? "No journeys match" : "Your next journey starts here"}</h2><p>{bookings.length ? "Try a different search or status." : admin ? "New customer requests will appear here." : "Your confirmed and upcoming journeys will appear here."}</p>{!bookings.length && !admin && <a className="btn btn--solid" href="/book">Plan a journey</a>}</div>
        )}
      </div>
      <p className="workspace__footnote">{admin ? "Operations workspace · Booking records are kept up to date in real time." : "Your booking requests are securely stored in your account. Need to change a completed journey? Contact our concierge team."}</p>
    </section>
  );
}
