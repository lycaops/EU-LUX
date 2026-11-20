"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBooking } from "@/lib/bookings";
import { getBookingConfig } from "@/lib/bookingConfig";

function BookingRequest() {
  const params = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [config] = useState(() => getBookingConfig());
  const SERVICES = config.services.filter((item) => item.enabled);
  const VEHICLES = config.vehicles.filter((item) => item.enabled);
  const EXTRAS = config.extras.filter((item) => item.enabled);
  const PAYMENTS = config.payments.filter((item) => item.enabled);
  const [form, setForm] = useState({
    service: "transfer",
    pickup: params.get("pickup") || "",
    dropoff: params.get("dropoff") || "",
    date: params.get("date") || "",
    time: params.get("time") || "",
    passengers: Number(params.get("pax") || 2),
    luggage: 2,
    flight: "",
    notes: "",
    vehicle: "v250",
    extras: [],
    payment: "later",
    name: "",
    email: "",
    phone: "",
  });

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const toggleExtra = (id) => setForm((current) => ({
    ...current,
    extras: current.extras.includes(id) ? current.extras.filter((item) => item !== id) : [...current.extras, id],
  }));

  const submitBooking = (event) => {
    event.preventDefault();
    setSaving(true);
    const selectedVehicle = VEHICLES.find((vehicle) => vehicle.id === form.vehicle);
    const selectedExtras = EXTRAS.filter((extra) => form.extras.includes(extra.id));
    const booking = createBooking({
      ...form,
      vehicleName: selectedVehicle?.name,
      extrasDetails: selectedExtras,
      paymentStatus: form.payment === "later" ? "pay-later" : "pending",
    });
    router.push(`/account?created=${booking.reference}`);
  };

  const canContinue = step === 1
    ? Boolean(form.pickup && form.dropoff && form.date && form.time)
    : step === 4
      ? Boolean(form.name && form.email)
      : true;

  const selectedVehicle = VEHICLES.find((vehicle) => vehicle.id === form.vehicle);

  return (
    <section className="booking-wizard">
      <header className="booking-wizard__header">
        <div><p>Book your journey</p><h1>Four steps, one flawless arrival.</h1></div>
        <ol className="booking-progress" aria-label="Booking progress">
          {["Journey", "Vehicle", "Extras", "Payment"].map((label, index) => (
            <li key={label} className={step === index + 1 ? "is-active" : step > index + 1 ? "is-complete" : ""}>
              <button type="button" onClick={() => index + 1 < step && setStep(index + 1)}><span>{index + 1}</span>{label}</button>
            </li>
          ))}
        </ol>
      </header>

      <form className="booking-wizard__body" onSubmit={submitBooking}>
        <div className="booking-wizard__content">
          {step === 1 && (
            <div className="wizard-step">
              <div className="wizard-step__heading"><span>01</span><div><p>Start your journey</p><h2>Where are we taking you?</h2></div></div>
              <div className="service-choice">
                {SERVICES.map((service) => (
                  <button type="button" key={service.id} className={form.service === service.id ? "is-selected" : ""} onClick={() => update("service", service.id)}>
                    <span>{service.name}</span><small>{service.note}</small>
                  </button>
                ))}
              </div>
              <div className="wizard-grid">
                <label className="wizard-field wizard-field--wide"><span>Pick-up location</span><div className="location-field"><input value={form.pickup} onChange={(event) => update("pickup", event.target.value)} placeholder="Hotel, airport or address" required /><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.pickup || "Italy")}`} target="_blank" rel="noreferrer">Pick from map</a></div></label>
                <label className="wizard-field"><span>Destination</span><input value={form.dropoff} onChange={(event) => update("dropoff", event.target.value)} placeholder="Where to?" required /></label>
                <label className="wizard-field"><span>Date</span><input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} min={new Date().toISOString().slice(0, 10)} required /></label>
                <label className="wizard-field"><span>Time</span><input type="time" value={form.time} onChange={(event) => update("time", event.target.value)} required /></label>
                <label className="wizard-field"><span>Passengers</span><select value={form.passengers} onChange={(event) => update("passengers", Number(event.target.value))}>{Array.from({ length: 7 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} {index === 0 ? "passenger" : "passengers"}</option>)}</select></label>
                <label className="wizard-field"><span>Luggage</span><select value={form.luggage} onChange={(event) => update("luggage", Number(event.target.value))}>{Array.from({ length: 9 }, (_, index) => <option key={index} value={index}>{index} {index === 1 ? "piece" : "pieces"}</option>)}</select></label>
                <label className="wizard-field"><span>Flight number <small>Optional</small></span><input value={form.flight} onChange={(event) => update("flight", event.target.value)} placeholder="e.g. AZ 204" /></label>
                <label className="wizard-field wizard-field--wide"><span>Notes for the chauffeur <small>Optional</small></span><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} rows="3" placeholder="Anything we should know?" /></label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-step">
              <div className="wizard-step__heading"><span>02</span><div><p>Choose your vehicle</p><h2>Select from the available fleet.</h2></div></div>
              <div className="vehicle-choice">
                {VEHICLES.map((vehicle) => (
                  <button type="button" key={vehicle.id} className={form.vehicle === vehicle.id ? "is-selected" : ""} onClick={() => update("vehicle", vehicle.id)}>
                    <img src={vehicle.image} alt={vehicle.name} />
                    <div><p>{vehicle.note}</p><h3>{vehicle.name}</h3><small>{vehicle.passengers} passengers · {vehicle.luggage} luggage</small></div>
                    <span className="vehicle-choice__check" aria-hidden="true">✓</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-step">
              <div className="wizard-step__heading"><span>03</span><div><p>Personalise your journey</p><h2>Add extras.</h2></div></div>
              <div className="extras-choice">
                {EXTRAS.map((extra) => (
                  <button type="button" key={extra.id} className={form.extras.includes(extra.id) ? "is-selected" : ""} onClick={() => toggleExtra(extra.id)}>
                    <span>{String(EXTRAS.findIndex((item) => item.id === extra.id) + 1).padStart(2, "0")}</span><div><h3>{extra.name}</h3><p>€{extra.price}</p></div><small>{form.extras.includes(extra.id) ? "Added" : "Add"}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="wizard-step">
              <div className="wizard-step__heading"><span>04</span><div><p>Confirm and pay</p><h2>How would you like to settle?</h2></div></div>
              <div className="payment-choice">
                {PAYMENTS.map((payment) => (
                  <button type="button" key={payment.id} className={form.payment === payment.id ? "is-selected" : ""} onClick={() => update("payment", payment.id)}>
                    <span className="payment-radio"/><div><h3>{payment.name}</h3><p>{payment.note}</p></div>
                  </button>
                ))}
              </div>
              <div className="wizard-grid wizard-contact">
                <label className="wizard-field"><span>Full name</span><input value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" required /></label>
                <label className="wizard-field"><span>Email address</span><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" required /></label>
                <label className="wizard-field wizard-field--wide"><span>Phone number</span><input type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" /></label>
              </div>
            </div>
          )}
        </div>

        <aside className="booking-summary">
          <p>Journey summary</p>
          <h2>{form.pickup || "Pick-up"}<span>to</span>{form.dropoff || "Destination"}</h2>
          <dl>
            <div><dt>Service</dt><dd>{SERVICES.find((item) => item.id === form.service)?.name}</dd></div>
            <div><dt>Date & time</dt><dd>{form.date || "Choose date"}{form.time ? ` · ${form.time}` : ""}</dd></div>
            <div><dt>Guests</dt><dd>{form.passengers} passengers · {form.luggage} luggage</dd></div>
            <div><dt>Vehicle</dt><dd>{selectedVehicle?.name}</dd></div>
            {form.extras.length > 0 && <div><dt>Extras</dt><dd>{EXTRAS.filter((item) => form.extras.includes(item.id)).map((item) => item.name).join(", ")}</dd></div>}
          </dl>
          <div className="booking-summary__total"><span>Estimated total</span><strong>To be confirmed</strong></div>
        </aside>

        <footer className="booking-wizard__footer">
          {step > 1 && <button type="button" className="wizard-back" onClick={() => setStep((current) => current - 1)}>Back</button>}
          {step < 4
            ? <button type="button" className="btn btn--solid" disabled={!canContinue} onClick={() => setStep((current) => current + 1)}>Continue<span aria-hidden="true"> →</span></button>
            : <button type="submit" className="btn btn--solid" disabled={!canContinue || saving}>{saving ? "Confirming..." : "Confirm booking"}<span aria-hidden="true"> →</span></button>}
        </footer>
      </form>
    </section>
  );
}

export default function Book() {
  return <Suspense fallback={<div className="page">Preparing your journey...</div>}><BookingRequest /></Suspense>;
}