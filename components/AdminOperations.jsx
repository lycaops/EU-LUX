"use client";

import { useEffect, useState } from "react";
import AdminSignOut from "@/components/AdminSignOut";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { IconArrowUpRight } from "@/components/Icons";

const SERVICE_TYPES = ["transfer", "hourly", "daily", "fixed_route"];

function createDraftId() {
  return `draft-${crypto.randomUUID()}`;
}

function newTariff() {
  return {
    id: createDraftId(),
    vehicle_id: "",
    service_type: "transfer",
    label: "",
    base_fee: 0,
    per_km: 0,
    per_hour: 0,
    min_fare: 0,
    vat_pct: 10,
    active: true,
  };
}

function newTourPackage() {
  return {
    id: createDraftId(),
    name: "",
    description: "",
    itinerary: "",
    pickup_city: "",
    image_url: "",
    duration_hours: 1,
    price: 0,
    active: true,
  };
}

function errorMessage(error) {
  return error?.message || "An unexpected error occurred. Please try again.";
}

export default function AdminOperations() {
  const [tariffs, setTariffs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tourPackages, setTourPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    const loadConfiguration = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const [tariffResult, vehicleResult, packageResult] = await Promise.all([
          supabase.from("tariffs").select("*").order("label"),
          supabase.from("vehicles").select("id, name").order("name"),
          supabase.from("tour_packages").select("*").order("name"),
        ]);
        const failed = [tariffResult, vehicleResult, packageResult].find((result) => result.error);
        if (failed?.error) throw failed.error;
        if (active) {
          setTariffs(tariffResult.data || []);
          setVehicles(vehicleResult.data || []);
          setTourPackages(packageResult.data || []);
        }
      } catch (loadError) {
        if (active) setError(`Unable to load live configuration: ${errorMessage(loadError)}`);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadConfiguration();
    return () => { active = false; };
  }, []);

  const updateRow = (setter, id, field, value) => {
    setter((rows) => rows.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };

  const saveTariff = async (tariff) => {
    setSaving(tariff.id);
    setError("");
    setNotice("");
    const payload = {
      ...(tariff.id.startsWith("draft-") ? {} : { id: tariff.id }),
      vehicle_id: tariff.vehicle_id || null,
      service_type: tariff.service_type,
      label: tariff.label.trim(),
      base_fee: Number(tariff.base_fee),
      per_km: Number(tariff.per_km),
      per_hour: Number(tariff.per_hour),
      min_fare: Number(tariff.min_fare),
      vat_pct: Number(tariff.vat_pct),
      active: tariff.active,
    };
    try {
      if (!payload.label) throw new Error("Enter a tariff name before saving.");
      if ([payload.base_fee, payload.per_km, payload.per_hour, payload.min_fare, payload.vat_pct].some((value) => !Number.isFinite(value) || value < 0)) {
        throw new Error("Fare amounts and VAT must be zero or greater.");
      }
      const supabase = createSupabaseBrowserClient();
      const { data, error: saveError } = await supabase.from("tariffs").upsert(payload).select().single();
      if (saveError) throw saveError;
      setTariffs((rows) => rows.map((row) => row.id === tariff.id ? data : row).sort((a, b) => a.label.localeCompare(b.label)));
      setNotice("Tariff saved to the live database.");
    } catch (saveError) {
      setError(`Unable to save tariff: ${errorMessage(saveError)}`);
    } finally {
      setSaving("");
    }
  };

  const saveTourPackage = async (tourPackage) => {
    setSaving(tourPackage.id);
    setError("");
    setNotice("");
    const payload = {
      ...(tourPackage.id.startsWith("draft-") ? {} : { id: tourPackage.id }),
      name: tourPackage.name.trim(),
      description: tourPackage.description.trim(),
      itinerary: tourPackage.itinerary.trim(),
      pickup_city: tourPackage.pickup_city.trim(),
      image_url: tourPackage.image_url.trim(),
      duration_hours: Number(tourPackage.duration_hours),
      price: Number(tourPackage.price),
      active: tourPackage.active,
    };
    try {
      if (!payload.name) throw new Error("Enter a package name before saving.");
      if (!Number.isFinite(payload.duration_hours) || payload.duration_hours <= 0
        || !Number.isFinite(payload.price) || payload.price < 0) {
        throw new Error("Duration must be greater than zero and price must be zero or greater.");
      }
      const supabase = createSupabaseBrowserClient();
      const { data, error: saveError } = await supabase.from("tour_packages").upsert(payload).select().single();
      if (saveError) throw saveError;
      setTourPackages((rows) => rows.map((row) => row.id === tourPackage.id ? data : row).sort((a, b) => a.name.localeCompare(b.name)));
      setNotice("Tour package saved to the live database.");
    } catch (saveError) {
      setError(`Unable to save tour package: ${errorMessage(saveError)}`);
    } finally {
      setSaving("");
    }
  };

  const deleteRow = async (table, setter, row, label) => {
    if (row.id.startsWith("draft-")) {
      setter((rows) => rows.filter((item) => item.id !== row.id));
      return;
    }
    if (!window.confirm(`Remove ${label}? This cannot be undone.`)) return;
    setSaving(row.id);
    setError("");
    setNotice("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: deleteError } = await supabase.from(table).delete().eq("id", row.id);
      if (deleteError) throw deleteError;
      setter((rows) => rows.filter((item) => item.id !== row.id));
      setNotice(`${label} removed from the live database.`);
    } catch (deleteError) {
      setError(`Unable to remove ${label}: ${errorMessage(deleteError)}`);
    } finally {
      setSaving("");
    }
  };

  return (
    <section className="workspace">
      <header className="workspace__header">
        <div>
          <p className="workspace__eyebrow">EU LUXURY · OPERATIONS</p>
          <h1>Admin panel</h1>
          <p className="workspace__intro">Manage live fare tariffs and private tour packages.</p>
        </div>
        <div className="workspace__header-actions">
          <AdminSignOut />
          <a className="btn btn--solid workspace__new" href="/">View website<IconArrowUpRight /></a>
        </div>
      </header>

      <main className="admin-catalog">
        {error && <p className="admin-catalog__message admin-catalog__message--error" role="alert">{error}</p>}
        {notice && <p className="admin-catalog__message" role="status">{notice}</p>}
        {loading ? <p className="admin-catalog__loading">Loading live configuration...</p> : (
          <>
            <section className="admin-catalog__section">
              <header className="admin-catalog__heading">
                <div><p>Pricing</p><h2>Fare tariffs</h2></div>
                <button className="btn btn--ghost" type="button" onClick={() => setTariffs((rows) => [...rows, newTariff()])}>+ Add tariff</button>
              </header>
              {!tariffs.length && <p className="admin-catalog__empty">No tariffs yet. Add one to configure your fares.</p>}
              <div className="admin-catalog__list">
                {tariffs.map((tariff) => (
                  <article className="admin-catalog__card" key={tariff.id}>
                    <label>Tariff name<input value={tariff.label} onChange={(event) => updateRow(setTariffs, tariff.id, "label", event.target.value)} placeholder="e.g. Standard transfer" required /></label>
                    <label>Service type<select value={tariff.service_type} onChange={(event) => updateRow(setTariffs, tariff.id, "service_type", event.target.value)}>{SERVICE_TYPES.map((type) => <option key={type} value={type}>{type.replace("_", " ")}</option>)}</select></label>
                    <label>Vehicle<select value={tariff.vehicle_id || ""} onChange={(event) => updateRow(setTariffs, tariff.id, "vehicle_id", event.target.value)}><option value="">All vehicles</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}</select></label>
                    <label>Base fee (€)<input type="number" min="0" step="0.01" value={tariff.base_fee ?? 0} onChange={(event) => updateRow(setTariffs, tariff.id, "base_fee", event.target.value)} /></label>
                    <label>Rate per km (€)<input type="number" min="0" step="0.01" value={tariff.per_km ?? 0} onChange={(event) => updateRow(setTariffs, tariff.id, "per_km", event.target.value)} /></label>
                    <label>Hourly rate (€)<input type="number" min="0" step="0.01" value={tariff.per_hour ?? 0} onChange={(event) => updateRow(setTariffs, tariff.id, "per_hour", event.target.value)} /></label>
                    <label>Minimum fare (€)<input type="number" min="0" step="0.01" value={tariff.min_fare ?? 0} onChange={(event) => updateRow(setTariffs, tariff.id, "min_fare", event.target.value)} /></label>
                    <label>VAT (%)<input type="number" min="0" step="0.01" value={tariff.vat_pct ?? 0} onChange={(event) => updateRow(setTariffs, tariff.id, "vat_pct", event.target.value)} /></label>
                    <label className="admin-catalog__active"><input type="checkbox" checked={tariff.active} onChange={(event) => updateRow(setTariffs, tariff.id, "active", event.target.checked)} />Available</label>
                    <div className="admin-catalog__actions">
                      <button className="btn btn--solid" type="button" disabled={saving === tariff.id} onClick={() => saveTariff(tariff)}>{saving === tariff.id ? "Saving..." : "Save tariff"}</button>
                      <button className="admin-catalog__remove" type="button" disabled={saving === tariff.id} onClick={() => deleteRow("tariffs", setTariffs, tariff, tariff.label || "this tariff")}>Remove</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-catalog__section">
              <header className="admin-catalog__heading">
                <div><p>Experiences</p><h2>Tour packages</h2></div>
                <button className="btn btn--ghost" type="button" onClick={() => setTourPackages((rows) => [...rows, newTourPackage()])}>+ Add package</button>
              </header>
              {!tourPackages.length && <p className="admin-catalog__empty">No tour packages yet. Add one to configure your offers.</p>}
              <div className="admin-catalog__list">
                {tourPackages.map((tourPackage) => (
                  <article className="admin-catalog__card admin-catalog__card--tour" key={tourPackage.id}>
                    <label>Package name<input value={tourPackage.name} onChange={(event) => updateRow(setTourPackages, tourPackage.id, "name", event.target.value)} placeholder="e.g. Tuscan countryside" required /></label>
                    <label>Duration (hours)<input type="number" min="0.5" step="0.5" value={tourPackage.duration_hours ?? 1} onChange={(event) => updateRow(setTourPackages, tourPackage.id, "duration_hours", event.target.value)} /></label>
                    <label>Price (€)<input type="number" min="0" step="0.01" value={tourPackage.price ?? 0} onChange={(event) => updateRow(setTourPackages, tourPackage.id, "price", event.target.value)} /></label>
                    <label>Starting city<input value={tourPackage.pickup_city || ""} onChange={(event) => updateRow(setTourPackages, tourPackage.id, "pickup_city", event.target.value)} placeholder="e.g. Florence" /></label>
                    <label>City image URL<input value={tourPackage.image_url || ""} onChange={(event) => updateRow(setTourPackages, tourPackage.id, "image_url", event.target.value)} placeholder="/scenes/..." /></label>
                    <label>Description<textarea rows="2" value={tourPackage.description || ""} onChange={(event) => updateRow(setTourPackages, tourPackage.id, "description", event.target.value)} /></label>
                    <label>Itinerary<textarea rows="3" value={tourPackage.itinerary || ""} onChange={(event) => updateRow(setTourPackages, tourPackage.id, "itinerary", event.target.value)} placeholder="Stops or schedule, one per line" /></label>
                    <label className="admin-catalog__active"><input type="checkbox" checked={tourPackage.active} onChange={(event) => updateRow(setTourPackages, tourPackage.id, "active", event.target.checked)} />Available</label>
                    <div className="admin-catalog__actions">
                      <button className="btn btn--solid" type="button" disabled={saving === tourPackage.id} onClick={() => saveTourPackage(tourPackage)}>{saving === tourPackage.id ? "Saving..." : "Save package"}</button>
                      <button className="admin-catalog__remove" type="button" disabled={saving === tourPackage.id} onClick={() => deleteRow("tour_packages", setTourPackages, tourPackage, tourPackage.name || "this package")}>Remove</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <p className="workspace__footnote">Configuration changes are saved live. Booking requests are managed from the Booking desk.</p>
    </section>
  );
}
