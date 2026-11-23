"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "./Icons";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function monthKey(date) {
  return dateKey(date).slice(0, 7);
}

function displayDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(year, month - 1, day));
}

export default function AvailabilityDatePicker({
  value,
  onChange,
  minDate,
  month,
  onMonthChange,
  unavailableDates,
  loading,
  error,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const [year, monthNumber] = month.split("-").map(Number);
  const monthDate = new Date(year, monthNumber - 1, 1);
  const firstDayOffset = (monthDate.getDay() + 6) % 7;
  const monthLength = new Date(year, monthNumber, 0).getDate();
  const unavailable = new Set(unavailableDates);
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDayOffset + 1;
    if (day < 1 || day > monthLength) return null;
    const date = new Date(year, monthNumber - 1, day);
    const key = dateKey(date);
    return {
      date,
      key,
      blocked: loading || Boolean(error) || key < minDate || unavailable.has(key),
    };
  });

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const changeMonth = (offset) => {
    const nextMonth = new Date(year, monthNumber - 1 + offset, 1);
    onMonthChange(monthKey(nextMonth));
  };
  const previousMonthDisabled = month <= minDate.slice(0, 7);

  return (
    <div className="availability-picker" ref={containerRef}>
      <div className="wizard-picker">
        <input
          type="text"
          value={displayDate(value)}
          placeholder="Choose a date"
          readOnly
          aria-label="Pick-up date"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        />
        <button type="button" aria-label="Open date calendar" onClick={() => setOpen((current) => !current)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
        </button>
      </div>
      {open && (
        <div className="availability-picker__calendar" role="dialog" aria-label="Choose pick-up date">
          <div className="availability-picker__header">
            <button type="button" aria-label="Previous month" disabled={previousMonthDisabled} onClick={() => changeMonth(-1)}><IconChevronLeft /></button>
            <strong>{new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(monthDate)}</strong>
            <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}><IconChevronRight /></button>
          </div>
          <div className="availability-picker__grid" aria-hidden="true">
            {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="availability-picker__grid">
            {cells.map((cell, index) => cell ? (
              <button
                type="button"
                key={cell.key}
                className={`${cell.blocked ? "is-unavailable" : ""}${cell.key === value ? " is-selected" : ""}`}
                disabled={cell.blocked}
                aria-label={new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(cell.date)}
                aria-pressed={cell.key === value}
                onClick={() => {
                  onChange(cell.key);
                  setOpen(false);
                }}
              >
                {cell.date.getDate()}
              </button>
            ) : <span key={`empty-${index}`} />)}
          </div>
          <p>{loading ? "Checking vehicle availability..." : error ? "Availability could not be checked. Retry below or choose no specific vehicle." : "Grey dates are unavailable. Each vehicle is reserved for the full date (Europe/Rome)."}</p>
        </div>
      )}
    </div>
  );
}
