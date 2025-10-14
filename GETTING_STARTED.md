# 🚀 Getting Started with Smart TimeZone Converter V5.1.1 (Selection-Only Mode)

**Welcome! This guide will help you get up and running in 5 minutes. The extension now works exclusively with text selection for a cleaner, more controlled experience.**

---

## 📦 Quick Installation

### Method 1: Chrome Web Store (Coming Soon)
1. Visit Chrome Web Store
2. Click "Add to Chrome"
3. Done! ✅

### Method 2: Developer Mode (For Testing)

1. **Download/Clone** the repository
   ```bash
   git clone <repository-url>
   cd "Public V5"
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load Extension**
   - Click "Load unpacked"
   - Select the `Public V5` folder
   - Extension icon appears in toolbar!

---

## 🎯 First Steps

### 1. Verify Installation

Open any webpage and select this text:
```
Meeting at 3pm EST
```

You should see a tooltip with the converted time!

### 2. Try Natural Language

Select this text:
```
Call tomorrow at 10am PST
```

The extension understands "tomorrow" and calculates the correct date!

### 3. Configure Your Timezone

1. **Click** the extension icon in Chrome toolbar
2. **Select** your timezone from dropdown
3. **Click** "Save Settings"

All conversions will now show times in your timezone.

---

## ✨ What Can It Detect?

### Traditional Formats
- `10:30 AM EST` - Standard 12-hour with timezone
- `14:00 PST` - 24-hour format
- `Noon EST` - Special keywords
- `Oct 9, 2025 at 3pm` - Full date + time

### Natural Language (NEW!)
- `tomorrow at 3pm EST` - Relative dates
- `next Monday 10am` - Weekday references
- `tonight at 8pm` - Time of day references

### Shortforms (NEW!)
- `tmrw at 2pm` - Tomorrow shorthand
- `mon 9am` - Monday abbreviation
- `in 2 hrs EST` - Hours shorthand

### Relative Time (NEW!)
- `in 2 hours EST` - Future time
- `30 mins from now` - Minutes ahead
- `in 3 days at 5pm` - Days + specific time

### UTC Offsets (NEW!)
- `10:30 +05:30` - Positive offset
- `2pm UTC+8` - UTC format
- `14:00 GMT-5` - Negative offset

### City Names (NEW!)
- `3pm New York time` - City-based
- `10am LA time` - Common abbreviations
- `5pm London time` - International cities

---

## 🎨 How to Use

### Text Selection (Primary Method)

1. **Select** any text containing a date/time
2. **Tooltip appears** instantly
3. **View** converted time in your timezone

**Works everywhere:**
- ✅ Gmail
- ✅ Slack
- ✅ Google Docs
- ✅ Any website

**How to use:**
- Simply drag your mouse to select text
- Works with single click and drag
- Triple-click to select entire paragraph
- Ctrl/Cmd+A to select all and check entire page

---

## ⚙️ Configuration

### Settings Panel

Click the extension icon to access:

#### 1. Extension Toggle
- **Enable/Disable** detection
- Useful for privacy-sensitive sites

#### 2. Target Timezone
- **Choose** from 100+ timezones
- **US Zones**: EST, PST, CST, MST, etc.
- **Global**: London, Tokyo, Singapore, etc.
- **Auto-syncs** across Chrome devices

#### 3. Advanced (in code)

Edit `content/main.js` > `CONFIG`:

```javascript
{
  // hoverDelay: 300,     // REMOVED - hover detection disabled
  maxTextLength: 500,     // max text to process
  minConfidence: 70,      // confidence threshold (0-100)
  showConfidence: true    // show % in tooltip
}
```

---

## 🧪 Test Your Installation

### Quick Test Page

1. **Open** `tests/test-detector.html`
2. **Try** the built-in examples
3. **Test** custom text

### Manual Test Cases

Open any webpage and try selecting these:

```
✅ Let's meet tomorrow at 3pm EST
✅ Call me in 2 hours PST
✅ Next Monday at 10am
✅ Conference at 10:30 +05:30
✅ Deadline is Oct 15, 2025 at 5pm EST
✅ Meeting at 3pm New York time
```

All should show tooltip with converted time!

---

## 💡 Pro Tips

### Tip 1: Be Explicit
❌ `meeting at 3` - Missing timezone and AM/PM
✅ `meeting at 3pm EST` - Clear and unambiguous

### Tip 2: Use Natural Language
✅ `tomorrow at 3pm` - Easier than typing full date
✅ `next Monday 10am` - Quick weekday reference
✅ `in 2 hours` - Simple relative time

### Tip 3: Include Timezone
Always include timezone for accurate conversion:
- `3pm EST` instead of just `3pm`
- `10am PST` instead of just `10am`

### Tip 4: Check Confidence
Low confidence? Select text to see "Assumptions" in tooltip
- Date inferred? Maybe add explicit date
- Timezone missing? Add timezone abbreviation

### Tip 5: Use Shortforms
- `tmrw` = tomorrow
- `mon`, `tue`, `wed` = weekdays
- `hrs`, `mins` = time units

---

## 🎓 Understanding the Tooltip

### Main Display
```
Converted Time         95% confidence
Oct 10, 2025 6:00 PM  PST/PDT
```
- **Date & Time**: Converted to your timezone
- **Timezone Badge**: Your timezone abbreviation
- **Confidence**: Detection accuracy (70-100%)

### Original Time
```
Original: Oct 10, 2025 3:00 PM  EST/EDT
```
- Shows source time if different from target

### Assumptions
```
⚠️ Assumptions:
• Date (using today)
• Natural language: "tomorrow"
```
- Lists what was inferred
- Helps verify accuracy

### Features
```
📝 Natural Language · ⏱️ Relative Time
```
- Shows which advanced features were used

---

## 🐛 Troubleshooting

### Problem: Tooltip Not Appearing

**Possible Causes:**
1. Extension not enabled
2. Text doesn't match patterns
3. Confidence below threshold (70%)
4. Conflicting extension

**Solutions:**
- Check extension icon (should not be grayed out)
- Try more explicit text (add timezone)
- Check browser console (F12) for logs
- Disable other extensions temporarily

### Problem: Wrong Conversion

**Possible Causes:**
1. Wrong source timezone detected
2. Date inferred incorrectly
3. Ambiguous pattern

**Solutions:**
- Include explicit timezone in text
- Add full date (not just time)
- Check "Assumptions" in tooltip
- Use 12-hour format with AM/PM

### Problem: Slow Performance

**Solutions:**
- Clear browser cache
- Reload extension
- Close unnecessary tabs
- Check Chrome Task Manager

---

## 📚 Next Steps

### Learn More
- 📖 [Full Documentation](./content/detector-documentation.md)
- 📝 [Quick Reference](./content/QUICK-REFERENCE.md)
- 🔄 [Update Summary](./content/UPDATE-SUMMARY.md)

### Advanced Usage
- 🎨 Customize tooltip styling (`ui/tooltip.css`)
- ⚙️ Adjust confidence threshold (`main.js`)
- 🌍 Add custom timezones (`detector.js`)

### Get Help
- 🐛 Found a bug? Check console logs
- 💡 Feature idea? Open an issue
- ❓ Question? Read the docs

---

## ✅ Success Checklist

After following this guide, you should be able to:

- [ ] Extension installed and active
- [ ] Tooltip appears when selecting text
- [ ] Natural language patterns detected
- [ ] Settings panel accessible
- [ ] Target timezone configured
- [ ] Test cases working
- [ ] Understand tooltip information

---

## 🎉 You're Ready!

Congratulations! You're now ready to use Smart TimeZone Converter V5.1

**Start by:**
1. Testing on a real website (Gmail, Slack, etc.)
2. Trying different time formats
3. Experimenting with natural language
4. Sharing with your team!

---

## 💬 Need Help?

- 📖 Full README: [README.md](./README.md)
- 🔧 API Reference: [API.md](./API.md)
- 🧪 Test Suite: [tests/TEST_SUITE.md](./tests/TEST_SUITE.md)
- 📝 Quick Reference: [content/QUICK-REFERENCE.md](./content/QUICK-REFERENCE.md)

---

**Happy timezone converting! 🌍⏰**

*Last updated: October 2025 | Version 5.1.0*