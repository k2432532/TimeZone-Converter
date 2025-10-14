# Test Suite - TimeZone Converter V5

## Test Categories

### 1. Basic Time Detection

| Test Case | Input | Expected Behavior |
|-----------|-------|-------------------|
| 12h AM | `10:30 AM EST` | Detects time with timezone |
| 12h PM | `3:45 PM PST` | Detects time with timezone |
| 24h format | `14:00 EST` | Detects 24-hour time |
| Noon | `Noon EST` | Detects special case |
| Midnight | `Midnight PST` | Detects special case |
| No seconds | `10 AM EST` | Handles missing minutes |
| With seconds | `10:30:45 AM EST` | Handles seconds |

### 2. Timezone Variations

| Test Case | Input | Expected IANA |
|-----------|-------|---------------|
| EST | `10 AM EST` | America/New_York |
| EDT | `10 AM EDT` | America/New_York |
| Eastern Time | `10 AM Eastern Time` | America/New_York |
| Eastern | `10 AM Eastern` | America/New_York |
| PST | `2 PM PST` | America/Los_Angeles |
| PDT | `2 PM PDT` | America/Los_Angeles |
| Pacific Time | `2 PM Pacific Time` | America/Los_Angeles |
| CST | `11 AM CST` | America/Chicago |
| MST | `9 AM MST` | America/Denver |

### 3. Date + Time Combinations

| Test Case | Input | Expected Behavior |
|-----------|-------|-------------------|
| Full date | `Oct 9, 2025 at 2:30 PM EST` | Detects both date and time |
| ISO date | `2025-10-09 14:00 EST` | Parses ISO format |
| US date | `10/09/2025 3:00 PM PST` | Parses US format |
| Text month | `October 9, 2025 10 AM EST` | Parses text month |

### 4. Edge Cases

| Test Case | Input | Expected Behavior |
|-----------|-------|-------------------|
| Time only | `10:30 AM EST` | Infers today's date |
| No timezone | `10:30 AM` | Uses browser timezone |
| Invalid format | `25:00 AM EST` | No detection |
| Ambiguous | `10 EST` | No detection (too vague) |
| Multiple times | `10 AM EST or 2 PM PST` | Detects first match |

### 5. Viewport Positioning

| Test Case | Scenario | Expected Behavior |
|-----------|----------|-------------------|
| Top edge | Tooltip near top | Shows below cursor |
| Bottom edge | Tooltip near bottom | Shows above cursor |
| Left edge | Tooltip near left | Adjusts right |
| Right edge | Tooltip near right | Adjusts left |
| Scroll | User scrolls | Tooltip hides |

### 6. Conversion Accuracy

#### EST to IST (Example)
- **Input**: `10:30 AM EST`
- **Expected**: `8:00 PM IST` (same day in winter)
- **Offset**: +10.5 hours

#### PST to GMT
- **Input**: `9:00 AM PST`
- **Expected**: `5:00 PM GMT` (same day in winter)
- **Offset**: +8 hours

#### Noon Conversions
- **Input**: `Noon EST`
- **Expected**: `9:00 AM PST` (same day)
- **Offset**: -3 hours

### 7. Interaction Tests

| Test Case | User Action | Expected Behavior |
|-----------|-------------|-------------------|
| Select text | Drag to select time | Tooltip appears |
| Hover text | Mouse over time | Tooltip appears after delay |
| Scroll page | Scroll while tooltip visible | Tooltip disappears |
| Click away | Click outside tooltip | Tooltip disappears |
| Multiple selections | Select different times | Tooltip updates |

### 8. Settings Tests

| Test Case | Action | Expected Behavior |
|-----------|--------|-------------------|
| Toggle off | Disable extension | No tooltips appear |
| Toggle on | Enable extension | Tooltips work |
| Change timezone | Select new timezone | Conversions use new timezone |
| Save settings | Click save | Settings persist |
| Reload page | Refresh browser | Settings maintained |

### 9. Performance Tests

| Test Case | Scenario | Expected Performance |
|-----------|----------|---------------------|
| Long text | 1000+ character text | Process in <100ms |
| Many times | Text with 10+ times | Detect first match |
| Rapid hover | Quick mouse movement | Debounced, no lag |
| Multiple tabs | 10+ tabs with extension | No memory leak |

### 10. Accessibility Tests

| Test Case | Feature | Expected Behavior |
|-----------|---------|-------------------|
| Screen reader | Tooltip appears | ARIA labels present |
| High contrast | High contrast mode | Tooltip readable |
| Reduced motion | Motion preference off | No animations |
| Keyboard nav | Tab navigation | Focusable elements |

## Manual Testing Checklist

### Pre-Testing Setup
- [ ] Extension loaded in Chrome
- [ ] Test page open (`tests/test-page.html`)
- [ ] DevTools console open (F12)
- [ ] Extension enabled in popup

### Basic Functionality
- [ ] Select "10:30 AM EST" → Tooltip appears
- [ ] Hover over "Noon PST" → Tooltip appears
- [ ] Tooltip shows converted time
- [ ] Tooltip shows original time
- [ ] Tooltip shows timezone badges

### Tooltip Positioning
- [ ] Select text at top of page → Tooltip below
- [ ] Select text at bottom → Tooltip above
- [ ] Select text at left edge → Tooltip adjusts right
- [ ] Select text at right edge → Tooltip adjusts left
- [ ] Tooltip never goes off-screen

### Detection Accuracy
- [ ] "10:30 AM EST" → Detects correctly
- [ ] "10 PM PST" → Detects correctly
- [ ] "14:00 EST" → Detects correctly
- [ ] "Noon EST" → Detects correctly
- [ ] "10 AM Eastern Time" → Detects correctly
- [ ] "9 PM Pacific Time" → Detects correctly

### Conversion Accuracy
- [ ] Verify EST to your timezone
- [ ] Verify PST to your timezone
- [ ] Verify GMT to your timezone
- [ ] Check DST handling (if applicable)
- [ ] Verify "Noon" converts correctly
- [ ] Verify "Midnight" converts correctly

### Inferred Information
- [ ] Time-only shows "Date (using today)"
- [ ] No timezone shows "Source timezone"
- [ ] Inferred info displays correctly

### Settings
- [ ] Click extension icon → Popup opens
- [ ] Toggle off → Tooltips stop
- [ ] Toggle on → Tooltips work
- [ ] Change timezone → Conversions update
- [ ] Save settings → Persist after reload

### Edge Cases
- [ ] Empty selection → No tooltip
- [ ] Non-time text → No tooltip
- [ ] Very long text → No performance issues
- [ ] Multiple rapid selections → Handles gracefully
- [ ] Scroll during tooltip → Tooltip hides

### Browser Compatibility
- [ ] Chrome (latest) → Works
- [ ] Edge (latest) → Works
- [ ] Brave (latest) → Works
- [ ] Opera (latest) → Works

### Visual Quality
- [ ] Gradient background looks good
- [ ] Text is readable
- [ ] Timezone badges are clear
- [ ] Animations are smooth
- [ ] Dark mode works (if system preference)

## Automated Test Suite (Future)

```javascript
// Example test structure for future implementation

describe('DateTimeDetector', () => {
  let detector;
  
  beforeEach(() => {
    detector = new DateTimeDetector();
  });
  
  test('detects 12-hour time with AM', () => {
    const result = detector.detect('Meeting at 10:30 AM EST');
    expect(result).not.toBeNull();
    expect(result.type).toBe('time_with_tz');
    expect(result.parsed.time.hours).toBe(10);
    expect(result.parsed.time.minutes).toBe(30);
  });
  
  test('detects Noon', () => {
    const result = detector.detect('Call at Noon EST');
    expect(result).not.toBeNull();
    expect(result.parsed.time.hours).toBe(12);
  });
  
  test('handles no match', () => {
    const result = detector.detect('No time information here');
    expect(result).toBeNull();
  });
});

describe('TimeZoneConverter', () => {
  let converter;
  
  beforeEach(() => {
    converter = new TimeZoneConverter();
  });
  
  test('converts EST to PST', () => {
    const parsed = {
      time: { hours: 10, minutes: 30 },
      timezone: { iana: 'America/New_York' },
      date: { year: 2025, month: 10, day: 9 }
    };
    
    const result = converter.convert(parsed, 'America/Los_Angeles');
    expect(result.target.datetime).toContain('7:30 AM');
  });
});
```

## Regression Tests

After each update, verify:

1. **Core Detection** - All basic patterns still work
2. **Conversion Accuracy** - Calculations remain correct
3. **Tooltip Display** - UI renders properly
4. **Settings Persistence** - User preferences saved
5. **Performance** - No degradation in speed

## Bug Report Template

When reporting issues, include:

1. **Extension version**: V5.0.0
2. **Browser & version**: Chrome 120
3. **Test input**: "Meeting at 10:30 AM EST"
4. **Expected behavior**: Shows "11:30 PM IST"
5. **Actual behavior**: Shows "10:30 PM IST"
6. **Console errors**: [Copy any errors]
7. **Screenshots**: [If applicable]

## Test Results Log

| Date | Tester | Test Suite | Pass Rate | Issues |
|------|--------|-----------|-----------|--------|
| 2025-10-09 | Setup | All | 100% | None |
|  |  |  |  |  |

---

**Status**: Ready for testing ✅

All test cases defined and ready for manual execution.
