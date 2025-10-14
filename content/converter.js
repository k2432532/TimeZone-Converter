/**
 * TimeZone Converter V2
 * Enhanced to work with the new DateTimeDetector V2.0
 * Supports: natural language, relative time, confidence scores, UTC offsets
 */

class TimeZoneConverter {
  constructor() {
    // Extended timezone display mappings (matching detector.js)
    this.timezoneDisplay = {
      'America/New_York': 'EST/EDT',
      'America/Chicago': 'CST/CDT',
      'America/Denver': 'MST/MDT',
      'America/Los_Angeles': 'PST/PDT',
      'America/Anchorage': 'AKST/AKDT',
      'Pacific/Honolulu': 'HST',
      'UTC': 'UTC',
      'Europe/London': 'GMT/BST',
      'Europe/Paris': 'CET/CEST',
      'Europe/Berlin': 'CET/CEST',
      'Europe/Rome': 'CET/CEST',
      'Europe/Madrid': 'CET/CEST',
      'Europe/Moscow': 'MSK',
      'Europe/Istanbul': 'EET/EEST',
      'Asia/Dubai': 'GST',
      'Asia/Kolkata': 'IST',
      'Asia/Bangkok': 'ICT',
      'Asia/Singapore': 'SGT',
      'Asia/Shanghai': 'CST',
      'Asia/Hong_Kong': 'HKT',
      'Asia/Tokyo': 'JST',
      'Asia/Seoul': 'KST',
      'Australia/Sydney': 'AEST/AEDT',
      'Australia/Melbourne': 'AEST/AEDT',
      'Australia/Perth': 'AWST',
      'Pacific/Auckland': 'NZST/NZDT',
      'America/Sao_Paulo': 'BRT',
      'America/Buenos_Aires': 'ART',
      'Africa/Cairo': 'EET',
      'Africa/Johannesburg': 'SAST',
      'Africa/Lagos': 'WAT'
    };
  }

  /**
   * Convert parsed date/time to target timezone
   * Enhanced to handle new detector features
   * @param {Object} parsed - Parsed date/time object from detector V2
   * @param {string} targetTimezone - IANA timezone to convert to
   * @returns {Object} Conversion result with confidence and metadata
   */
  convert(parsed, targetTimezone) {
    if (!parsed || !parsed.time) {
      return null;
    }

    try {
      // Handle UTC offset format specially
      if (parsed.timezone?.offset !== undefined) {
        return this.convertFromUTCOffset(parsed, targetTimezone);
      }

      // Handle relative time (already calculated as future date)
      if (parsed.relative) {
        return this.convertRelativeTime(parsed, targetTimezone);
      }

      // Standard conversion
      const sourceDate = this.buildDate(parsed);
      const sourceTimezone = parsed.timezone?.iana || 
                            Intl.DateTimeFormat().resolvedOptions().timeZone;

      const sourceDateInTZ = this.getDateInTimezone(sourceDate, sourceTimezone);
      const targetDateInTZ = this.getDateInTimezone(sourceDate, targetTimezone);

      const sourceFormatted = this.formatDateTime(sourceDateInTZ, sourceTimezone, parsed);
      const targetFormatted = this.formatDateTime(targetDateInTZ, targetTimezone, parsed);

      return {
        source: {
          datetime: sourceFormatted,
          timezone: parsed.timezone?.display || this.getTimezoneDisplay(sourceTimezone),
          timezoneIANA: sourceTimezone,
          raw: sourceDateInTZ
        },
        target: {
          datetime: targetFormatted,
          timezone: this.getTimezoneDisplay(targetTimezone),
          timezoneIANA: targetTimezone,
          raw: targetDateInTZ
        },
        originalText: parsed.fullText || '',
        confidence: parsed.confidence || null,
        inferred: this.getInferredInfo(parsed),
        metadata: this.getMetadata(parsed)
      };
    } catch (error) {
      console.error('[Converter] Conversion error:', error);
      return null;
    }
  }

  /**
   * Convert from UTC offset format
   */
  convertFromUTCOffset(parsed, targetTimezone) {
    try {
      // Build date from parsed components
      const { date, time } = parsed;
      const year = date?.year || new Date().getFullYear();
      const month = date?.month || new Date().getMonth() + 1;
      const day = date?.day || new Date().getDate();

      // Create UTC date first
      const utcDate = new Date(Date.UTC(
        year, month - 1, day,
        time.hours, time.minutes || 0, time.seconds || 0
      ));

      // Adjust for the UTC offset
      const offsetMinutes = parsed.timezone.offset;
      const adjustedDate = new Date(utcDate.getTime() - (offsetMinutes * 60000));

      // Get components in target timezone
      const targetDateInTZ = this.getDateInTimezone(adjustedDate, targetTimezone);
      const sourceFormatted = this.formatDateTime(
        { year, month, day, hours: time.hours, minutes: time.minutes || 0 },
        'UTC',
        parsed
      );
      const targetFormatted = this.formatDateTime(targetDateInTZ, targetTimezone, parsed);

      return {
        source: {
          datetime: sourceFormatted,
          timezone: parsed.timezone.display,
          timezoneIANA: 'UTC',
          raw: { year, month, day, hours: time.hours, minutes: time.minutes || 0 }
        },
        target: {
          datetime: targetFormatted,
          timezone: this.getTimezoneDisplay(targetTimezone),
          timezoneIANA: targetTimezone,
          raw: targetDateInTZ
        },
        originalText: parsed.fullText || '',
        confidence: parsed.confidence || null,
        inferred: this.getInferredInfo(parsed),
        metadata: { type: 'utc_offset', offset: offsetMinutes }
      };
    } catch (error) {
      console.error('[Converter] UTC offset conversion error:', error);
      return null;
    }
  }

  /**
   * Convert relative time (already calculated by detector)
   */
  convertRelativeTime(parsed, targetTimezone) {
    try {
      // parsed.date and parsed.time already contain the calculated future time
      const sourceTimezone = parsed.timezone?.iana || 
                           Intl.DateTimeFormat().resolvedOptions().timeZone;

      const sourceDate = this.buildDate(parsed);
      const sourceDateInTZ = this.getDateInTimezone(sourceDate, sourceTimezone);
      const targetDateInTZ = this.getDateInTimezone(sourceDate, targetTimezone);

      const sourceFormatted = this.formatDateTime(sourceDateInTZ, sourceTimezone, parsed);
      const targetFormatted = this.formatDateTime(targetDateInTZ, targetTimezone, parsed);

      return {
        source: {
          datetime: sourceFormatted,
          timezone: parsed.timezone?.display || this.getTimezoneDisplay(sourceTimezone),
          timezoneIANA: sourceTimezone,
          raw: sourceDateInTZ
        },
        target: {
          datetime: targetFormatted,
          timezone: this.getTimezoneDisplay(targetTimezone),
          timezoneIANA: targetTimezone,
          raw: targetDateInTZ
        },
        originalText: parsed.fullText || '',
        confidence: parsed.confidence || null,
        inferred: this.getInferredInfo(parsed),
        metadata: {
          type: 'relative_time',
          amount: parsed.relativeAmount,
          unit: parsed.relativeUnit
        }
      };
    } catch (error) {
      console.error('[Converter] Relative time conversion error:', error);
      return null;
    }
  }

  /**
   * Build JavaScript Date object from parsed components
   * FIXED: Properly create date in the specified timezone
   */
  buildDate(parsed) {
    const { date, time } = parsed;
    
    const year = date?.year || new Date().getFullYear();
    const month = date?.month || new Date().getMonth() + 1;
    const day = date?.day || new Date().getDate();

    const hours = time.hours;
    const minutes = time.minutes || 0;
    const seconds = time.seconds || 0;

    const sourceTimezone = parsed.timezone?.iana || 
                          Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Create a date string in ISO format WITHOUT timezone (local time)
    // For "11 Oct 7 PM EST", this would be "2025-10-11 19:00:00"
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ` +
                       `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Create a Date by parsing this string in the SOURCE timezone context
    // We do this by finding what UTC time corresponds to this local time in the source TZ
    
    // Method: Create a formatter for the source timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: sourceTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Start with a UTC date matching our values
    const testDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    
    // See what time this appears as in the source timezone
    const parts = formatter.formatToParts(testDate);
    const observed = {};
    parts.forEach(p => {
      if (p.type !== 'literal') observed[p.type] = parseInt(p.value);
    });
    
    // Calculate the difference (in minutes) between what we want and what we observed
    const desiredMinutes = (day * 24 * 60) + (hours * 60) + minutes;
    const observedMinutes = (observed.day * 24 * 60) + (observed.hour * 60) + observed.minute;
    const diffMinutes = desiredMinutes - observedMinutes;
    
    // Adjust the UTC date by the difference to get the correct date
    const correctDate = new Date(testDate.getTime() + (diffMinutes * 60 * 1000));
    
    return correctDate;
  }
  
  /**
   * Helper to extract parts from Intl.DateTimeFormat
   */
  getFormatterParts(parts) {
    const result = {};
    parts.forEach(part => {
      if (part.type !== 'literal') {
        result[part.type] = parseInt(part.value);
      }
    });
    return result;
  }

  /**
   * Get date components in specific timezone
   */
  getDateInTimezone(date, timezone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(date);
    const dateObj = {};
    
    for (const part of parts) {
      if (part.type !== 'literal') {
        dateObj[part.type] = part.value;
      }
    }

    return {
      year: parseInt(dateObj.year),
      month: parseInt(dateObj.month),
      day: parseInt(dateObj.day),
      hours: parseInt(dateObj.hour),
      minutes: parseInt(dateObj.minute),
      seconds: parseInt(dateObj.second)
    };
  }

  /**
   * Format date/time for display
   */
  formatDateTime(dateObj, timezone, parsed) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const month = months[dateObj.month - 1];
    const day = dateObj.day;
    const year = dateObj.year;

    // Format time in 12-hour format
    let hours = dateObj.hours;
    const minutes = String(dateObj.minutes).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;

    // Always show date for context
    return `${month} ${day}, ${year} ${hours}:${minutes} ${period}`;
  }

  /**
   * Get timezone display abbreviation
   */
  getTimezoneDisplay(iana) {
    return this.timezoneDisplay[iana] || iana.split('/').pop().replace(/_/g, ' ');
  }

  /**
   * Get information about what was inferred
   */
  getInferredInfo(parsed) {
    const inferred = [];

    if (parsed.date?.inferred) {
      inferred.push('Date (using today)');
    }

    if (parsed.date?.relative) {
      const ref = parsed.originalReference || parsed.weekdayReference || 'relative';
      inferred.push(`Date (from "${ref}")`);
    }

    if (!parsed.hasTimezone) {
      inferred.push('Source timezone (using browser default)');
    }

    if (parsed.naturalLanguage) {
      inferred.push(`Natural language: "${parsed.originalReference}"`);
    }

    if (parsed.relative) {
      inferred.push(`Relative time: ${parsed.relativeAmount} ${parsed.relativeUnit} from now`);
    }

    return inferred.length > 0 ? inferred : null;
  }

  /**
   * Get metadata about the detection
   */
  getMetadata(parsed) {
    return {
      hasNaturalLanguage: !!parsed.naturalLanguage,
      isRelativeTime: !!parsed.relative,
      hasConfidence: parsed.confidence !== undefined,
      confidence: parsed.confidence || null,
      weekdayBased: !!parsed.weekdayReference,
      hasUTCOffset: parsed.timezone?.offset !== undefined
    };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.TimeZoneConverter = TimeZoneConverter;
}

// Export for Node.js/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimeZoneConverter;
}