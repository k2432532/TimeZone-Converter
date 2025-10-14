# DateTime Detector V2.0 - Quick Reference Card

## 🚀 Basic Usage

```javascript
// Create detector
const detector = new DateTimeDetector();

// Single match (fastest)
const result = detector.detect("tomorrow at 3pm EST");

// All matches
const results = detector.detect("Meet at 3pm EST, then 7pm PST", true);
```

## 🎯 Pattern Support

### Natural Language
✅ tomorrow, tmrw, today, tonight, yesterday  
✅ next Monday, mon, tue, wed, thu, fri, sat, sun  
✅ in 2 hours, 30 mins from now  
✅ after 1 hour, in 3 days

### Time Formats
✅ 3pm, 10:30 AM, 14:00, noon, midnight  
✅ 3p, 10a (shortforms)

### Timezones (100+)
✅ EST, PST, CST, MST, GMT, UTC, IST, JST  
✅ Eastern, Pacific, Central, Mountain  
✅ New York time, LA time, London time  
✅ +05:30, UTC+8, GMT-5 (offsets)

### Date Formats
✅ Oct 9, 2025 | October 9th, 2025  
✅ 2025-10-09 (ISO)  
✅ 10/09/2025 (US format)

## 📊 Result Structure

```javascript
{
  matched: "tomorrow at 3pm EST",      // Detected text
  type: "natural_datetime_tz",         // Pattern type
  confidence: 95,                       // 0-100 score
  start: 10,                            // Position in text
  end: 33,                              // End position
  parsed: {
    time: { hours, minutes, seconds },
    date: { year, month, day },
    timezone: { iana, display },
    hasTime: true,
    hasDate: true,
    hasTimezone: true
  }
}
```

## ⚡ Performance Tips

1. Use `detect(text)` for single match (faster)
2. Use `detect(text, true)` for all matches
3. Cache is automatic (100 entries)
4. Text auto-limited to 5000 chars

## 🎯 Confidence Levels

- 95%: Natural + TZ → "tomorrow at 3pm EST"
- 90%: DateTime + TZ → "Oct 9, 2025 at 3pm EST"
- 85%: Time + TZ → "3pm EST"
- 75%: Weekday + Time → "Monday 3pm"
- 60%: Time only → "3pm"

Use > 80% for critical operations

## 🔧 API Methods

```javascript
// Detection
detector.detect(text, findAll = false)

// Cache management
detector.clearCache()
detector.getCacheStats()

// Timezone info
detector.getLocalTimezone()
detector.getTimezone(tzString)
```

## 🧪 Test Cases

```javascript
// Natural language
"tomorrow at 3pm EST"
"next Monday 10am PST"
"tonight at 8pm"

// Shortforms  
"tmrw at 2pm"
"mon 9am"
"in 2 hrs"

// Relative time
"in 30 minutes EST"
"after 2 hours PST"

// UTC offsets
"10:30 +05:30"
"2pm UTC+8"

// City names
"3pm New York time"
"10am LA time"
```

## 📝 Common Patterns

| User Input | Detected | Type |
|------------|----------|------|
| "tmrw 3pm" | tomorrow at 3pm | natural |
| "mon 10am" | next Monday 10am | weekday |
| "in 2h" | in 2 hours | relative |
| "3p EST" | 3pm EST | time+tz |
| "+05:30" | UTC+05:30 | offset |

## 🌍 Supported Timezones

### US
EST, EDT, CST, CDT, MST, MDT, PST, PDT  
ET, CT, MT, PT, AKST, HST

### Global
GMT, UTC, BST, CET, CEST  
IST (India), JST (Japan)  
AEST (Australia), NZST (New Zealand)  
SGT, HKT, KST, MSK

### Cities
New York, LA, Chicago, Denver  
London, Paris, Tokyo, Sydney  
Singapore, Hong Kong, Moscow

## ⚠️ Important Notes

1. **Overlap Prevention**: Automatically avoids overlapping matches
2. **Case Insensitive**: Works with any case
3. **Cache Automatic**: No manual management needed
4. **Early Exit**: Stops at first match for speed
5. **Priority Based**: Checks specific patterns first

## 🎓 Quick Start

1. Include script:
```html
<script src="detector.js"></script>
```

2. Use in code:
```javascript
const detector = new DateTimeDetector();
const result = detector.detect("your text here");
console.log(result);
```

3. Test:
Open `test-detector.html` in browser

## 🔗 Files

- `detector.js` - Main engine (740 lines)
- `detector-documentation.md` - Full guide
- `test-detector.html` - Interactive tests
- `UPDATE-SUMMARY.md` - What changed
- `QUICK-REFERENCE.md` - This file

---

**Version:** 2.0 | **Status:** Production Ready ✅