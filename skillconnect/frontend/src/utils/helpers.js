// utils/helpers.js — Shared utility functions

import { formatDistanceToNow, format } from 'date-fns'

/** Format date as "2 hours ago" */
export const timeAgo = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

/** Format date as "Jan 15, 2024" */
export const formatDate = (date) => {
  if (!date) return ''
  return format(new Date(date), 'MMM d, yyyy')
}

/** Format salary range */
export const formatSalary = (min, max, currency = 'INR', period = 'yearly') => {
  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n)
  const sym = '₹' // Force Rupees
  const per = period === 'yearly' ? '/yr' : period === 'monthly' ? '/mo' : '/hr'
  if (!min && !max) return 'Salary not disclosed'
  if (!max) return `${sym}${fmt(min)}+${per}`
  return `${sym}${fmt(min)} – ${sym}${fmt(max)}${per}`
}

/** Get initials from name */
export const getInitials = (firstName, lastName) => {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()
}

/** Application status color mapping */
export const statusColor = {
  pending:     'badge-slate',
  reviewing:   'badge-blue',
  shortlisted: 'badge-orange',
  interview:   'badge-orange',
  offered:     'badge-green',
  rejected:    'badge-red',
}

/** Work type badge color */
export const workTypeColor = {
  remote:  'badge-green',
  onsite:  'badge-blue',
  hybrid:  'badge-orange',
}

/** Experience level labels */
export const expLevelLabel = {
  entry:     'Entry Level',
  mid:       'Mid Level',
  senior:    'Senior',
  lead:      'Lead',
  executive: 'Executive',
}

/** Truncate text */
export const truncate = (str, n = 120) => {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

/** Debounce function */
export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
