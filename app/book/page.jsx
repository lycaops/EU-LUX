"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBooking } from "@/lib/bookings";
import { getBookingConfig } from "@/lib/bookingConfig";
import { getSignInGreeting } from "@/lib/supabase/greeting";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import AvailabilityDatePicker from "@/components/AvailabilityDatePicker";
import { IconArrowRight, IconCheck } from "@/components/Icons";

const TARIFF_SERVICE = { transfer: "transfer", hourly: "hourly", tour: "daily" };
const currency = (amount) => new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(amount);
const dateKey = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, "0"),
  String(date.getDate()).padStart(2, "0"),
].join("-");

function nextMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function isValidDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  return dateKey(new Date(year, month - 1, day)) === value;
}

function BookingRequest() {
  const params = useSearchParams();
  const requestedDate = params.get("date") || "";
  const hasRequestedDate = isValidDateKey(requestedDate);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    return hasRequestedDate
      ? requestedDate.slice(0, 7)
      : nextMonthKey(new Date(Date.now() + 24 * 60 * 60 * 1000));
  });
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [greeting, setGreeting] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [tourPackages, setTourPackages] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [route, setRoute] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [availabilityByMonth, setAvailabilityByMonth] = useState({});
  const [availabilityCheckedMonths, setAvailabilityCheckedMonths] = useState({});
  const [availabilityLoadingMonth, setAvailabilityLoadingMonth] = useState("");
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [availabilityAttempt, setAvailabilityAttempt] = useState(0);
  const timeInput = useRef(null);
  const routeRequestId = useRef(0);
  const [config] = useState(() => getBookingConfig());
  const SERVICES = config.services.filter((item) => item.enabled);
  const EXTRAS = config.extras.filter((item) => item.enabled);
  const PAYMENTS = config.payments.filter((item) => item.enabled);
  const [form, setForm] = useState({
    service: "transfer",
    pickup: params.get("pickup") || "",
    dropoff: params.get("dropoff") || "",
    date: hasRequestedDate ? requestedDate : "",
    time: params.get("time") || "",
    passengers: Number(params.get("pax") || 2),
    luggage: 2,
    hours: 3,
    flight: "",
    notes: "",
    specialRequest: "",
    vehicle: "",
    tourPackageId: "",
    extras: [],
    payment: "",
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    let active = true;
    const loadBookingDetails = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const [authResult, vehicleResult, tariffResult, packageResult] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from("vehicles").select("id, name, seats, luggage, image_url").eq("active", true).order("name"),
          supabase.from("tariffs").select("*").eq("active", true).order("label"),
          supabase.from("tour_packages").select("*").eq("active", true).order("name"),
        ]);
        const failed = [vehicleResult, tariffResult, packageResult].find((result) => result.error);
        if (authResult.error) throw authResult.error;
        if (failed?.error) throw failed.error;
        if (!active) return;

        const user = authResult.data.user;
        setUserEmail(user?.email || "");
        setVehicles(vehicleResult.data || []);
        setTariffs(tariffResult.data || []);
        setTourPackages(packageResult.data || []);
        setForm((current) => ({
          ...current,
          name: current.name || user?.user_metadata?.full_name || "",
          email: user?.email || current.email,
          vehicle: vehicleResult.data?.some((vehicle) => vehicle.id === current.vehicle)
            ? current.vehicle
            : vehicleResult.data?.[0]?.id || "",
        }));
      } catch {
        if (active) setCatalogError("Unable to load live vehicles, packages, and fares. Please refresh or send a custom request.");
      } finally {
        if (active) setLoadingCatalog(false);
      }
    };
    loadBookingDetails();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (params.get("signedIn") !== "1") return;
    let active = true;
    getSignInGreeting("customer")
      .then((message) => { if (active) setGreeting(message); })
      .catch(() => { if (active) setGreeting("Welcome! You are signed in as a customer."); });
    return () => { active = false; };
  }, [params]);

  useEffect(() => {
    if (!form.vehicle) {
      setAvailabilityByMonth({});
      setAvailabilityCheckedMonths({});
      setAvailabilityLoadingMonth("");
      setAvailabilityErrors({});
      return undefined;
    }

    let active = true;
    const loadAvailability = async () => {
      setAvailabilityLoadingMonth(calendarMonth);
      setAvailabilityErrors((current) => ({ ...current, [calendarMonth]: "" }));
      try {
        const [year, month] = calendarMonth.split("-").map(Number);
        const startDate = `${calendarMonth}-01`;
        const endDate = dateKey(new Date(year, month, 0));
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.rpc("unavailable_vehicle_dates", {
          p_vehicle_id: form.vehicle,
          p_start_date: startDate,
          p_end_date: endDate,
        });
        if (error) throw error;
        if (active) {
          setAvailabilityByMonth((current) => ({
            ...current,
            [calendarMonth]: (data || []).map((row) => row.unavailable_date),
          }));
          setAvailabilityCheckedMonths((current) => ({ ...current, [calendarMonth]: true }));
        }
      } catch {
        if (active) {
          setAvailabilityErrors((current) => ({
            ...current,
            [calendarMonth]: "Unable to check availability for this vehicle. Choose no specific vehicle or try again.",
          }));
        }
      } finally {
        if (active) setAvailabilityLoadingMonth("");
      }
    };
    loadAvailability();
    return () => { active = false; };
  }, [availabilityAttempt, calendarMonth, form.vehicle]);

  const minimumPickupTimestamp = Math.ceil((Date.now() + 24 * 60 * 60 * 1000) / 60000) * 60000;
  const minimumPickup = new Date(minimumPickupTimestamp);
  const minimumPickupDate = dateKey(minimumPickup);
  const minimumPickupTime = `${String(minimumPickup.getHours()).padStart(2, "0")}:${String(minimumPickup.getMinutes()).padStart(2, "0")}`;
  const pickupDateTime = form.date && form.time ? new Date(`${form.date}T${form.time}`) : null;
  const pickupHas24HoursNotice = Boolean(
    pickupDateTime && !Number.isNaN(pickupDateTime.getTime())
      && pickupDateTime.getTime() >= Date.now() + 24 * 60 * 60 * 1000,
  );
  const selectedDateMonth = form.date.slice(0, 7);
  const selectedDateUnavailable = (availabilityByMonth[selectedDateMonth] || []).includes(form.date);
  const selectedDateAvailabilityError = availabilityErrors[selectedDateMonth] || "";
  const availabilityAllowsBooking = !form.vehicle || (
    availabilityCheckedMonths[selectedDateMonth]
    && !selectedDateUnavailable
    && !selectedDateAvailabilityError
    && availabilityLoadingMonth !== selectedDateMonth
  );
  const calendarAvailabilityLoading = Boolean(form.vehicle)
    && !availabilityErrors[calendarMonth]
    && (!availabilityCheckedMonths[calendarMonth] || availabilityLoadingMonth === calendarMonth);

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "service" && value !== "tour" ? { tourPackageId: "" } : {}),
    }));
    if (field === "pickup" || field === "dropoff") {
      routeRequestId.current += 1;
      setRoute(null);
      setRouteError("");
      setCalculatingRoute(false);
    }
    if (field === "date") setCalendarMonth(value.slice(0, 7));
    if (field === "vehicle" && value !== form.vehicle) {
      setAvailabilityByMonth({});
      setAvailabilityCheckedMonths({});
      setAvailabilityErrors({});
      setAvailabilityLoadingMonth("");
      setAvailabilityAttempt(0);
    }
    if (field === "vehicle" || field === "service" || field === "tourPackageId") setRouteError("");
  };
  const toggleExtra = (id) => setForm((current) => ({
    ...current,
    extras: current.extras.includes(id) ? current.extras.filter((item) => item !== id) : [...current.extras, id],
  }));

  const calculateRoute = async () => {
    const requestId = ++routeRequestId.current;
    const pickup = form.pickup;
    const selectedPackage = tourPackages.find((item) => item.id === form.tourPackageId);
    const dropoff = form.service === "tour"
      ? (selectedPackage?.pickup_city || form.dropoff)
      : form.dropoff;
    setCalculatingRoute(true);
    setRouteError("");
    try {
      const response = await fetch("/api/route-distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup, dropoff }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to calculate this route.");
      if (requestId === routeRequestId.current) setRoute(result);
    } catch (error) {
      if (requestId === routeRequestId.current) {
        setRoute(null);
        setRouteError(error.message || "Unable to calculate this route.");
      }
    } finally {
      if (requestId === routeRequestId.current) setCalculatingRoute(false);
    }
  };

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === form.vehicle);
  const selectedPackage = tourPackages.find((item) => item.id === form.tourPackageId);
  const matchingTariffs = tariffs.filter((tariff) => tariff.service_type === TARIFF_SERVICE[form.service]);
  const selectedTariff = matchingTariffs.find((tariff) => tariff.vehicle_id === form.vehicle)
    || matchingTariffs.find((tariff) => !tariff.vehicle_id);
  const transferTariff = tariffs.find((tariff) =>
    tariff.service_type === "transfer"
    && (tariff.vehicle_id === form.vehicle || !tariff.vehicle_id)
  ) || tariffs.find((tariff) => tariff.service_type === "transfer");
  const extrasTotal = EXTRAS
    .filter((extra) => form.extras.includes(extra.id))
    .reduce((sum, extra) => sum + (Number(extra.price) || 0), 0);
  const transferFare = selectedTariff
    ? route
      ? Math.max(
        Number(selectedTariff.min_fare) || 0,
        (Number(selectedTariff.base_fee) || 0) + (Number(selectedTariff.per_km) || 0) * route.distanceKm,
      )
      : null
    : null;
  const hourlyFare = selectedTariff
    ? Math.max(
      Number(selectedTariff.min_fare) || 0,
      (Number(selectedTariff.base_fee) || 0) + (Number(selectedTariff.per_hour) || 0) * (Number(form.hours) || 0),
    )
    : null;
  const tourTransferFare = transferTariff && route
    ? Math.max(
      Number(transferTariff.min_fare) || 0,
      (Number(transferTariff.base_fee) || 0) + (Number(transferTariff.per_km) || 0) * route.distanceKm,
    )
    : 0;
  const fareBeforeExtras = form.service === "transfer"
    ? transferFare
    : form.service === "hourly"
      ? hourlyFare
      : selectedPackage
        ? Number(selectedPackage.price) + tourTransferFare
        : null;
  const estimatedSubtotal = fareBeforeExtras === null ? null : fareBeforeExtras + extrasTotal;
  const vatRate = Number(selectedTariff?.vat_pct ?? 10) || 0;
  const estimatedTotal = estimatedSubtotal === null ? null : estimatedSubtotal * (1 + vatRate / 100);

  const submitBooking = async (event) => {
    event.preventDefault();
    if (step !== 4) {
      if (canContinue) setStep((current) => Math.min(current + 1, 4));
      return;
    }
    if (!canContinue || saving) return;
    setSaving(true);
    setSubmitError("");
    try {
      const selectedVehicle = vehicles.find((vehicle) => vehicle.id === form.vehicle);
      const selectedExtras = EXTRAS.filter((extra) => form.extras.includes(extra.id));
      const booking = await createBooking({
        ...form,
        dropoff: form.service === "hourly"
          ? "Hourly service - chauffeur at customer's disposal"
          : form.service === "tour"
            ? selectedPackage?.pickup_city || form.dropoff || "Tour itinerary"
            : form.dropoff,
        vehicleId: selectedVehicle?.id,
        vehicleName: selectedVehicle?.name,
        tourPackageName: selectedPackage?.name,
        distanceKm: route?.distanceKm,
        extrasDetails: selectedExtras,
        paymentStatus: form.payment === "later" ? "pay-later" : "pending",
      });
      setConfirmation(booking.reference);
    } catch (error) {
      if (error?.message?.includes("24 hours in advance")) {
        setSubmitError("Bookings must be made at least 24 hours in advance.");
        setStep(1);
      } else if (error?.message?.includes("Vehicle is unavailable on the selected date")) {
        setSubmitError("That vehicle is no longer available on this date. Please choose another date or vehicle.");
        setStep(1);
      } else {
        setSubmitError("We couldn't save your request. Check that you are signed in, then try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const canContinue = step === 1
    ? Boolean(form.pickup && form.date && form.time
      && !loadingCatalog
      && pickupHas24HoursNotice
      && availabilityAllowsBooking
      && (form.service === "transfer" ? form.dropoff : true)
      && (form.service === "hourly" ? Number(form.hours) > 0 : true)
      && (form.service !== "tour" || form.tourPackageId || !tourPackages.length))
    : step === 4
      ? Boolean(form.name && form.email && form.payment && pickupHas24HoursNotice && availabilityAllowsBooking)
      : true;

  if (confirmation) {
    return (
      <section className="booking-wizard">
        {greeting && <p className="workspace__notice" role="status">{greeting}</p>}
        <header className="booking-wizard__header">
          <div><p>Request saved</p><h1>Your journey request has been saved.</h1></div>
        </header>
        <div className="booking-confirmation">
          <p>Booking reference</p>
          <h2>{confirmation}</h2>
          <p>Your request has been sent to our team. You can track its status from your account.</p>
          <a className="btn btn--solid" href="/">Return to the website</a>
        </div>
      </section>
    );
  }

  const openPicker = (input) => {
    if (typeof input?.showPicker === "function") {
      input.showPicker();
      return;
    }
    input?.focus();
    input?.click();
  };

  return (
    <section className="booking-wizard">
      {greeting && <p className="workspace__notice" role="status">{greeting}</p>}
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

      <form className="booking-wizard__body" onSubmit={(event) => event.preventDefault()}>
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
              {loadingCatalog && <p className="booking-catalog-loading" role="status">Loading live vehicles, packages, and fares...</p>}
              {form.service === "tour" && tourPackages.length > 0 && (
                <div className="vehicle-choice vehicle-choice--packages">
                  {tourPackages.map((item) => (
                    <button type="button" key={item.id} className={form.tourPackageId === item.id ? "is-selected" : ""} onClick={() => update("tourPackageId", item.id)}>
                      {item.image_url && <img src={item.image_url} alt={item.name} />}
                      <div className="tour-package-card__details">
                        <p>{item.pickup_city ? `From ${item.pickup_city}` : "Private tour"} · {item.duration_hours} hours</p>
                        <h3>{item.name}</h3>
                        {item.description && <small>{item.description}</small>}
                        {item.itinerary && (
                          <ul>
                            {item.itinerary.split("\n").map((line, index) => line.trim() && <li key={index}>{line.trim().replace(/^[-•]\s*/, "")}</li>)}
                          </ul>
                        )}
                      </div>
                      <strong>{currency(Number(item.price))}</strong>
                      <span className="vehicle-choice__check"><IconCheck /></span>
                    </button>
                  ))}
                </div>
              )}
              <div className="wizard-grid">
                <label className="wizard-field wizard-field--wide"><span>Pick-up location</span><div className="location-field"><input value={form.pickup} onChange={(event) => update("pickup", event.target.value)} placeholder="Hotel, airport or address" required /><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.pickup || "Italy")}`} target="_blank" rel="noreferrer">Pick from map</a></div></label>
                {form.service === "transfer" && (
                  <label className="wizard-field"><span>Destination</span><input value={form.dropoff} onChange={(event) => update("dropoff", event.target.value)} placeholder="Where to?" required /></label>
                )}
                {form.service === "hourly" && (
                  <label className="wizard-field"><span>Hours needed</span><select value={form.hours} onChange={(event) => update("hours", Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => index + 1).map((hours) => <option key={hours} value={hours}>{hours} {hours === 1 ? "hour" : "hours"}</option>)}</select></label>
                )}
                <div className="wizard-field"><span>Pick-up date</span><AvailabilityDatePicker
                  value={form.date}
                  onChange={(value) => update("date", value)}
                  minDate={minimumPickupDate}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  unavailableDates={availabilityByMonth[calendarMonth] || []}
                  loading={calendarAvailabilityLoading}
                  error={availabilityErrors[calendarMonth]}
                /></div>
                <label className="wizard-field"><span>Time <small>Book at least 24 hours ahead</small></span><div className="wizard-picker"><input ref={timeInput} type="time" value={form.time} onChange={(event) => update("time", event.target.value)} min={form.date === minimumPickupDate ? minimumPickupTime : undefined} required /><button type="button" aria-label="Open time picker" onClick={() => openPicker(timeInput.current)}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></button></div></label>
                {form.date && form.time && !pickupHas24HoursNotice && <p className="wizard-field__message" role="alert">Choose a pick-up at least 24 hours from now.</p>}
                {selectedDateUnavailable && <p className="wizard-field__message" role="alert">This vehicle already has a booking on that date. Choose a different date or vehicle.</p>}
                {(availabilityErrors[calendarMonth] || selectedDateAvailabilityError) && (
                  <p className="wizard-field__message" role="alert">
                    {availabilityErrors[calendarMonth] || selectedDateAvailabilityError}
                    <button className="action-link" type="button" onClick={() => {
                      if (selectedDateAvailabilityError) setCalendarMonth(selectedDateMonth);
                      setAvailabilityAttempt((current) => current + 1);
                    }}>Check again</button>
                  </p>
                )}
                <label className="wizard-field"><span>Passengers</span><select value={form.passengers} onChange={(event) => update("passengers", Number(event.target.value))}>{Array.from({ length: 7 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} {index === 0 ? "passenger" : "passengers"}</option>)}</select></label>
                <label className="wizard-field"><span>Luggage</span><select value={form.luggage} onChange={(event) => update("luggage", Number(event.target.value))}>{Array.from({ length: 9 }, (_, index) => <option key={index} value={index}>{index} {index === 1 ? "piece" : "pieces"}</option>)}</select></label>
                <label className="wizard-field"><span>Flight number <small>Optional</small></span><input value={form.flight} onChange={(event) => update("flight", event.target.value)} placeholder="e.g. AZ 204" /></label>
                <label className="wizard-field wizard-field--wide"><span>Notes for the chauffeur <small>Optional</small></span><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} rows="3" placeholder="Anything we should know?" /></label>
                <label className="wizard-field wizard-field--wide"><span>Special request or question for our team <small>Optional</small></span><textarea value={form.specialRequest} onChange={(event) => update("specialRequest", event.target.value)} rows="3" placeholder="Tell us what you need; our team can prepare a tailored fare." /></label>
              </div>
              <div className="route-estimate">
                <button
                  className="btn btn--ghost"
                  type="button"
                  disabled={
                    !form.pickup
                    || (form.service === "transfer" && !form.dropoff)
                    || (form.service === "tour" && !selectedPackage?.pickup_city)
                    || calculatingRoute
                  }
                  onClick={calculateRoute}
                >
                  {calculatingRoute ? "Calculating route..." : "Calculate route & estimate"}
                </button>
                {route && <p>{route.distanceKm} km driving distance</p>}
                {routeError && <p role="alert">{routeError}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-step">
              <div className="wizard-step__heading"><span>02</span><div><p>Choose your vehicle</p><h2>Select from the available fleet.</h2></div></div>
              <div className="vehicle-choice">
                <button type="button" className={`vehicle-choice__custom${!form.vehicle ? " is-selected" : ""}`} onClick={() => update("vehicle", "")}>
                  <div><p>Custom request</p><h3>No specific vehicle</h3><small>Our team will confirm the vehicle and fare.</small></div>
                  <span className="vehicle-choice__check"><IconCheck /></span>
                </button>
                {vehicles.map((vehicle) => (
                  <button type="button" key={vehicle.id} className={form.vehicle === vehicle.id ? "is-selected" : ""} onClick={() => update("vehicle", vehicle.id)}>
                    <img src={vehicle.image_url || "/scenes/ext_r.webp"} alt={vehicle.name} />
                    <div><p>Available fleet</p><h3>{vehicle.name}</h3><small>{vehicle.seats} passengers · {vehicle.luggage} luggage</small></div>
                    <span className="vehicle-choice__check"><IconCheck /></span>
                  </button>
                ))}
              </div>
              {!vehicles.length && <p>No vehicles are currently configured. You can still submit a custom request.</p>}
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
              {!form.payment && <p className="booking-catalog-loading" role="status">Select a payment method to continue.</p>}
              <div className="wizard-grid wizard-contact">
                <label className="wizard-field"><span>Full name</span><input value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" required /></label>
                <label className="wizard-field"><span>Email address</span><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" readOnly={Boolean(userEmail)} required /></label>
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
            {form.service === "hourly" && <div><dt>Hours</dt><dd>{form.hours} hours</dd></div>}
            <div><dt>Vehicle</dt><dd>{selectedVehicle?.name}</dd></div>
            {route && <div><dt>Route distance</dt><dd>{route.distanceKm} km</dd></div>}
            {selectedPackage && <div><dt>Package</dt><dd>{selectedPackage.name}</dd></div>}
            {form.extras.length > 0 && <div><dt>Extras</dt><dd>{EXTRAS.filter((item) => form.extras.includes(item.id)).map((item) => item.name).join(", ")}</dd></div>}
          </dl>
          <div className="booking-summary__total"><span>Estimated total{estimatedSubtotal !== null ? ` (incl. ${vatRate}% VAT)` : ""}</span><strong>{estimatedTotal === null ? (selectedTariff && Number(selectedTariff.per_km) > 0 && !route ? "Calculate route" : "Request a quote") : currency(estimatedTotal)}</strong></div>
          {estimatedSubtotal !== null && <small className="booking-summary__note">Estimate only; the final fare is confirmed by our team.</small>}
        </aside>

        <footer className="booking-wizard__footer">
          {catalogError && <p className="admin-login__error" role="alert">{catalogError}</p>}
          {submitError && <p className="admin-login__error" role="alert">{submitError}</p>}
          {step === 4 && !pickupHas24HoursNotice && <p className="admin-login__error" role="alert">Your pick-up must be at least 24 hours from now. Go back to choose a later time.</p>}
          {step === 4 && form.vehicle && !availabilityAllowsBooking && <p className="admin-login__error" role="alert">Vehicle availability must be confirmed for this date before booking.</p>}
          {step > 1 && <button type="button" className="wizard-back" onClick={() => setStep((current) => current - 1)}>Back</button>}
          {step < 4
            ? <button type="button" className="btn btn--solid" disabled={!canContinue} onClick={() => setStep((current) => current + 1)}>Continue<IconArrowRight /></button>
            : <button type="button" className="btn btn--solid" disabled={!canContinue || saving} onClick={submitBooking}>{saving ? "Confirming..." : "Confirm booking"}<IconArrowRight /></button>}
        </footer>
      </form>
    </section>
  );
}

export default function Book() {
  return <Suspense fallback={<div className="page">Preparing your journey...</div>}><BookingRequest /></Suspense>;
}