"use client";

import { useEffect, useMemo, useState } from "react";
import { getBookings, removeBooking, updateBooking } from "@/lib/bookings";
import { getBookingConfig, saveBookingConfig } from "@/lib/bookingConfig";
import AdminSignOut from "@/components/AdminSignOut";
import CustomerSignOut from "@/components/CustomerSignOut";

const STATUS_OPTIONS = ["pending", "confirmed", "assigned", "completed", "cancelled"];
const EMPTY_FILTER = "all";

function formatPickup(booking) {
  const date = booking.date ? new Date(`${booking.date}T${booking.time || "00:00"}`) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: booking.time ? "short" : undefined }).format(date)
    : "Date to be confirmed";
}

export default function BookingDashboard({ admin = false }) {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingConfig, setBookingConfig] = useState(() => getBookingConfig());

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
      setNotice(admin
        ? "Signed in successfully. You are in the administrator dashboard."
        : "Signed in successfully.");
    }
    if (created) setNotice(`Request ${created} received.`);
    return () => { active = false; };
  }, [admin]);

  const updateConfigItem = (group, id, field, value) => {
    setBookingConfig((current) => ({
      ...current,
      [group]: current[group].map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const saveConfig = () => {
    saveBookingConfig(bookingConfig);
    setNotice("Booking options updated. The new choices are available at /book.");
  };

  const removeConfigItem = (group, id) => {
    setBookingConfig((current) => ({ ...current, [group]: current[group].filter((item) => item.id !== id) }));
  };

  const addConfigItem = (group) => {
    const suffix = Date.now().toString(36);
    setBookingConfig((current) => ({
      ...current,
      [group]: [...current[group], group === "vehicles"
        ? { id: `vehicle-${suffix}`, name: "New vehicle", passengers: 7, luggage: 7, image: "/scenes/ext_r.webp", note: "Available fleet", enabled: true }
        : group === "extras"
          ? { id: `extra-${suffix}`, name: "New extra", price: "10", enabled: true }
          : group === "payments"
            ? { id: `payment-${suffix}`, name: "New payment", note: "Payment instructions", enabled: true }
            : { id: `service-${suffix}`, name: "New service", note: "Service description", enabled: true }],
    }));
  };

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

  const deleteBooking = async (booking) => {
    if (!window.confirm(`Remove booking ${booking.reference}? This cannot be undone.`)) return;
    setError("");
    try {
      await removeBooking(booking.id);
      setBookings((current) => current.filter((item) => item.id !== booking.id));
      setNotice(`${booking.reference} removed.`);
      if (editing === booking.id) setEditing(null);
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

  return (
    <section className="workspace">
      <header className="workspace__header">
        <div>
          <p className="workspace__eyebrow">EU LUXURY · {admin ? "OPERATIONS" : "YOUR JOURNEYS"}</p>
          <h1>{admin ? "Booking desk" : "Your bookings"}</h1>
          <p className="workspace__intro">{admin ? "Review requests, coordinate service, and keep every journey in hand." : "Every detail of your chauffeur journeys, in one considered place."}</p>
        </div>
        <div className="workspace__header-actions">
          {admin && <AdminSignOut />}
          {!admin && <CustomerSignOut />}
          <a className="btn btn--solid workspace__new" href={admin ? "/" : "/book"}>{admin ? "View website" : "Request a journey"} <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <div className="workspace__metrics" aria-label="Booking totals">
        <div><span>All journeys</span><strong>{bookings.length}</strong></div>
        {STATUS_OPTIONS.slice(0, 4).map((status) => (
          <div key={status}><span>{status}</span><strong>{counts[status] || 0}</strong></div>
        ))}
      </div>

      <div className="workspace__toolbar">
        <label className="workspace__search"><span className="sr-only">Search bookings</span><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, route or reference" /></label>
        <label className="workspace__filter"><span className="sr-only">Filter by status</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option>{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label>
      </div>

      {admin && (
        <details className="admin-config">
          <summary><span>Booking configuration</span><small>Services · Fleet · Extras · Payments</small></summary>
          <div className="admin-config__grid">
            {["services", "vehicles", "extras", "payments"].map((group) => (
              <section className="admin-config__group" key={group}>
                <header><h2>{group[0].toUpperCase() + group.slice(1)}</h2><button type="button" onClick={() => addConfigItem(group)}>+ Add</button></header>
                <div className="admin-config__items">
                  {bookingConfig[group].map((item) => (
                    <article key={item.id}>
                      <label>Name<input value={item.name} onChange={(event) => updateConfigItem(group, item.id, "name", event.target.value)} /></label>
                      {(group === "services" || group === "payments") && <label>{group === "payments" ? "Description" : "Note"}<input value={item.note || ""} onChange={(event) => updateConfigItem(group, item.id, "note", event.target.value)} /></label>}
                      {group === "extras" && <label>Price (€)<input type="number" min="0" value={item.price} onChange={(event) => updateConfigItem(group, item.id, "price", event.target.value)} /></label>}
                      {group === "vehicles" && <><label>Passengers<input type="number" min="1" value={item.passengers} onChange={(event) => updateConfigItem(group, item.id, "passengers", Number(event.target.value))} /></label><label>Luggage<input type="number" min="0" value={item.luggage} onChange={(event) => updateConfigItem(group, item.id, "luggage", Number(event.target.value))} /></label></>}
                      <label className="admin-config__enabled"><input type="checkbox" checked={item.enabled} onChange={(event) => updateConfigItem(group, item.id, "enabled", event.target.checked)} />Enabled</label>
                      <button className="admin-config__remove" type="button" onClick={() => removeConfigItem(group, item.id)}>Remove</button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <button type="button" className="btn btn--solid admin-config__save" onClick={saveConfig}>Save booking configuration</button>
        </details>
      )}

      {notice && <p className="workspace__notice" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button></p>}
      {error && <p className="admin-login__error" role="alert">{error}</p>}

      <div className="booking-list">
        {loading ? <div className="workspace__empty"><p>Loading bookings...</p></div> : visibleBookings.length ? visibleBookings.map((booking) => (
          <article className="booking-card" key={booking.id}>
            <div className="booking-card__top">
              <div><span className="booking-card__reference">{booking.reference}</span><span className={`booking-status booking-status--${booking.status}`}>{booking.status}</span></div>
              <span className="booking-card__date">{formatPickup(booking)}</span>
            </div>
            <div className="booking-card__route">
              <div><span className="route-dot route-dot--start"/><div><small>Pick-up</small><strong>{booking.pickup}</strong></div></div>
              <span className="route-line" aria-hidden="true" />
              <div><span className="route-dot route-dot--end"/><div><small>Destination</small><strong>{booking.dropoff}</strong></div></div>
            </div>
            <div className="booking-card__details">
              <span>{booking.name}</span><span>{booking.passengers} {Number(booking.passengers) === 1 ? "passenger" : "passengers"}</span><span>{booking.phone || "Phone not provided"}</span>
            </div>
            {editing === booking.id ? (
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
            ) : (
              <div className="booking-card__actions">
                {admin && booking.status === "pending" && <button className="action-link action-link--accept" type="button" onClick={() => changeStatus(booking, "confirmed")}>Accept request</button>}
                {admin && <label className="booking-card__status">Update status<select value={booking.status} onChange={(event) => changeStatus(booking, event.target.value)}>{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label>}
                {admin && booking.status !== "completed" && booking.status !== "cancelled" && <button className="action-link" type="button" onClick={() => setEditing(booking.id)}>Edit details</button>}
                {!admin && !["completed", "cancelled"].includes(booking.status) && <button className="action-link action-link--cancel" type="button" onClick={() => changeStatus(booking, "cancelled")}>Cancel journey</button>}
                {admin && <button className="action-link action-link--remove" type="button" onClick={() => deleteBooking(booking)}>Remove</button>}
              </div>
            )}
          </article>
        )) : (
          <div className="workspace__empty"><span aria-hidden="true">✳</span><h2>{bookings.length ? "No journeys match" : "Your next journey starts here"}</h2><p>{bookings.length ? "Try a different search or status." : admin ? "New customer requests will appear here." : "Your confirmed and upcoming journeys will appear here."}</p>{!bookings.length && !admin && <a className="btn btn--solid" href="/book">Plan a journey</a>}</div>
        )}
      </div>
      <p className="workspace__footnote">{admin ? "Operations workspace · Bookings are synced with the secure Supabase database." : "Your booking requests are securely stored in your account. Need to change a completed journey? Contact our concierge team."}</p>
    </section>
  );
}