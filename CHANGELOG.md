# Changelog

All notable changes to the Smart TimeZone Converter extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.2.1] - 2024-12-19

### Added
- Welcome page for first-time users with interactive tutorials
- Comprehensive test suite (`tests/comprehensive-test.html`)
- Better error reporting to background service worker
- Keyboard support (ESC key to dismiss tooltips)
- State tracking for mouse button (isMouseDown flag)
- Immediate tooltip cleanup function (hideTooltipImmediately)
- Update notifications for major version changes

### Changed
- **MAJOR FIX**: Tooltip now appears only after mouse button release, not while dragging
- Improved selection detection logic with better state management
- Enhanced cleanup mechanism to prevent overlapping tooltips
- Reduced debounce delay from 150ms to 100ms for better responsiveness
- Better handling of rapid selections and deselections
- Improved position calculation for tooltip placement

### Fixed
- Fixed issue where tooltips would appear while still selecting text
- Fixed tooltips not disappearing when clicking outside selection
- Fixed multiple tooltips stacking on top of each other
- Fixed memory leaks from event listeners not being properly cleaned
- Fixed tooltip persistence issues on scroll and window blur
- Fixed XSS vulnerabilities with proper HTML escaping

### Security
- Enhanced input sanitization to prevent XSS attacks
- Added content security policy headers
- Improved error handling to prevent information leakage

## [5.2.0] - 2024-12-18

### Added
- Natural language processing for time detection
- Support for relative time expressions ("in 2 hours", "tomorrow at")
- City-based timezone detection ("New York time", "Tokyo time")
- Confidence scoring system for detection accuracy

### Changed
- Upgraded detection algorithm to v2.0
- Improved pattern matching for various time formats

## [5.1.1] - 2024-12-17

### Changed
- Switched to selection-only mode (removed hover detection)
- Performance optimizations for large text blocks

### Fixed
- Fixed false positives in time detection
- Fixed tooltip positioning near viewport edges

## [5.1.0] - 2024-12-15

### Added
- Initial release with basic timezone conversion
- Support for standard time formats (12-hour, 24-hour)
- 100+ timezone support
- Elegant tooltip design

### Features
- Text selection detection
- Automatic timezone conversion
- Settings popup for configuration
- Chrome storage sync for settings

---

## Version Guidelines

### Version Number Format: MAJOR.MINOR.PATCH

- **MAJOR**: Incompatible API changes or complete rewrites
- **MINOR**: New functionality in a backwards compatible manner
- **PATCH**: Backwards compatible bug fixes

### Release Process
1. Update version in `manifest.json`
2. Update version in `README.md`
3. Update this CHANGELOG.md
4. Create git tag: `git tag -a v5.2.1 -m "Release version 5.2.1"`
5. Push to repository: `git push origin main --tags`# Version 5.2.5 - UTC Offset with Date Support

## Added
- **New Pattern Support**: Added detection for "TIME UTC+OFFSET on DATE" format
  - Example: "2:15 AM UTC+5:30 on 01/12/2025" now correctly detected
- **Intelligent Date Format Detection**: Automatically determines MM/DD vs DD/MM format based on:
  - Number values (if day > 12 or month > 12)
  - Separator hints (/ = US format, - or . = EU format)

## Fixed
- UTC offset patterns with dates now parse correctly
- Improved date parsing logic for numeric date formats

## Technical Changes
- Added new pattern type: `time_utc_offset_with_date` with priority 3
- Added `parseUTCOffsetWithDate()` function in detector.js
- Enhanced converter.js to handle UTC offset with date conversions
- Updated claude.md documentation

---

# Version 5.2.4 - Date Bug Fix

## Fixed
- **Date off-by-one bug**: Fixed issue where "11 Oct 7 PM EST" was showing as Oct 10 instead of Oct 11
- Improved date comparison logic to handle current-day dates correctly

## Technical Changes
- `detector.js`: Updated `parseDayMonthTimeTz()` function to properly compare dates
- `detector.js`: Fixed similar logic in `parseTimeTzOnDate()` function

---

