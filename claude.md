# Chrome Extension - Smart TimeZone Converter

## Version: 5.2.5

### Recent Changes (October 15, 2025)

#### Fixed Issues:
1. **Date Off-by-One Bug (v5.2.4)**
   - Fixed issue where "11 Oct 7 PM EST" showed Oct 10 instead of Oct 11
   - Updated date comparison logic in `parseDayMonthTimeTz()` function
   - Improved handling of current-day dates

2. **UTC Offset with Date Pattern (v5.2.5)**
   - Added support for "TIME UTC+OFFSET on DATE" format
   - Example: "2:15 AM UTC+5:30 on 01/12/2025" now correctly parsed
   - Intelligent date format detection (MM/DD vs DD/MM based on values and separator)
   - New pattern type: `time_utc_offset_with_date`

### Pattern Support Status

#### ✅ Working Patterns:
- Time with timezone: `10:30 AM EST`, `3pm PST`
- Natural language: `tomorrow at 3pm`, `next Monday 10am`
- Relative time: `in 2 hours`, `30 mins from now`
- Date + Time + TZ: `Oct 15, 2025 at 3:30 PM EST`
- Day Month Time TZ: `11 Oct 7 PM EST` *(fixed in v5.2.4)*
- ISO format: `2025-07-18 18:15:23 EST`
- US format: `10/15/2025 at 3:45 PM`
- EU format: `15/10/2025 14:00 CET`
- UTC offset: `10:30 +05:30`, `2pm UTC+8`
- UTC offset with date: `2:15 AM UTC+5:30 on 01/12/2025` *(new in v5.2.5)*
- Weekday + time: `Monday 3pm`, `next Friday at 10am`

### Technical Implementation

#### File Structure:
- `detector.js` (1,190 lines) - Pattern detection and parsing
- `converter.js` (390 lines) - Timezone conversion logic
- `main.js` (673 lines) - Extension main script

#### Key Components:

**DateTimeDetector Class:**
- 10 detection patterns with priority levels
- Intelligent date disambiguation logic
- Confidence scoring system (0-100%)
- UTC offset parsing with date support

**Pattern Priorities:**
1. Natural language datetime
2. Relative time
3. UTC offset with date *(new)*
3. Time+TZ on date / Day+Month+Time+TZ
4. UTC offset (without date)
5. Standard datetime
6. Time with timezone
7. Weekday time
8. Time only

**Date Format Intelligence:**
- If day > 12: DD/MM/YYYY format
- If month > 12: MM/DD/YYYY format
- Separator hints: `/` = US format, `-` or `.` = EU format
- 2-digit years automatically converted to 20XX

### Testing
- Test files available in project root and `/tests` directory
- Comprehensive test suite covering all patterns
- Special test for UTC offset patterns: `test-utc-pattern.html`

### Version History
- v5.2.3 - Added seconds support, Google Sheets fixes
- v5.2.4 - Fixed date off-by-one bug
- v5.2.5 - Added UTC offset with date pattern support

### Repository
GitHub: https://github.com/k2432532/TimeZone-Converter.git

### Notes
- All processing done locally (privacy-first)
- Supports 100+ timezones
- Natural language processing with confidence scores
- Works on all websites with <all_urls> permission
