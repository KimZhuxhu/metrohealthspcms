import { format, formatDistanceToNow, parseISO, addMinutes, parse, isAfter, isBefore, startOfDay, addDays, getDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const EST_TIMEZONE = 'America/New_York';

export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Get current date and time in EST timezone
 */
export function getCurrentDateEST(): Date {
  return toZonedTime(new Date(), EST_TIMEZONE);
}

/**
 * Get today's date at midnight in EST timezone
 */
export function getTodayEST(): Date {
  const now = getCurrentDateEST();
  return startOfDay(now);
}

/**
 * Check if a time slot (date + time) is in the past
 * @param date - Date string (YYYY-MM-DD)
 * @param time - Time string (HH:mm)
 * @param bufferMinutes - Optional buffer in minutes (default: 30)
 */
export function isTimeSlotInPast(date: string, time: string, bufferMinutes: number = 30): boolean {
  try {
    // Parse the date and time
    const dateTime = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
    const slotTime = fromZonedTime(dateTime, EST_TIMEZONE);
    
    // Get current time in EST
    const now = getCurrentDateEST();
    const nowWithBuffer = addMinutes(now, bufferMinutes);
    
    return isBefore(slotTime, nowWithBuffer);
  } catch (error) {
    console.error('Error checking if time slot is in past:', error);
    return false;
  }
}

/**
 * Add minutes to a time string (HH:mm)
 * @param time - Time string (HH:mm)
 * @param minutes - Minutes to add
 * @returns New time string (HH:mm)
 */
export function addMinutesToTime(time: string, minutes: number): string {
  try {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins, 0, 0);
    const newDate = addMinutes(date, minutes);
    return format(newDate, 'HH:mm');
  } catch (error) {
    console.error('Error adding minutes to time:', error);
    return time;
  }
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const day = getDay(dateObj);
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Generate time slots for a given date
 * @param startTime - Start time (HH:mm)
 * @param endTime - End time (HH:mm)
 * @param interval - Interval in minutes (default: 30)
 */
export function generateTimeSlots(startTime: string, endTime: string, interval: number = 30): string[] {
  const slots: string[] = [];
  let currentTime = startTime;
  
  while (currentTime < endTime) {
    slots.push(currentTime);
    currentTime = addMinutesToTime(currentTime, interval);
  }
  
  return slots;
}

/**
 * Format date for input[type="date"]
 */
export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Get date N days from now
 */
export function getDaysFromNow(days: number): Date {
  return addDays(getCurrentDateEST(), days);
}

/**
 * Combine date and time strings into ISO string
 */
export function combineDateAndTime(date: string, time: string): string {
  const dateTime = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
  return dateTime.toISOString();
}

/**
 * Check if date1 is after date2
 */
export function isDateAfter(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isAfter(d1, d2);
}
