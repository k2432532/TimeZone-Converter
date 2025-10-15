# 🧠 Intelligent Date Detection System

## Overview

The Chrome Plugin now features an **Intelligent Date Parser** that can automatically detect and correctly parse dates in multiple formats, even when they're ambiguous. This solves the issue where dates like "2025-07-18" or "15/10/2025" were not being detected correctly.

## 🎯 Key Features

### 1. **Multi-Format Support**
The system intelligently handles:

#### ISO Formats
- `YYYY-MM-DD` → 2025-07-18
- `YYYY/MM/DD` → 2025/07/18
- `YYYY.MM.DD` → 2025.07.18

#### US Formats (Month first)
- `MM/DD/YYYY` → 10/15/2025
- `MM-DD-YYYY` → 10-15-2025
- `MM.DD.YYYY` → 10.15.2025
- `MM/DD/YY` → 10/15/25

#### European Formats (Day first)
- `DD/MM/YYYY` → 15/10/2025
- `DD-MM-YYYY` → 15-10-2025
- `DD.MM.YYYY` → 15.10.2025
- `DD/MM/YY` → 15/10/25

#### Text-Based Formats
- `Oct 15, 2025` → Month-first
- `15 October 2025` → Day-first
- `Dec 25th, 2025` → With ordinal suffixes
- `31st December, 2025` → European style with ordinal

#### Reverse ISO (Rare but supported)
- `YYYY/DD/MM` → 2025/25/12

### 2. **Intelligent Disambiguation**

When dates are ambiguous (like `05/06/2025` - is it May 6th or June 5th?), the system uses these heuristics:

#### Rule 1: Value-Based Detection
```
15/10/2025 → Day must be 15 (>12), so DD/MM/YYYY
10/15/2025 → Day must be 15 (>12), so MM/DD/YYYY
```

#### Rule 2: Separator Hints
When values are ambiguous (both ≤12):
- **Slash (/)** → Assumes US format (MM/DD/YYYY)
  - `05/06/2025` → May 6, 2025
- **Dash (-) or Dot (.)** → Assumes European format (DD/MM/YYYY)
  - `05-06-2025` → June 5, 2025

#### Rule 3: Year Position
- If first number is ≥1900 or 4 digits → YYYY at start
- If last number is ≥1900 or 4 digits → YYYY at end
- 2-digit years (< 100) → Automatically add 2000

### 3. **Confidence Scoring**

Each detection includes a confidence score (0-100%):

| Scenario | Confidence | Reason |
|----------|-----------|---------|
| Day > 12 (unambiguous) | 95% | Clear distinction |
| Month > 12 (unambiguous) | 95% | Clear distinction |
| Text month format | 100% | No ambiguity |
| ISO format detected | 70-95% | Standard format |
| Separator hint used | 60-65% | Heuristic-based |

### 4. **Date Validation**

The system validates:
- Month is 1-12
- Day is 1-31
- Day is valid for the specific month (handles leap years!)
- Example: Feb 29 is only valid in leap years

## 📊 Detection Flow

```
Input: "2025-07-18 18:15:23 EST"
   ↓
[Pattern Matching]
   ↓
Detect: Text month? → No
Detect: Numeric with separators? → Yes
   ↓
[Intelligent Parsing]
   ↓
Is first number ≥1900? → Yes (2025)
   ↓
Format: YYYY-??-??
   ↓
Is second number >12? → No (7)
Is third number >12? → Yes (18)
   ↓
Conclusion: YYYY-MM-DD format
   ↓
Result: {
  year: 2025,
  month: 7,
  day: 18,
  format: 'YYYY-MM-DD',
  confidence: 95%,
  intelligent: true
}
```

## 🔧 Technical Implementation

### Core Function: `intelligentlyParseNumericDate()`

```javascript
/**
 * Uses heuristics to determine correct date format
 * @param {number} num1 - First number
 * @param {number} num2 - Second number  
 * @param {number} num3 - Third number
 * @param {string} separator - Separator (/, -, .)
 * @returns {Object} Parsed date with confidence
 */
```

### Key Algorithms:

1. **Year Detection**
   - Check if any number ≥1900 or has 4 digits
   - Position determines format (YYYY-??-?? vs ??-??-YYYY)

2. **Day/Month Distinction**
   - If value >12 → Must be day
   - If both ≤12 → Use separator heuristic

3. **Leap Year Handling**
   - Validates Feb 29 only in leap years
   - Formula: `(year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0))`

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Open in browser
test-intelligent-date-detection.html
```

### Test Categories:
1. ✅ ISO Format (YYYY-MM-DD)
2. ✅ US Format (MM/DD/YYYY)
3. ✅ European Format (DD/MM/YYYY)
4. ✅ Ambiguous Dates (Auto-detection)
5. ✅ Text Month Formats
6. ✅ Reverse ISO (YYYY/DD/MM)
7. ✅ Two-Digit Years
8. ✅ Mixed Separators

## 📝 Examples

### Example 1: Clear ISO Format
```
Input: "2025-07-18 18:15:23 EST"
Detection: ✅ High confidence (95%)
Result: July 18, 2025 at 6:15:23 PM EST
Format: YYYY-MM-DD (ISO Standard)
```

### Example 2: Ambiguous with Slash
```
Input: "05/06/2025 at 2pm PST"
Detection: ⚠️ Ambiguous (65% confidence)
Heuristic: Slash separator → US format
Result: May 6, 2025 at 2:00 PM PST
Format: MM/DD/YYYY
```

### Example 3: Ambiguous with Dash
```
Input: "05-06-2025 at 2pm PST"
Detection: ⚠️ Ambiguous (65% confidence)
Heuristic: Dash separator → European format
Result: June 5, 2025 at 2:00 PM PST
Format: DD-MM-YYYY
```

### Example 4: Unambiguous Day
```
Input: "13/10/2025 9:00 AM EST"
Detection: ✅ High confidence (95%)
Logic: 13 > 12, must be day
Result: October 13, 2025 at 9:00 AM EST
Format: DD/MM/YYYY
```

### Example 5: Text Month
```
Input: "Oct 15, 2025 at 6:15 PM EST"
Detection: ✅ Perfect (100% confidence)
Result: October 15, 2025 at 6:15 PM EST
Format: text_month_first
```

## 🎨 User Experience

The intelligent parser works transparently:

1. **User selects text** with any date format
2. **Extension detects** the date automatically
3. **Parser intelligently determines** the format
4. **Conversion happens** with appropriate confidence
5. **Tooltip shows** converted time with confidence level

### Confidence Indicator in UI

```
95% CONFIDENCE
Oct 16, 2025 3:45 AM Calcutta
Original: Oct 15, 2025 6:15 PM EST/EDT
```

High confidence (>80%) → Green indicator
Medium confidence (60-80%) → Yellow indicator
Low confidence (<60%) → Orange indicator

## ⚙️ Configuration

No configuration needed! The system automatically:
- Detects all formats
- Applies intelligent heuristics
- Validates dates
- Provides confidence scores

## 🚀 Performance

- **Cached Results**: Repeated patterns are cached
- **Early Exit**: Stops at first high-confidence match
- **Optimized Regex**: Sorted by priority for speed
- **Validation**: Prevents invalid dates from processing

## 📈 Future Enhancements

Potential improvements:
1. User preference for date format (force US vs European)
2. Machine learning for format prediction based on locale
3. Context-aware detection (user's browser locale)
4. Custom format pattern support
5. Date range detection ("Oct 15-18, 2025")

## 🐛 Troubleshooting

### Issue: Wrong format detected for ambiguous dates

**Solution**: The system uses separator hints. If you consistently use a specific format:
- Use `/` for US dates (MM/DD/YYYY)
- Use `-` or `.` for European dates (DD/MM/YYYY)

### Issue: Date not detected at all

**Check**:
- Is the date format supported? (See supported formats above)
- Are all date components present? (year, month, day)
- Is the date valid? (e.g., not Feb 30)

### Issue: Confidence too low

**Causes**:
- Ambiguous date (both day and month ≤12)
- No clear indicators (separator neutral)
- Consider using text month format for clarity

## 📚 API Reference

### Main Detection Function

```javascript
detector.detect(text, findAll = false)
```

**Returns**: Detection object with:
```javascript
{
  matched: "2025-07-18 18:15:23 EST",
  type: "datetime_with_tz",
  confidence: 95,
  parsed: {
    date: {
      year: 2025,
      month: 7,
      day: 18,
      format: "YYYY-MM-DD",
      confidence: 95,
      intelligent: true
    },
    time: { hours: 18, minutes: 15, seconds: 23 },
    timezone: { iana: "America/New_York", display: "EST/EDT" }
  }
}
```

### Date Parsing Function

```javascript
detector.parseDate(dateStr)
```

**Returns**: Parsed date object:
```javascript
{
  year: 2025,
  month: 7,
  day: 18,
  format: "YYYY-MM-DD",
  confidence: 95,
  intelligent: true
}
```

## 📄 License

Same as main project license.

## 🤝 Contributing

Found an edge case? Want to improve the detection?
1. Add test case to `test-intelligent-date-detection.html`
2. Update heuristics in `detector.js`
3. Document changes in this file

---

**Version**: 2.0  
**Last Updated**: October 15, 2025  
**Status**: ✅ Production Ready
