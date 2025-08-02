import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import crypto from "crypto"


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex")
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex")
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function calculateCycleDay(lastPeriodDate, cycleLength) {
  const today = new Date()
  const lastPeriod = new Date(lastPeriodDate)
  const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24))

  return (daysSinceLastPeriod % cycleLength) + 1
}

export function predictNextPeriod(lastPeriodDate, cycleLength) {
  const lastPeriod = new Date(lastPeriodDate)
  const nextPeriod = new Date(lastPeriod)
  nextPeriod.setDate(nextPeriod.getDate() + cycleLength)

  return nextPeriod
}

export function calculateOvulationDate(lastPeriodDate, cycleLength) {
  const lastPeriod = new Date(lastPeriodDate)
  const ovulationDate = new Date(lastPeriod)
  ovulationDate.setDate(ovulationDate.getDate() + Math.floor(cycleLength / 2))

  return ovulationDate
}
