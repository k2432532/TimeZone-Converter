/**
 * Enhanced Date/Time Detection Engine V2.0
 * Features:
 * - Natural language processing (tomorrow, next week, in 2 hours)
 * - Shortform detection (tmrw, mon, tue, hrs, mins)
 * - Smart timezone inference
 * - Performance optimized with caching
 * - Confidence scoring
 * - Multiple match detection
 */

class DateTimeDetector {
  constructor() {
    // Performance cache
    this.cache = new Map();
    this.cacheMaxSize = 100;
    
    // Timezone abbreviation mappings (expanded)
    this.timezoneMap = {
      // North America
      'EST': 'America/New_York', 'EDT': 'America/New_York',
      'Eastern Time': 'America/New_York', 'Eastern': 'America/New_York',
      'ET': 'America/New_York', 'eastern': 'America/New_York',
      
      'CST': 'America/Chicago', 'CDT': 'America/Chicago',
      'Central Time': 'America/Chicago', 'Central': 'America/Chicago',
      'CT': 'America/Chicago', 'central': 'America/Chicago',
      
      'MST': 'America/Denver', 'MDT': 'America/Denver',
      'Mountain Time': 'America/Denver', 'Mountain': 'America/Denver',
      'MT': 'America/Denver', 'mountain': 'America/Denver',
      
      'PST': 'America/Los_Angeles', 'PDT': 'America/Los_Angeles',
      'Pacific Time': 'America/Los_Angeles', 'Pacific': 'America/Los_Angeles',
      'PT': 'America/Los_Angeles', 'pacific': 'America/Los_Angeles',
      
      'AKST': 'America/Anchorage', 'AKDT': 'America/Anchorage',
      'Alaska Time': 'America/Anchorage', 'Alaska': 'America/Anchorage',
      
      'HST': 'Pacific/Honolulu', 'Hawaii Time': 'Pacific/Honolulu',
      
      // Global timezones
      'GMT': 'UTC', 'UTC': 'UTC', 'Zulu': 'UTC',
      'BST': 'Europe/London', 'British Time': 'Europe/London',
      'CET': 'Europe/Paris', 'CEST': 'Europe/Paris',
      'IST': 'Asia/Kolkata', 'India': 'Asia/Kolkata', 'Indian Time': 'Asia/Kolkata',
      'JST': 'Asia/Tokyo', 'Japan': 'Asia/Tokyo', 'Japan Time': 'Asia/Tokyo',
      'AEST': 'Australia/Sydney', 'AEDT': 'Australia/Sydney',
      'Australian Eastern': 'Australia/Sydney',
      'SGT': 'Asia/Singapore', 'Singapore': 'Asia/Singapore',
      'HKT': 'Asia/Hong_Kong', 'Hong Kong': 'Asia/Hong_Kong',
      'KST': 'Asia/Seoul', 'Korea': 'Asia/Seoul',
      'MSK': 'Europe/Moscow', 'Moscow': 'Europe/Moscow',
      'EET': 'Europe/Istanbul', 'EEST': 'Europe/Istanbul',
      'WAT': 'Africa/Lagos', 'CAT': 'Africa/Johannesburg',
      'NZST': 'Pacific/Auckland', 'NZDT': 'Pacific/Auckland',
      'New Zealand': 'Pacific/Auckland',
      
      // City-based (common usage)
      'New York time': 'America/New_York', 'NY time': 'America/New_York',
      'LA time': 'America/Los_Angeles', 'Los Angeles time': 'America/Los_Angeles',
      'Chicago time': 'America/Chicago',
      'London time': 'Europe/London',
      'Paris time': 'Europe/Paris',
      'Tokyo time': 'Asia/Tokyo',
      'Sydney time': 'Australia/Sydney'
    };

    // Display abbreviations
    this.timezoneDisplay = {
      'America/New_York': 'EST/EDT', 'America/Chicago': 'CST/CDT',
      'America/Denver': 'MST/MDT', 'America/Los_Angeles': 'PST/PDT',
      'America/Anchorage': 'AKST/AKDT', 'Pacific/Honolulu': 'HST',
      'UTC': 'UTC', 'Europe/London': 'GMT/BST', 'Europe/Paris': 'CET/CEST',
      'Asia/Kolkata': 'IST', 'Asia/Tokyo': 'JST', 'Australia/Sydney': 'AEST/AEDT'
    };

    // Natural language date mappings
    this.relativeDays = {
      'today': 0, 'tonight': 0, 'tn': 0, 'tdy': 0,
      'tomorrow': 1, 'tmrw': 1, 'tmr': 1, 'tom': 1, 'tmrrw': 1,
      'yesterday': -1, 'yest': -1, 'yday': -1
    };

    this.weekdayMap = {
      'monday': 1, 'mon': 1, 'tuesday': 2, 'tue': 2, 'tues': 2,
      'wednesday': 3, 'wed': 3, 'thursday': 4, 'thu': 4, 'thur': 4, 'thurs': 4,
      'friday': 5, 'fri': 5, 'saturday': 6, 'sat': 6, 
      'sunday': 0, 'sun': 0
    };

    this.timeUnits = {
      'hour': 'hours', 'hours': 'hours', 'hr': 'hours', 'hrs': 'hours', 'h': 'hours',
      'minute': 'minutes', 'minutes': 'minutes', 'min': 'minutes', 'mins': 'minutes', 'm': 'minutes',
      'second': 'seconds', 'seconds': 'seconds', 'sec': 'seconds', 'secs': 'seconds', 's': 'seconds',
      'day': 'days', 'days': 'days', 'd': 'days',
      'week': 'weeks', 'weeks': 'weeks', 'wk': 'weeks', 'wks': 'weeks', 'w': 'weeks'
    };

    // Build optimized patterns
    this.patterns = this.buildPatterns();
  }

  buildPatterns() {
    // Build timezone pattern (sorted by length for greedy matching)
    const tzKeys = Object.keys(this.timezoneMap)
      .map(tz => tz.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .sort((a, b) => b.length - a.length)
      .join('|');

    // Build weekday pattern
    const weekdays = Object.keys(this.weekdayMap).join('|');
    
    // Build relative day pattern
    const relativeDays = Object.keys(this.relativeDays).join('|');

    return [
      // Natural language: "tomorrow at 3pm EST", "next Monday 10am PST"
      {
        pattern: new RegExp(
          `\\b(next\\s+(?:${weekdays})|${relativeDays})\\s*(?:at|@)?\\s*` +
          `((?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\\s*(?:AM|PM|am|pm|a\\.?m\\.?|p\\.?m\\.?)|` +
          `(?:2[0-3]|[01]?[0-9]):[0-5][0-9])\\s*` +
          `(?:in\\s+)?(${tzKeys})?`,
          'gi'
        ),
        type: 'natural_datetime_tz',
        priority: 1
      },

      // Relative time: "in 2 hours EST", "30 mins from now PST"
      {
        pattern: new RegExp(
          `\\b(?:in|after)\\s+(\\d+)\\s*(${Object.keys(this.timeUnits).join('|')})\\s*` +
          `(?:from\\s+now)?\\s*(?:in\\s+)?(${tzKeys})?`,
          'gi'
        ),
        type: 'relative_time_tz',
        priority: 2
      },

      // REVERSE FORMAT: "7:30 PM EST on 13th Oct" or "3pm PST on October 15"
      {
        pattern: new RegExp(
          `((?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\\s*(?:AM|PM|am|pm|a\\.?m\\.?|p\\.?m\\.?)|` +
          `(?:2[0-3]|[01]?[0-9]):[0-5][0-9])\\s*` +
          `(?:in\\s+)?(${tzKeys})\\s+` +
          `(?:on\\s+)?` +
          `(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?\\s+)?` +
          `(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?)?(?:,?\\s+\\d{4})?`,
          'gi'
        ),
        type: 'time_tz_on_date',
        priority: 3
      },

      // DAY-MONTH-TIME-TZ FORMAT: "11 Oct 7 PM EST", "15 December 3:30 PM PST"
      {
        pattern: new RegExp(
          `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+` +
          `(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?` +
          `(?:,?\\s+(\\d{4}))?\\s+` +
          `((?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\\s*(?:AM|PM|am|pm|a\\.?m\\.?|p\\.?m\\.?)|` +
          `(?:2[0-3]|[01]?[0-9]):[0-5][0-9])\\s*` +
          `(?:in\\s+)?(${tzKeys})`,
          'gi'
        ),
        type: 'day_month_time_tz',
        priority: 3
      },

      // UTC offset format: "10:30 +05:30", "2pm UTC+8"
      {
        pattern: /\b((?:1[0-2]|0?[1-9])(?::[0-5][0-9])?(?::[0-5][0-9])?\s*(?:AM|PM|am|pm)|(?:2[0-3]|[01]?[0-9]):[0-5][0-9](?::[0-5][0-9])?)\s*(?:UTC|GMT)?\s*([+-]\d{1,2}:?\d{2})\b/gi,
        type: 'time_utc_offset',
        priority: 4
      },

      // Standard: "Oct 9, 2025 at 10:30 AM EST"
      {
        pattern: new RegExp(
          `\\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}|` +
          `\\d{4}-\\d{2}-\\d{2}|\\d{1,2}/\\d{1,2}/\\d{2,4})` +
          `\\s*(?:at|@)?\\s*` +
          `((?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\\s*(?:AM|PM|am|pm)|(?:2[0-3]|[01]?[0-9]):[0-5][0-9])` +
          `\\s*(?:in\\s+)?(${tzKeys})?`,
          'gi'
        ),
        type: 'datetime_with_tz',
        priority: 5
      },

      // Time with timezone: "10:30 AM EST", "3pm pacific"
      {
        pattern: new RegExp(
          `\\b((?:1[0-2]|0?[1-9])(?::[0-5][0-9])?(?::[0-5][0-9])?\\s*(?:AM|PM|am|pm|a\\.?m\\.?|p\\.?m\\.?)|` +
          `(?:2[0-3]|[01]?[0-9]):[0-5][0-9](?::[0-5][0-9])?|noon|midnight)\\s*` +
          `(?:in\\s+)?(${tzKeys})`,
          'gi'
        ),
        type: 'time_with_tz',
        priority: 6
      },

      // Standalone weekday with time: "Monday 3pm", "next Friday at 10am"
      {
        pattern: new RegExp(
          `\\b(next\\s+)?(${weekdays})\\s*(?:at|@)?\\s*` +
          `((?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\\s*(?:AM|PM|am|pm)|(?:2[0-3]|[01]?[0-9]):[0-5][0-9])`,
          'gi'
        ),
        type: 'weekday_time',
        priority: 7
      },

      // Time only (no timezone)
      {
        pattern: /\b((?:1[0-2]|0?[1-9])(?::[0-5][0-9])?(?::[0-5][0-9])?\s*(?:AM|PM|am|pm|a\.?m\.?|p\.?m\.?)|(?:2[0-3]|[01]?[0-9]):[0-5][0-9](?::[0-5][0-9])?|noon|midnight)\b/gi,
        type: 'time_only',
        priority: 8
      }
    ];
  }

  /**
   * Detect all date/time patterns in text (optimized with caching)
   * @param {string} text - Text to search
   * @param {boolean} findAll - Find all matches (default: false, returns first match)
   * @returns {Object|Array|null} Detection result(s)
   */
  detect(text, findAll = false) {
    if (!text || typeof text !== 'string') return null;
    
    // Performance: limit text length
    if (text.length > 5000) {
      text = text.substring(0, 5000);
    }

    // Check cache
    const cacheKey = `${text}_${findAll}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const results = [];
    const processedRanges = []; // Avoid overlapping matches

    // Sort patterns by priority
    const sortedPatterns = [...this.patterns].sort((a, b) => a.priority - b.priority);

    for (const { pattern, type } of sortedPatterns) {
      pattern.lastIndex = 0; // Reset regex
      
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        // Skip if overlaps with higher priority match
        if (this.hasOverlap(processedRanges, start, end)) {
          continue;
        }

        const result = {
          matched: match[0],
          type: type,
          start: start,
          end: end,
          confidence: this.calculateConfidence(type, match[0])
        };

        // Parse the match
        result.parsed = this.parseByType(match, type);
        
        if (result.parsed) {
          results.push(result);
          processedRanges.push([start, end]);

          if (!findAll) {
            // Early exit for performance
            this.updateCache(cacheKey, result);
            return result;
          }
        }

        // Prevent infinite loops
        if (pattern.lastIndex === start) {
          pattern.lastIndex++;
        }
      }
    }

    const finalResult = findAll ? (results.length > 0 ? results : null) : null;
    this.updateCache(cacheKey, finalResult);
    return finalResult;
  }

  /**
   * Check if range overlaps with existing ranges
   */
  hasOverlap(ranges, start, end) {
    return ranges.some(([s, e]) => 
      (start >= s && start < e) || (end > s && end <= e) || (start <= s && end >= e)
    );
  }

  /**
   * Calculate confidence score (0-100)
   */
  calculateConfidence(type, matchedText) {
    let confidence = 50; // Base confidence

    // Higher confidence for specific patterns
    if (type === 'natural_datetime_tz') confidence = 95;
    else if (type === 'time_tz_on_date') confidence = 92;
    else if (type === 'day_month_time_tz') confidence = 93;
    else if (type === 'datetime_with_tz') confidence = 90;
    else if (type === 'time_with_tz') confidence = 85;
    else if (type === 'time_utc_offset') confidence = 88;
    else if (type === 'relative_time_tz') confidence = 92;
    else if (type === 'weekday_time') confidence = 75;
    else if (type === 'time_only') confidence = 60;

    // Boost confidence if timezone is present
    if (matchedText.match(/EST|PST|CST|MST|GMT|UTC|IST|JST/i)) {
      confidence += 5;
    }

    // Boost confidence if AM/PM is present
    if (matchedText.match(/\b(?:AM|PM|am|pm)\b/i)) {
      confidence += 5;
    }

    return Math.min(100, confidence);
  }

  /**
   * Parse match based on type
   */
  parseByType(match, type) {
    switch (type) {
      case 'natural_datetime_tz':
        return this.parseNaturalDateTime(match);
      case 'relative_time_tz':
        return this.parseRelativeTime(match);
      case 'time_tz_on_date':
        return this.parseTimeTzOnDate(match);
      case 'day_month_time_tz':
        return this.parseDayMonthTimeTz(match);
      case 'time_utc_offset':
        return this.parseUTCOffset(match);
      case 'datetime_with_tz':
        return this.parseMatch(match, type);
      case 'time_with_tz':
        return this.parseMatch(match, type);
      case 'weekday_time':
        return this.parseWeekdayTime(match);
      case 'time_only':
        return this.parseTimeOnly(match[0]);
      default:
        return null;
    }
  }

  /**
   * Parse natural language datetime: "tomorrow at 3pm EST"
   * FIXED: Calculate "tomorrow" relative to the SPECIFIED timezone, not browser timezone
   */
  parseNaturalDateTime(match) {
    const fullText = match[0].toLowerCase();
    const dayRef = match[1].toLowerCase();
    const timeStr = match[2];
    const tzStr = match[3];

    // Get timezone first (needed for correct date calculation)
    const timezone = tzStr ? this.getTimezone(tzStr) : null;
    
    // Calculate date from relative/weekday reference
    // Pass timezone so "tomorrow" is calculated in the SENDER's timezone
    let date = this.calculateDateFromReference(dayRef, timezone?.iana);
    
    // Parse time
    const time = this.parseTime(timeStr);

    return {
      time,
      timezone,
      date,
      hasDate: true,
      hasTime: !!time,
      hasTimezone: !!timezone,
      naturalLanguage: true,
      originalReference: dayRef
    };
  }

  /**
   * Parse relative time: "in 2 hours EST"
   * FIXED: Calculate relative time from "now" in the specified timezone
   */
  parseRelativeTime(match) {
    const amount = parseInt(match[1]);
    const unitStr = match[2].toLowerCase();
    const tzStr = match[3];
    
    const unit = this.timeUnits[unitStr];
    
    // Get timezone first
    const timezone = tzStr ? this.getTimezone(tzStr) : null;
    
    // Get "now" in the specified timezone (or browser timezone)
    const now = timezone?.iana ? this.getNowInTimezone(timezone.iana) : new Date();
    
    // Calculate future time
    let targetTime = new Date(now);
    switch (unit) {
      case 'hours': targetTime.setHours(now.getHours() + amount); break;
      case 'minutes': targetTime.setMinutes(now.getMinutes() + amount); break;
      case 'seconds': targetTime.setSeconds(now.getSeconds() + amount); break;
      case 'days': targetTime.setDate(now.getDate() + amount); break;
      case 'weeks': targetTime.setDate(now.getDate() + (amount * 7)); break;
    }

    return {
      time: {
        hours: targetTime.getHours(),
        minutes: targetTime.getMinutes(),
        seconds: targetTime.getSeconds()
      },
      date: {
        year: targetTime.getFullYear(),
        month: targetTime.getMonth() + 1,
        day: targetTime.getDate()
      },
      timezone: tzStr ? this.getTimezone(tzStr) : null,
      hasDate: true,
      hasTime: true,
      hasTimezone: !!tzStr,
      relative: true,
      relativeAmount: amount,
      relativeUnit: unit
    };
  }

  /**
   * Parse time with timezone on date: "7:30 PM EST on 13th Oct"
   * Pattern captures: timeStr, tzStr, dayNumber
   */
  parseTimeTzOnDate(match) {
    const timeStr = match[1];
    const tzStr = match[2];
    const dayNumber = parseInt(match[3]);
    
    // Parse time
    const time = this.parseTime(timeStr);
    
    // Get timezone
    const timezone = tzStr ? this.getTimezone(tzStr) : null;
    
    // Parse date - extract month from the full match if present
    const fullMatch = match[0];
    let month = null;
    let year = null;
    
    // Check for month name in the match
    const monthMatch = fullMatch.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*/i);
    if (monthMatch) {
      const monthMap = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
      };
      month = monthMap[monthMatch[1].toLowerCase().substring(0, 3)];
    }
    
    // Check for year in the match
    const yearMatch = fullMatch.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[1]);
    }
    
    // If no month found, try to infer from context
    const now = new Date();
    if (!month) {
      month = now.getMonth() + 1;
    }
    if (!year) {
      year = now.getFullYear();
      
      // If the day has passed this month, assume next month or next year
      if (month === now.getMonth() + 1 && dayNumber < now.getDate()) {
        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
      }
    }
    
    const date = {
      year: year,
      month: month,
      day: dayNumber,
      inferred: !monthMatch && !yearMatch
    };

    return {
      time,
      timezone,
      date,
      hasDate: true,
      hasTime: !!time,
      hasTimezone: !!timezone
    };
  }

  /**
   * Parse day-month-time-timezone format: "11 Oct 7 PM EST", "15 December 2025 3:30 PM PST"
   * Pattern captures: dayNumber, monthName, year (optional), timeStr, tzStr
   */
  parseDayMonthTimeTz(match) {
    const dayNumber = parseInt(match[1]);
    const monthName = match[2];
    const yearStr = match[3]; // May be undefined
    const timeStr = match[4];
    const tzStr = match[5];
    
    // Parse time
    const time = this.parseTime(timeStr);
    
    // Get timezone
    const timezone = tzStr ? this.getTimezone(tzStr) : null;
    
    // Parse month
    const monthMap = {
      'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    };
    const month = monthMap[monthName.toLowerCase().substring(0, 3)];
    
    // Parse or infer year
    const now = new Date();
    let year = yearStr ? parseInt(yearStr) : now.getFullYear();
    
    // If no year provided and the date has passed this year, assume next year
    if (!yearStr) {
      const thisYearDate = new Date(year, month - 1, dayNumber);
      if (thisYearDate < now) {
        year++;
      }
    }
    
    const date = {
      year: year,
      month: month,
      day: dayNumber,
      inferred: !yearStr
    };

    return {
      time,
      timezone,
      date,
      hasDate: true,
      hasTime: !!time,
      hasTimezone: !!timezone
    };
  }

  /**
   * Parse UTC offset: "10:30 +05:30"
   */
  parseUTCOffset(match) {
    const timeStr = match[1];
    const offsetStr = match[2];
    
    const time = this.parseTime(timeStr);
    const offset = this.parseUTCOffsetString(offsetStr);

    return {
      time,
      timezone: {
        abbreviation: `UTC${offsetStr}`,
        iana: 'UTC',
        offset: offset,
        display: `UTC${offsetStr}`
      },
      date: null,
      hasDate: false,
      hasTime: !!time,
      hasTimezone: true
    };
  }

  /**
   * Parse UTC offset string to minutes
   */
  parseUTCOffsetString(offsetStr) {
    const cleanOffset = offsetStr.replace(':', '');
    const sign = cleanOffset[0] === '-' ? -1 : 1;
    const hours = parseInt(cleanOffset.substring(1, 3));
    const minutes = cleanOffset.length > 3 ? parseInt(cleanOffset.substring(3)) : 0;
    return sign * (hours * 60 + minutes);
  }

  /**
   * Parse weekday time: "Monday 3pm", "next Friday at 10am"
   */
  parseWeekdayTime(match) {
    const isNext = !!match[1];
    const weekdayStr = match[2].toLowerCase();
    const timeStr = match[3];

    const targetWeekday = this.weekdayMap[weekdayStr];
    const date = this.calculateNextWeekday(targetWeekday, isNext);
    const time = this.parseTime(timeStr);

    return {
      time,
      date,
      timezone: null,
      hasDate: true,
      hasTime: !!time,
      hasTimezone: false,
      weekdayReference: weekdayStr,
      isNextWeek: isNext
    };
  }

  /**
   * Calculate date from relative reference
   * FIXED: If timezone provided, calculate "today"/"tomorrow" relative to THAT timezone
   * @param {string} dayRef - Reference like "today", "tomorrow", "next monday"
   * @param {string} timezone - Optional IANA timezone (e.g., "America/Los_Angeles")
   */
  calculateDateFromReference(dayRef, timezone = null) {
    // Get "now" in the specified timezone (or browser timezone if not specified)
    const now = timezone ? this.getNowInTimezone(timezone) : new Date();
    
    // Check if it's a relative day (today, tomorrow, etc.)
    for (const [key, offset] of Object.entries(this.relativeDays)) {
      if (dayRef.includes(key)) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + offset);
        return {
          year: targetDate.getFullYear(),
          month: targetDate.getMonth() + 1,
          day: targetDate.getDate(),
          relative: true,
          reference: key,
          calculatedInTimezone: timezone || 'browser'
        };
      }
    }

    // Check if it's a weekday reference
    if (dayRef.includes('next')) {
      const weekdayStr = dayRef.replace('next', '').trim();
      const targetWeekday = this.weekdayMap[weekdayStr];
      if (targetWeekday !== undefined) {
        return this.calculateNextWeekday(targetWeekday, true, timezone);
      }
    }

    // Default to today
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      inferred: true,
      calculatedInTimezone: timezone || 'browser'
    };
  }

  /**
   * Calculate next occurrence of weekday
   * FIXED: Support timezone parameter for correct date calculation
   * @param {number} targetWeekday - Target weekday (0=Sunday, 6=Saturday)
   * @param {boolean} isNext - Whether it's explicitly "next" week
   * @param {string} timezone - Optional IANA timezone
   */
  calculateNextWeekday(targetWeekday, isNext = false, timezone = null) {
    const now = timezone ? this.getNowInTimezone(timezone) : new Date();
    const currentWeekday = now.getDay();
    
    let daysToAdd = targetWeekday - currentWeekday;
    if (daysToAdd <= 0 || isNext) {
      daysToAdd += 7;
    }

    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysToAdd);

    return {
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1,
      day: targetDate.getDate(),
      weekday: targetWeekday,
      calculatedInTimezone: timezone || 'browser'
    };
  }

  /**
   * Get current date/time in a specific timezone
   * Returns a Date object representing "now" in that timezone
   * @param {string} timezone - IANA timezone (e.g., "America/Los_Angeles")
   * @returns {Date} Date object representing current time in that timezone
   */
  getNowInTimezone(timezone) {
    const now = new Date();
    
    // Get the date/time components in the target timezone
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

    const parts = formatter.formatToParts(now);
    const dateObj = {};
    
    for (const part of parts) {
      if (part.type !== 'literal') {
        dateObj[part.type] = parseInt(part.value);
      }
    }

    // Create a Date object representing this time
    // We create it as a local date since we're just using it for date math
    return new Date(
      dateObj.year,
      dateObj.month - 1,
      dateObj.day,
      dateObj.hour,
      dateObj.minute,
      dateObj.second
    );
  }

  /**
   * Parse matched date/time string (original logic)
   */
  parseMatch(match, type) {
    const fullText = match[0];
    let timeStr, tzStr, dateStr = null;

    if (type === 'datetime_with_tz') {
      const parts = fullText.match(/^(.+?)\s*(?:at|@)?\s*(.+?)\s+(?:in\s+)?([A-Z][A-Za-z\s]*?)$/i);
      if (parts) {
        dateStr = parts[1];
        timeStr = parts[2];
        tzStr = parts[3];
      }
    } else {
      timeStr = match[1];
      tzStr = match[2];
    }

    const time = this.parseTime(timeStr);
    const timezone = tzStr ? this.getTimezone(tzStr) : null;
    let date = null;
    if (dateStr) {
      date = this.parseDate(dateStr);
    }

    return {
      time,
      timezone,
      date,
      hasDate: !!date,
      hasTime: !!time,
      hasTimezone: !!timezone
    };
  }

  /**
   * Parse time string (handles 12h, 24h, noon, midnight, shortforms)
   */
  parseTime(timeStr) {
    if (!timeStr) return null;

    timeStr = timeStr.trim().toLowerCase().replace(/\./g, '');

    // Special cases
    if (timeStr === 'noon') return { hours: 12, minutes: 0, period: 'PM' };
    if (timeStr === 'midnight') return { hours: 0, minutes: 0, period: 'AM' };

    // 12-hour format (with flexible am/pm)
    const match12h = timeStr.match(/(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(am|pm|a|p)/i);
    if (match12h) {
      let hours = parseInt(match12h[1]);
      const minutes = parseInt(match12h[2] || '0');
      const seconds = parseInt(match12h[3] || '0');
      const period = match12h[4][0].toUpperCase() === 'P' ? 'PM' : 'AM';

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return { hours, minutes, seconds, period, format: '12h' };
    }

    // 24-hour format
    const match24h = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (match24h) {
      const hours = parseInt(match24h[1]);
      const minutes = parseInt(match24h[2]);
      const seconds = parseInt(match24h[3] || '0');
      return { hours, minutes, seconds, format: '24h' };
    }

    return null;
  }

  /**
   * Parse date string (enhanced with ordinals)
   */
  parseDate(dateStr) {
    if (!dateStr) return null;

    // ISO format: 2025-10-09
    const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return {
        year: parseInt(isoMatch[1]),
        month: parseInt(isoMatch[2]),
        day: parseInt(isoMatch[3]),
        format: 'iso'
      };
    }

    // Slash format: 10/09/2025 or 10/09/25
    const slashMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (slashMatch) {
      let year = parseInt(slashMatch[3]);
      if (year < 100) year += 2000; // Handle 2-digit years
      return {
        month: parseInt(slashMatch[1]),
        day: parseInt(slashMatch[2]),
        year: year,
        format: 'us'
      };
    }

    // Text month: Oct 9, 2025 or Oct 9th, 2025
    const monthNames = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
      jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
    };
    
    const textMatch = dateStr.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i);
    if (textMatch) {
      const monthName = textMatch[1].toLowerCase().substring(0, 3);
      return {
        month: monthNames[monthName],
        day: parseInt(textMatch[2]),
        year: parseInt(textMatch[3]),
        format: 'text'
      };
    }

    return null;
  }

  /**
   * Parse time-only match (infer date as today)
   */
  parseTimeOnly(timeStr) {
    const time = this.parseTime(timeStr);
    if (!time) return null;

    const now = new Date();
    return {
      time,
      timezone: null,
      date: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        inferred: true
      },
      hasDate: true,
      hasTime: true,
      hasTimezone: false
    };
  }

  /**
   * Get IANA timezone from abbreviation
   */
  getTimezone(tzStr) {
    if (!tzStr) return null;

    const normalized = tzStr.trim();
    const iana = this.timezoneMap[normalized] || this.timezoneMap[normalized.toLowerCase()];
    
    if (iana) {
      return {
        abbreviation: normalized,
        iana: iana,
        display: this.timezoneDisplay[iana] || normalized
      };
    }

    return null;
  }

  /**
   * Get user's local timezone
   */
  getLocalTimezone() {
    const iana = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return {
      abbreviation: 'Local',
      iana: iana,
      display: this.timezoneDisplay[iana] || iana
    };
  }

  /**
   * Cache management
   */
  updateCache(key, value) {
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats (for debugging)
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cacheMaxSize,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.DateTimeDetector = DateTimeDetector;
}

// Export for Node.js/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateTimeDetector;
}

