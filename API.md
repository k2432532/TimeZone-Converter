# API Documentation - TimeZone Converter V5

## Overview

The extension consists of three main modules that work together to detect, convert, and display timezone information.

---

## DateTimeDetector Class

Responsible for detecting and parsing date/time patterns in text.

### Constructor

```javascript
const detector = new DateTimeDetector();
```

### Methods

#### `detect(text)`

Detects date/time patterns in the provided text.

**Parameters:**
- `text` (string): Text to search for date/time patterns

**Returns:**
- `Object` | `null`: Detection result or null if no pattern found

**Return Object Structure:**
```javascript
{
  matched: "10:30 AM EST",     // The matched text
  type: "time_with_tz",        // Pattern type
  fullMatch: [...],            // Regex match array
  parsed: {                    // Parsed components
    time: { hours, minutes, seconds, period, format },
    timezone: { abbreviation, iana, display },
    date: { year, month, day, format },
    hasDate: boolean,
    hasTime: boolean,
    hasTimezone: boolean
  }
}
```

**Example:**
```javascript
const detector = new DateTimeDetector();
const result = detector.detect("Meeting at 10:30 AM EST");

console.log(result.matched);  // "10:30 AM EST"
console.log(result.parsed.time.hours);  // 10
console.log(result.parsed.timezone.iana);  // "America/New_York"
```

---

#### `parseTime(timeStr)`

Parses a time string into components.

**Parameters:**
- `timeStr` (string): Time string to parse (e.g., "10:30 AM", "14:00", "Noon")

**Returns:**
- `Object` | `null`: Parsed time components

**Return Structure:**
```javascript
{
  hours: 10,
  minutes: 30,
  seconds: 0,
  period: "AM",  // Only for 12-hour format
  format: "12h"  // "12h" or "24h"
}
```

**Example:**
```javascript
const time = detector.parseTime("10:30 AM");
console.log(time.hours);  // 10
console.log(time.format);  // "12h"
```

---

#### `parseDate(dateStr)`

Parses a date string into components.

**Parameters:**
- `dateStr` (string): Date string to parse

**Returns:**
- `Object` | `null`: Parsed date components

**Return Structure:**
```javascript
{
  year: 2025,
  month: 10,  // 1-12
  day: 9,
  format: "text"  // "iso", "us", or "text"
}
```

**Example:**
```javascript
const date = detector.parseDate("Oct 9, 2025");
console.log(date.month);  // 10
```

---

#### `getTimezone(tzStr)`

Resolves timezone abbreviation to IANA timezone.

**Parameters:**
- `tzStr` (string): Timezone abbreviation (e.g., "EST", "PST")

**Returns:**
- `Object` | `null`: Timezone information

**Return Structure:**
```javascript
{
  abbreviation: "EST",
  iana: "America/New_York",
  display: "EST/EDT"
}
```

---

#### `getLocalTimezone()`

Gets the user's local timezone.

**Returns:**
- `Object`: Local timezone information

**Example:**
```javascript
const local = detector.getLocalTimezone();
console.log(local.iana);  // "Asia/Kolkata" (example)
```

---

## TimeZoneConverter Class

Handles timezone conversion with high accuracy.

### Constructor

```javascript
const converter = new TimeZoneConverter();
```

### Methods

#### `convert(parsed, targetTimezone)`

Converts parsed date/time to target timezone.

**Parameters:**
- `parsed` (Object): Parsed result from DateTimeDetector
- `targetTimezone` (string): Target IANA timezone (e.g., "Asia/Kolkata")

**Returns:**
- `Object` | `null`: Conversion result

**Return Structure:**
```javascript
{
  source: {
    datetime: "Oct 9, 2025 10:30 AM",
    timezone: "EST/EDT",
    timezoneIANA: "America/New_York",
    raw: { year, month, day, hours, minutes, seconds }
  },
  target: {
    datetime: "Oct 9, 2025 8:00 PM",
    timezone: "IST",
    timezoneIANA: "Asia/Kolkata",
    raw: { year, month, day, hours, minutes, seconds }
  },
  originalText: "10:30 AM EST",
  inferred: ["Date (using today)"]  // or null
}
```

**Example:**
```javascript
const converter = new TimeZoneConverter();
const detected = detector.detect("Meeting at 10:30 AM EST");

const result = converter.convert(
  detected.parsed, 
  "Asia/Kolkata"
);

console.log(result.target.datetime);  // "8:00 PM IST"
```

---

#### `buildDate(parsed)`

Builds a JavaScript Date object from parsed components.

**Parameters:**
- `parsed` (Object): Parsed date/time object

**Returns:**
- `Date`: JavaScript Date object

---

#### `getDateInTimezone(date, timezone)`

Gets date/time components in a specific timezone.

**Parameters:**
- `date` (Date): JavaScript Date object
- `timezone` (string): IANA timezone

**Returns:**
- `Object`: Date components in the timezone

---

#### `formatDateTime(dateObj, timezone, parsed)`

Formats date/time for display.

**Parameters:**
- `dateObj` (Object): Date components
- `timezone` (string): IANA timezone
- `parsed` (Object): Original parsed object

**Returns:**
- `string`: Formatted date/time string

---

#### `getTimezoneDisplay(iana)`

Gets display abbreviation for IANA timezone.

**Parameters:**
- `iana` (string): IANA timezone name

**Returns:**
- `string`: Display abbreviation (e.g., "EST/EDT")

---

## Main Content Script API

The main content script coordinates detection and display.

### Configuration

```javascript
const CONFIG = {
  hoverDelay: 300,      // ms to wait before detecting on hover
  maxTextLength: 500,   // max text length to process
  debounceDelay: 150,   // debounce delay for events
  tooltipOffset: 12     // pixels from cursor/selection
};
```

### Functions

#### `processText(text, x, y, source)`

Process text for date/time detection and show tooltip.

**Parameters:**
- `text` (string): Text to process
- `x` (number): X coordinate for tooltip
- `y` (number): Y coordinate for tooltip
- `source` (string): "selection" or "hover"

---

#### `showTooltip(result, x, y)`

Display tooltip with conversion result.

**Parameters:**
- `result` (Object): Conversion result from converter
- `x` (number): X coordinate
- `y` (number): Y coordinate

---

#### `hideTooltip()`

Hide the currently displayed tooltip.

---

## Storage API

Settings are stored using Chrome's sync storage.

### Storage Keys

- `targetTimezone` (string): User's preferred timezone (IANA format)
- `enabled` (boolean): Whether extension is enabled

### Reading Settings

```javascript
chrome.storage.sync.get(['targetTimezone', 'enabled'], (result) => {
  const timezone = result.targetTimezone || 'America/New_York';
  const enabled = result.enabled !== false;
});
```

### Writing Settings

```javascript
chrome.storage.sync.set({
  targetTimezone: 'Asia/Kolkata',
  enabled: true
});
```

### Listening for Changes

```javascript
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.targetTimezone) {
      console.log('Timezone changed to:', changes.targetTimezone.newValue);
    }
  }
});
```

---

## Message Passing API

Communication between popup, content scripts, and background.

### Message Types

#### Toggle Extension

```javascript
chrome.runtime.sendMessage({
  action: 'toggle',
  enabled: true
}, (response) => {
  console.log(response.success);  // true
});
```

#### Update Timezone

```javascript
chrome.runtime.sendMessage({
  action: 'updateTimezone',
  timezone: 'Asia/Kolkata'
}, (response) => {
  console.log(response.success);  // true
});
```

#### Get Settings

```javascript
chrome.runtime.sendMessage({
  action: 'getSettings'
}, (response) => {
  console.log(response.settings);
});
```

---

## Events

### Content Script Events

The extension listens to these DOM events:

- `mouseup`: Text selection detection
- `selectionchange`: Selection change tracking
- `mousemove`: Hover detection (debounced)
- `scroll`: Tooltip hiding
- `mousedown`: Tooltip hiding

---

## Timezone Mappings

### Supported Abbreviations

```javascript
{
  // North America
  'EST': 'America/New_York',
  'EDT': 'America/New_York',
  'CST': 'America/Chicago',
  'CDT': 'America/Chicago',
  'MST': 'America/Denver',
  'MDT': 'America/Denver',
  'PST': 'America/Los_Angeles',
  'PDT': 'America/Los_Angeles',
  
  // International
  'GMT': 'UTC',
  'UTC': 'UTC',
  'BST': 'Europe/London',
  'IST': 'Asia/Kolkata',
  'JST': 'Asia/Tokyo',
  // ... and more
}
```

### Full Names Supported

- "Eastern Time" → America/New_York
- "Pacific Time" → America/Los_Angeles
- "Central Time" → America/Chicago
- "Mountain Time" → America/Denver

---

## Custom Integration Examples

### Example 1: Programmatic Detection

```javascript
// Get detector instance
const detector = new window.DateTimeDetector();

// Detect in your text
const myText = "Conference call at 3:30 PM EST";
const result = detector.detect(myText);

if (result) {
  console.log("Found time:", result.matched);
  console.log("Timezone:", result.parsed.timezone.iana);
}
```

### Example 2: Custom Conversion

```javascript
// Create instances
const detector = new window.DateTimeDetector();
const converter = new window.TimeZoneConverter();

// Detect and convert
const detected = detector.detect("Meeting at 2:00 PM PST");
if (detected) {
  const converted = converter.convert(
    detected.parsed,
    'Europe/London'  // Convert to London time
  );
  
  console.log("Original:", converted.source.datetime);
  console.log("Converted:", converted.target.datetime);
}
```

### Example 3: Batch Processing

```javascript
const texts = [
  "Call at 10 AM EST",
  "Webinar at 3 PM PST",
  "Meeting at Noon GMT"
];

const detector = new window.DateTimeDetector();
const converter = new window.TimeZoneConverter();

texts.forEach(text => {
  const detected = detector.detect(text);
  if (detected) {
    const result = converter.convert(detected.parsed, 'Asia/Tokyo');
    console.log(`${text} → ${result.target.datetime}`);
  }
});
```

---

## Error Handling

All methods include try-catch blocks and return `null` on failure:

```javascript
const result = detector.detect(invalidText);
if (result === null) {
  console.log("No date/time pattern found");
}
```

Check console for detailed error messages when debugging.

---

## Performance Considerations

- Detection is debounced (150ms default)
- Text length limited to 500 characters
- Hover detection delayed (300ms default)
- Results are not cached (stateless)

---

## Browser Compatibility

### Supported Browsers

- Chrome 88+
- Edge 88+
- Brave (latest)
- Opera (latest)

### Required APIs

- `Intl.DateTimeFormat` (ES6+)
- Chrome Extension API (Manifest V3)
- DOM Selection API

---

## TypeScript Definitions (Future)

```typescript
interface DetectionResult {
  matched: string;
  type: 'time_with_tz' | 'datetime_with_tz' | 'time_only';
  fullMatch: RegExpMatchArray;
  parsed: ParsedDateTime;
}

interface ParsedDateTime {
  time: ParsedTime;
  timezone: ParsedTimezone | null;
  date: ParsedDate | null;
  hasDate: boolean;
  hasTime: boolean;
  hasTimezone: boolean;
}

interface ConversionResult {
  source: TimezoneInfo;
  target: TimezoneInfo;
  originalText: string;
  inferred: string[] | null;
}
```

---

## Support

For questions or issues with the API:
- Check README.md for usage examples
- See test-page.html for working examples
- Review console logs for debugging
- Open an issue with detailed information

---

**Last Updated**: 2025-10-09  
**Version**: 5.0.0
