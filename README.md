# 🌍 Smart TimeZone Converter V5.2.1

**A next-generation Chrome extension that intelligently detects, converts, and displays date/time information when you select text. Features natural language processing, 100+ timezones, and elegant tooltips.**

[![Version](https://img.shields.io/badge/version-5.2.1-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()
[![Chrome](https://img.shields.io/badge/chrome-88%2B-yellow.svg)]()

---

## ✨ What's New in V5.2.1

### 🎯 Enhanced Selection Detection
- **Improved Mouse Release Detection**: Tooltip now appears only after you release the mouse button
- **Better Cleanup**: Tooltips properly disappear when text is deselected or when clicking elsewhere
- **No More Overlapping**: Fixed issue where multiple tooltips could stack on top of each other
- **Keyboard Support**: Press ESC to quickly dismiss tooltips

### 🚀 User Experience Improvements
- **Welcome Page**: New users see a comprehensive guide on first installation
- **Better Onboarding**: Clear instructions on how to use the extension
- **Interactive Demo**: Try the extension directly on the welcome page
- **Performance Optimizations**: Reduced debounce delays for more responsive tooltips

### 🛡️ Quality & Security
- **XSS Protection**: All user input is properly sanitized
- **Error Handling**: Graceful handling of edge cases and invalid inputs
- **State Management**: Improved tracking of mouse and selection states
- **Memory Management**: Better cleanup of event listeners and DOM elements

---

## 🚀 Features

### Core Functionality
- ✅ **Selection-Only Detection**: Select text and release to see conversions
- ✅ **Smart AI Detection**: Natural language processing with confidence scores
- ✅ **100+ Timezones**: Support for all major world timezones
- ✅ **Instant Conversion**: No clicks or keyboard shortcuts needed
- ✅ **Clean Design**: Beautiful, non-intrusive tooltips
- ✅ **Privacy First**: All processing done locally, no data sent anywhere

### Detection Capabilities

#### Traditional Formats
```
✅ 10:30 AM EST
✅ 2:45 PM PST  
✅ 14:00 GMT
✅ Noon EST
✅ 3:25:45 PM CST
```

#### Natural Language
```
✅ tomorrow at 3pm EST
✅ next Monday 10am PST
✅ in 2 hours EST
✅ tmrw at 2pm
✅ yesterday at noon GMT
```

#### City-Based Times
```
✅ 3pm New York time
✅ 10am London time
✅ 9:00 AM Tokyo time
✅ 2pm Sydney time
✅ 4pm Dubai time
```

#### UTC Offsets
```
✅ 10:30 +05:30
✅ 2pm UTC+8
✅ 15:00 GMT-5
✅ 12:00 UTC
```

---

## 📦 Installation

### From Source
1. Clone this repository or download the ZIP
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

### First Time Setup
1. On installation, a welcome page will open automatically
2. Click the extension icon to configure your preferred timezone
3. Start selecting text with time information on any webpage!

---

## 🎮 How to Use

### Basic Usage
1. **Select Text**: Click and drag to highlight any text containing time information
2. **Release Mouse**: Release the mouse button to trigger detection
3. **View Conversion**: A tooltip appears showing the converted time
4. **Dismiss**: Click elsewhere, press ESC, or select new text to hide the tooltip

### Tips & Tricks
- **Double-click** a time to quickly select it
- **Triple-click** to select an entire line with time info
- Use **keyboard selection** (Shift+Arrow keys) for precise control
- The extension works on **all websites** including Gmail, Slack, Calendar apps

---

## ⚙️ Configuration

### Settings (via Extension Popup)
- **Target Timezone**: Choose from 30+ major timezones
- **Enable/Disable**: Toggle the extension on/off
- **Auto-save**: Settings are automatically synced

### Supported Timezones Include:
- All US timezones (EST, CST, MST, PST, AKST, HST)
- European cities (London, Paris, Berlin, Rome, Moscow)
- Asian cities (Tokyo, Singapore, Hong Kong, Dubai, Mumbai)
- Pacific (Sydney, Auckland, Perth)
- And many more!

---

## 🧪 Testing

### Comprehensive Test Suite
Open `tests/comprehensive-test.html` in Chrome to test:
- Basic time format detection
- Natural language processing
- City-based timezone detection
- UTC offset handling
- Edge cases and error handling
- Performance with large text blocks
- Security (XSS prevention)
- Interactive elements (contenteditable, inputs)

### Quick Test
Select any of these to test: "Meeting at 3pm EST", "tomorrow at noon PST", "10:30 +05:30"

---

## 🔒 Privacy & Security

- **No Data Collection**: The extension doesn't collect or transmit any data
- **Local Processing**: All timezone conversions happen on your device
- **No External APIs**: No network requests are made
- **XSS Protection**: All content is sanitized before display
- **Open Source**: Full code transparency

---

## 🐛 Troubleshooting

### Tooltip Not Appearing?
1. Ensure the extension is enabled (check the toggle in the popup)
2. Make sure you're selecting text that contains time information
3. Release the mouse button after selection
4. Check if the page has special restrictions (some banking sites block extensions)

### Tooltip Not Disappearing?
1. Click anywhere on the page
2. Press the ESC key
3. Select different text
4. Scroll the page

### Wrong Timezone?
1. Click the extension icon
2. Select your preferred timezone from the dropdown
3. Click "Save Settings"

---

## 🛠️ Technical Details

### Architecture
- **Content Script**: Handles text selection and tooltip display
- **Detector Module**: Pattern matching and natural language processing
- **Converter Module**: Timezone conversion logic
- **Background Service Worker**: Settings management and persistence

### Performance
- Debounced event handlers (100ms)
- Caching for repeated conversions
- Efficient DOM manipulation
- Lazy loading of resources

---

## 📝 Changelog

### Version 5.2.1 (Current)
- Fixed: Tooltip now only appears after mouse button release
- Fixed: Proper cleanup of tooltips on deselection
- Fixed: Prevented multiple overlapping tooltips
- Added: Welcome page for new users
- Added: Better error handling and state management
- Added: Keyboard shortcuts (ESC to dismiss)
- Improved: Overall performance and responsiveness

### Version 5.1.1
- Removed hover detection (selection-only mode)
- Added natural language support
- Improved confidence scoring
- Performance optimizations

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Support

If you encounter any issues or have suggestions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Open an issue on GitHub
3. Contact the development team

---

## 🙏 Acknowledgments

- Built with modern JavaScript and Chrome Extension APIs
- Timezone data from IANA Time Zone Database
- Icons from the Chrome Extension community
- Inspired by the need for seamless global collaboration

---

<p align="center">Made with ❤️ for global teams and remote workers</p>