# 🚀 Quick Reference: Intelligent Date Detection

## Supported Date Formats

### ✅ Always Works (100% Confidence)

| Format | Example | Notes |
|--------|---------|-------|
| Text Month First | `Oct 15, 2025` | No ambiguity |
| Text Day First | `15 October 2025` | European style |
| With Ordinals | `Oct 15th, 2025` | st/nd/rd/th |
| Full Month Name | `December 25, 2025` | Any month name |

### ✅ High Confidence (95%+)

| Format | Example | Why Unambiguous |
|--------|---------|----------------|
| Day > 12 | `15/10/2025` | 15 can only be day |
| | `13-10-2025` | 13 can only be day |
| | `25.12.2025` | 25 can only be day |
| Month > 12 | `10/15/2025` | 15 can only be day |
| ISO Standard | `2025-07-18` | International standard |
| Reverse ISO | `2025/25/12` | Day clearly > 12 |

### ⚠️ Ambiguous (60-70% Confidence)

| Format | Example | How It's Interpreted |
|--------|---------|---------------------|
| Both ≤12 with `/` | `05/06/2025` | US format → May 6 |
| Both ≤12 with `-` | `05-06-2025` | EU format → June 5 |
| Both ≤12 with `.` | `05.06.2025` | EU format → June 5 |

## 💡 Pro Tips

### For Maximum Clarity

1. **Use text months** when possible
   ```
   ✅ BEST: Oct 15, 2025
   ⚠️ OK: 10/15/2025
   ❌ AMBIGUOUS: 05/06/2025
   ```

2. **Match separator to format**
   ```
   US dates → Use /
   10/15/2025 ✅
   
   European dates → Use - or .
   15-10-2025 ✅
   15.10.2025 ✅
   ```

3. **Make day obvious**
   ```
   ✅ CLEAR: 15/10/2025 (day > 12)
   ✅ CLEAR: 10/25/2025 (day > 12)
   ⚠️ UNCLEAR: 05/06/2025 (both ≤ 12)
   ```

## 🎯 Real-World Examples

### Example 1: Email/Meeting Invite
```
"Meeting on Oct 15, 2025 at 3:45 PM EST"
✅ Detected: October 15, 2025, 3:45 PM EST
✅ Confidence: 100%
```

### Example 2: ISO Timestamp
```
"2025-07-18 18:15:23 EST"
✅ Detected: July 18, 2025, 6:15:23 PM EST
✅ Confidence: 95%
```

### Example 3: European Format
```
"The event is on 25-12-2025 at 10:30 AM GMT"
✅ Detected: December 25, 2025, 10:30 AM GMT
✅ Confidence: 95% (25 > 12, must be day)
```

### Example 4: US Format
```
"Due date: 10/15/25 by 5pm PST"
✅ Detected: October 15, 2025, 5:00 PM PST
✅ Confidence: 95% (15 > 12, must be day)
```

### Example 5: Ambiguous
```
"Deadline: 05/06/2025 2pm PST"
⚠️ Detected: May 6, 2025, 2:00 PM PST
⚠️ Confidence: 65% (used separator hint)
💡 Tip: Use "May 6, 2025" or "06/05/2025" for clarity
```

## 🔍 How Detection Works

```
Step 1: Look for text months
   ↓ Found? → 100% confidence ✅
   ↓ Not found? → Continue

Step 2: Check for numeric dates
   ↓ Found pattern like: N1/N2/N3

Step 3: Intelligent analysis
   ↓ Is any number ≥1900? → That's the year
   ↓ Is any number >12? → That's the day
   ↓ Both ≤12? → Use separator hint

Step 4: Validate
   ↓ Month 1-12? ✅
   ↓ Day valid for month? ✅
   ↓ Leap year handling ✅

Step 5: Return with confidence
   ✅ High confidence (95%+)
   ⚠️ Medium confidence (60-80%)
```

## 📊 Format Cheat Sheet

| If you write... | System interprets as... | Confidence |
|----------------|------------------------|------------|
| 2025-07-18 | ISO: Jul 18, 2025 | 95% ✅ |
| 10/15/2025 | US: Oct 15, 2025 | 95% ✅ |
| 15/10/2025 | EU: Oct 15, 2025 | 95% ✅ |
| 05/06/2025 | US: May 6, 2025 | 65% ⚠️ |
| 05-06-2025 | EU: Jun 5, 2025 | 65% ⚠️ |
| Oct 15, 2025 | Oct 15, 2025 | 100% ✅ |
| 15 Oct 2025 | Oct 15, 2025 | 100% ✅ |

## 🛠️ Troubleshooting

### "My date was detected wrong!"

**Check the format:**
```
Your input: 03/04/2025
Detected as: March 4, 2025 (US format)
Expected: April 3, 2025 (EU format)

Fix: Write "03-04-2025" (dash for EU)
   Or: Write "3 April 2025" (text month)
```

### "Date not detected at all"

**Common causes:**
1. ❌ Invalid date: `02/30/2025` (Feb 30 doesn't exist)
2. ❌ Wrong separators: `2025:07:18` (use -, /, or .)
3. ❌ Missing components: `July 2025` (needs day)
4. ❌ Typos: `Oct 155, 2025` (day too large)

### "Confidence is low"

**When confidence is 60-70%:**
- Date is ambiguous (e.g., `05/06/2025`)
- System used separator hint (might be wrong)

**Solutions:**
1. ✅ Use text month: `May 6, 2025`
2. ✅ Make day obvious: `06/15/2025` (15 > 12)
3. ✅ Match separator: `/` for US, `-` for EU

## 🌍 International Support

| Region | Format | Separator | Example |
|--------|--------|-----------|---------|
| 🇺🇸 US/Canada | MM/DD/YYYY | `/` | 10/15/2025 |
| 🇪🇺 Europe | DD/MM/YYYY | `-` or `.` | 15-10-2025 |
| 🇯🇵 Japan/Asia | YYYY-MM-DD | `-` | 2025-10-15 |
| 🌐 Universal | Text month | Any | Oct 15, 2025 |

## ⚡ Performance Tips

1. **Text months are fastest** (no parsing needed)
2. **Unambiguous dates process quicker** (no heuristics)
3. **Repeated patterns are cached** (instant on 2nd+ use)

## 📱 Testing Your Dates

1. Open `test-intelligent-date-detection.html`
2. Click "Run All Tests"
3. See how different formats are detected
4. Check confidence scores

## 🎓 Best Practices

### DO ✅
- Use text months: `Oct 15, 2025`
- Be unambiguous: `15/10/2025` (day >12)
- Match separator to region: `/` for US, `-` for EU
- Include all components: year, month, day

### DON'T ❌
- Mix formats: `10-15/2025`
- Use invalid dates: `02/30/2025`
- Forget the year: `Oct 15`
- Be ambiguous without reason: `05/06/2025`

## 🆘 Still Having Issues?

1. **Check the documentation**: `INTELLIGENT_DATE_DETECTION.md`
2. **Run the tests**: `test-intelligent-date-detection.html`
3. **Review examples above**
4. **Use text months** when in doubt

---

**Quick Tip**: When in doubt, use **text month formats** - they work 100% of the time! 🎯
