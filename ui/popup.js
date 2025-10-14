/**
 * Popup Script - Settings UI Logic (updated)
 */

// Common timezones list
const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
  { value: 'Australia/Perth', label: 'Perth (AWST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' }
];

// DOM Elements
let toggleSwitch;
let timezoneSelect;
let saveButton;
let statusMessage;

// State
let currentSettings = {
  enabled: true,
  targetTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

async function init() {
  console.log('[Popup] Initializing...');

  // Get DOM elements safely
  toggleSwitch = document.getElementById('toggleSwitch');
  timezoneSelect = document.getElementById('timezoneSelect');
  saveButton = document.getElementById('saveButton');
  statusMessage = document.getElementById('statusMessage');

  if (!toggleSwitch || !timezoneSelect || !saveButton || !statusMessage) {
    console.error('[Popup] Required DOM elements missing.');
    return;
  }

  await loadSettings();
  populateTimezones();
  setupEventListeners();
  updateUI();

  console.log('[Popup] Ready!');
}

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['enabled', 'targetTimezone']);
    currentSettings.enabled = (result.enabled === undefined) ? true : result.enabled;
    currentSettings.targetTimezone = result.targetTimezone || currentSettings.targetTimezone;
    console.log('[Popup] Settings loaded:', currentSettings);
  } catch (error) {
    console.error('[Popup] Failed to load settings:', error);
  }
}

function populateTimezones() {
  timezoneSelect.innerHTML = '';

  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isCurrentInList = COMMON_TIMEZONES.some(tz => tz.value === currentTz);

  if (!isCurrentInList) {
    const option = document.createElement('option');
    option.value = currentTz;
    option.textContent = `${currentTz} (Your Current)`;
    timezoneSelect.appendChild(option);

    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────────';
    timezoneSelect.appendChild(separator);
  }

  COMMON_TIMEZONES.forEach(tz => {
    const option = document.createElement('option');
    option.value = tz.value;
    option.textContent = (tz.value === currentTz) ? `${tz.label} (Current)` : tz.label;
    timezoneSelect.appendChild(option);
  });

  // If saved timezone present but not in select, try to append it
  if (currentSettings.targetTimezone && !Array.from(timezoneSelect.options).some(o => o.value === currentSettings.targetTimezone)) {
    const opt = document.createElement('option');
    opt.value = currentSettings.targetTimezone;
    opt.textContent = `${currentSettings.targetTimezone} (Saved)`;
    timezoneSelect.insertBefore(opt, timezoneSelect.firstChild);
  }
}

function setupEventListeners() {
  toggleSwitch.addEventListener('click', () => {
    currentSettings.enabled = !currentSettings.enabled;
    updateUI();
  });

  timezoneSelect.addEventListener('change', (e) => {
    currentSettings.targetTimezone = e.target.value;
  });

  saveButton.addEventListener('click', saveSettings);

  timezoneSelect.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveSettings();
  });
}

function updateUI() {
  if (currentSettings.enabled) toggleSwitch.classList.add('active');
  else toggleSwitch.classList.remove('active');

  // set select value if present, otherwise keep default
  if (currentSettings.targetTimezone) {
    try {
      timezoneSelect.value = currentSettings.targetTimezone;
    } catch (e) {
      // fallback: ignore if value not found
    }
  }
}

async function saveSettings() {
  try {
    await chrome.storage.sync.set(currentSettings);
    console.log('[Popup] Settings saved:', currentSettings);
    showStatus('Settings saved successfully.');

    // Notify content scripts defensively: iterate tabs and send message with callback
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        try {
          chrome.tabs.sendMessage(tab.id, { action: 'toggle', enabled: currentSettings.enabled }, (resp) => {
            if (chrome.runtime.lastError) {
              // tab may not have listener; ignore
            }
          });
        } catch (err) {
          // ignore
        }

        try {
          chrome.tabs.sendMessage(tab.id, { action: 'updateTimezone', timezone: currentSettings.targetTimezone }, (resp) => {
            if (chrome.runtime.lastError) {
              // ignore
            }
          });
        } catch (err) {
          // ignore
        }
      });
    });
  } catch (error) {
    console.error('[Popup] Failed to save settings:', error);
    showStatus('Failed to save settings', true);
  }
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  // grayscale backgrounds for status (no colored tints)
  statusMessage.style.background = isError ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.06)';
  statusMessage.style.color = isError ? '#000' : '#000';
  statusMessage.classList.add('show');

  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', init);