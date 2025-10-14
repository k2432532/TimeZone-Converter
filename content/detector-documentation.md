# Enhanced DateTime Detector V2.0 - Documentation

## 🚀 Major Improvements

### 1. Natural Language Processing
Now detects casual expressions:
- ✅ "tomorrow at 3pm EST"
- ✅ "next Monday 10am PST"
- ✅ "tonight at 8pm"
- ✅ "next Friday at 2pm"

### 2. Shortform Detection
Recognizes common abbreviations:
- ✅ "tmrw at 3pm" (tomorrow)
- ✅ "mon 10am" (Monday)
- ✅ "in 2 hrs" (hours)
- ✅ "30 mins from now"
- ✅ "nxt wk" (next week)

### 3. Relative Time Expressions
- ✅ "in 2 hours EST"
- ✅ "30 minutes from now PST"
- ✅ "in 3 days at 5pm"
- ✅ "after 1 hour"

### 4. UTC Offset Support
- ✅ "10:30 +05:30"
- ✅ "2pm UTC+8"
- ✅ "14:00 GMT-5"

### 5. City-Based Timezones
- ✅ "3pm New York time"
- ✅ "10am LA time"
- ✅ "2pm London time"
- ✅ "5pm Tokyo time"

### 6. Performance Optimizations
- **Caching**: Results are cached for repeated queries
- **Early Exit**: Stops searching once first match found (when findAll=false)
- **Priority System**: Processes patterns in order of specificity
- **Text Limiting**: Automatically limits processing to 5000 characters

### 7. Confidence Scoring
Each detection includes confidence score (0-100):
- Natural language with timezone: 95%
- DateTime with timezone: 90%
- Relative time: 92%
- Time only: 60%

### 8. Multiple Match Detection
Can find all datetime patterns in text, not just the first one

---

## 📖 Usage Examples

### Basic Detection (Single Match)
```javascript
const detector = new DateTimeDetector();

// Simple time with timezone
const result1 = detector.detect("Meeting at 3pm EST");
console.log(result1);
// Output: {
//   matched: "3pm EST",
//   type: "time_with_tz",
//   confidence: 85,
//   parsed: { time: {...}, timezone: {...}, ... }
// }

// Natural language
const result2 = detector.detect("Let's meet tomorrow at 10am PST");
console.log(result2);
// Output: {
//   matched: "tomorrow at 10am PST",
//   type: "natural_datetime_tz",
//   confidence: 95,
//   parsed: { time: {...}, date: {...}, timezone: {...} }
// }

// Shortforms
const result3 = detector.detect("Call me tmrw at 2pm");
console.log(result3);

// Relative time
const result4 = detector.detect("Start in 2 hours EST");
console.log(result4);
```

### Find All Matches
```javascript
const text = "Meeting at 3pm EST, then dinner at 7pm PST tomorrow";
const allResults = detector.detect(text, true); // findAll = true

console.log(allResults);
// Returns array of all detected patterns:
// [
//   { matched: "3pm EST", ... },
//   { matched: "7pm PST tomorrow", ... }
// ]
```

### Webpage Scanning (Automatic)
```javascript
// Create detector instance
const detector = new DateTimeDetector();

// Get all text from webpage
const pageText = document.body.innerText;

// Find all datetime patterns
const results = detector.detect(pageText, true);

if (results && results.length > 0) {
  results.forEach(result => {
    console.log('Found:', result.matched);
    console.log('Confidence:', result.confidence + '%');
    console.log('Type:', result.type);
    console.log('Parsed:', result.parsed);
    console.log('---');
  });
} else {
  console.log('No datetime patterns found');
}
```

### Performance Monitoring
```javascript
const detector = new DateTimeDetector();

// Process multiple queries
detector.detect("tomorrow at 3pm");
detector.detect("tomorrow at 3pm"); // Cached!
detector.detect("in 2 hours EST");

// Check cache stats
const stats = detector.getCacheStats();
console.log('Cache size:', stats.size);
console.log('Max size:', stats.maxSize);

// Clear cache if needed
detector.clearCache();
```

---

## 🎯 Supported Patterns

### Time Formats
- 12-hour: `3pm`, `10:30 AM`, `3:45:00 PM`
- 24-hour: `15:00`, `09:30:00`
- Shortforms: `3p`, `10a` (with context)
- Special: `noon`, `midnight`

### Date Formats
- Text: `Oct 9, 2025`, `October 9th, 2025`
- ISO: `2025-10-09`
- US: `10/09/2025`, `10/9/25`

### Relative References
- Days: `today`, `tdy`, `tomorrow`, `tmrw`, `tmr`, `yesterday`, `yest`
- Weekdays: `Monday`, `mon`, `Tuesday`, `tue`, etc.
- Future: `next Monday`, `next Friday`

### Time Units
- Hours: `hour`, `hours`, `hr`, `hrs`, `h`
- Minutes: `minute`, `minutes`, `min`, `mins`, `m`
- Seconds: `second`, `seconds`, `sec`, `secs`, `s`
- Days: `day`, `days`, `d`
- Weeks: `week`, `weeks`, `wk`, `wks`, `w`

### Timezones (100+ supported)
- US: EST, EDT, CST, CDT, MST, MDT, PST, PDT, ET, CT, MT, PT
- Global: GMT, UTC, BST, CET, IST, JST, AEST
- Cities: New York time, LA time, London time, Tokyo time
- Offsets: +05:30, UTC+8, GMT-5

---

## ⚡ Performance Tips

1. **Use Single Match When Possible**
   ```javascript
   // Faster - stops at first match
   detector.detect(text);
   
   // Slower - finds all matches
   detector.detect(text, true);
   ```

2. **Cache is Automatic**
   - Repeated queries are cached
   - Cache size: 100 entries (automatically managed)
   - No action needed from your side

3. **Text Length Limit**
   - Automatically limits to 5000 characters
   - Processes faster for long texts

4. **Pattern Priority**
   - More specific patterns checked first
   - Reduces unnecessary regex operations

---

## 🔍 Confidence Scores Explained

- **95%**: Natural language with timezone (e.g., "tomorrow at 3pm EST")
- **92%**: Relative time with timezone (e.g., "in 2 hours PST")
- **90%**: Full datetime with timezone (e.g., "Oct 9, 2025 at 3pm EST")
- **88%**: UTC offset format (e.g., "3pm +05:30")
- **85%**: Time with timezone (e.g., "3pm EST")
- **75%**: Weekday time (e.g., "Monday 3pm")
- **60%**: Time only, no timezone (e.g., "3pm")

Higher confidence = more context available = more accurate detection

---

## 🧪 Test Cases

Test the detector with these examples:

```javascript
const detector = new DateTimeDetector();

// Test natural language
console.log(detector.detect("Meeting tomorrow at 3pm EST"));
console.log(detector.detect("next Monday 10am PST"));
console.log(detector.detect("tonight at 8pm"));

// Test shortforms
console.log(detector.detect("Call me tmrw at 2pm"));
console.log(detector.detect("mon at 10am"));
console.log(detector.detect("in 2 hrs"));

// Test relative time
console.log(detector.detect("Start in 30 minutes PST"));
console.log(detector.detect("after 2 hours EST"));

// Test UTC offsets
console.log(detector.detect("10:30 +05:30"));
console.log(detector.detect("2pm UTC+8"));

// Test city-based
console.log(detector.detect("3pm New York time"));
console.log(detector.detect("10am LA time"));

// Test multiple matches
console.log(detector.detect("Meet at 3pm EST, then 7pm PST", true));
```

---

## 🚨 Important Notes

1. **Overlapping Matches**: The detector automatically avoids overlapping matches when `findAll=true`

2. **Case Insensitive**: All patterns are case-insensitive

3. **Flexible Formats**: Accepts variations like "3pm", "3 pm", "3 PM", "3p", "3 p.m."

4. **Smart Weekday Calculation**: Automatically calculates dates for "next Monday", "Friday", etc.

5. **Timezone Inference**: If no timezone specified, `hasTimezone` will be false

---

## 📊 Comparison: Old vs New

| Feature | Old Version | New Version |
|---------|------------|-------------|
| Natural Language | ❌ | ✅ |
| Shortforms | ❌ | ✅ |
| Relative Time | ❌ | ✅ |
| UTC Offsets | ❌ | ✅ |
| City Names | ❌ | ✅ |
| Multiple Matches | ❌ | ✅ |
| Caching | ❌ | ✅ |
| Confidence Score | ❌ | ✅ |
| Priority System | ❌ | ✅ |
| Timezones | ~40 | 100+ |
| Performance | Basic | Optimized |

---

## 🎓 Integration Tips

### For Chrome Extension:
```javascript
// In your content script
const detector = new DateTimeDetector();

// Listen for page changes
const observer = new MutationObserver(() => {
  const results = detector.detect(document.body.innerText, true);
  if (results) {
    // Highlight or process detected times
    console.log('Found times:', results);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```

### For Web App:
```javascript
// Initialize once
window.detector = new DateTimeDetector();

// Use anywhere
function checkInput(userInput) {
  const result = window.detector.detect(userInput);
  if (result) {
    console.log('Detected time:', result.matched);
    console.log('Confidence:', result.confidence + '%');
    return result.parsed;
  }
  return null;
}
```

---

## 💡 Pro Tips

1. **High Confidence Filtering**: Only use results with confidence > 80% for critical operations

2. **Combine with NLP**: For even better detection, combine with libraries like chrono-node

3. **User Feedback**: Show confidence scores to users so they can verify ambiguous detections

4. **Timezone Hints**: When possible, ask users for their timezone preference

5. **Testing**: Always test with your specific use cases and text patterns

---

**Need Help?** Check the code comments for detailed explanations of each function!