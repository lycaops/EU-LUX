"use client";

import { useState } from "react";
import AdminSignOut from "@/components/AdminSignOut";
import { getBookingConfig, saveBookingConfig } from "@/lib/bookingConfig";
import { IconArrowUpRight, IconClose } from "@/components/Icons";

export default function BookingConfiguration() {
  const [bookingConfig, setBookingConfig] = useState(() => getBookingConfig());
  const [notice, setNotice] = useState("");

  const updateConfigItem = (group, id, field, value) => {
    setBookingConfig((current) => ({
      ...current,
      [group]: current[group].map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const removeConfigItem = (group, id) => {
    setBookingConfig((current) => ({
      ...current,
      [group]: current[group].filter((item) => item.id !== id),
    }));
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

  const saveConfig = () => {
    saveBookingConfig(bookingConfig);
    setNotice("Booking options updated. The new choices are available at /book.");
  };

  return (
    <section className="workspace">
      <header className="workspace__header">
        <div>
          <p className="workspace__eyebrow">EU LUXURY · OPERATIONS</p>
          <h1>Booking configuration</h1>
          <p className="workspace__intro">Manage the services, fleet, extras, and payment choices shown in the booking form.</p>
        </div>
        <div className="workspace__header-actions">
          <AdminSignOut />
          <a className="btn btn--solid workspace__new" href="/">View website<IconArrowUpRight /></a>
        </div>
      </header>

      {notice && <p className="workspace__notice" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><IconClose /></button></p>}
      <div className="admin-config admin-config--standalone">
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
      </div>
      <p className="workspace__footnote">Booking options are stored in this browser. Live tariff and package management is available from the Admin panel.</p>
    </section>
  );
}
