/**
 * Background Service Worker
 * Handles extension installation, updates, and global state
 */

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  targetTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  version: '5.1.1'
};

/**
 * Installation handler
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[TimeZone Converter V5] Extension installed/updated', details.reason);
  
  if (details.reason === 'install') {
    // First time installation
    initializeSettings();
  } else if (details.reason === 'update') {
    // Extension updated
    handleUpdate(details.previousVersion);
  }
});

/**
 * Initialize settings on first install
 */
async function initializeSettings() {
  try {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
    console.log('[TimeZone Converter V5] Default settings initialized');
    
    // Open welcome page (optional)
    // chrome.tabs.create({ url: 'welcome.html' });
  } catch (error) {
    console.error('[TimeZone Converter V5] Failed to initialize settings:', error);
  }
}

/**
 * Handle extension updates
 */
async function handleUpdate(previousVersion) {
  console.log(`[TimeZone Converter V5] Updated from ${previousVersion} to ${DEFAULT_SETTINGS.version}`);
  
  try {
    // Get current settings
    const settings = await chrome.storage.sync.get(null);
    
    // Merge with new defaults (preserve user settings)
    const updatedSettings = {
      ...DEFAULT_SETTINGS,
      ...settings,
      version: DEFAULT_SETTINGS.version
    };
    
    await chrome.storage.sync.set(updatedSettings);
    console.log('[TimeZone Converter V5] Settings updated');
  } catch (error) {
    console.error('[TimeZone Converter V5] Failed to update settings:', error);
  }
}

/**
 * Handle messages from content scripts or popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[TimeZone Converter V5] Message received:', message);
  
  if (message.action === 'getSettings') {
    handleGetSettings(sendResponse);
    return true;
  } else if (message.action === 'updateSettings') {
    handleUpdateSettings(message.settings, sendResponse);
    return true;
  }
  
  return false;
});

/**
 * Get current settings
 */
async function handleGetSettings(sendResponse) {
  try {
    const settings = await chrome.storage.sync.get(null);
    sendResponse({ success: true, settings });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Update settings
 */
async function handleUpdateSettings(newSettings, sendResponse) {
  try {
    await chrome.storage.sync.set(newSettings);
    console.log('[TimeZone Converter V5] Settings saved:', newSettings);
    sendResponse({ success: true });
  } catch (error) {
    console.error('[TimeZone Converter V5] Failed to save settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle browser action click (if popup is not defined)
 */
chrome.action.onClicked.addListener((tab) => {
  console.log('[TimeZone Converter V5] Extension icon clicked');
  // Optional: Toggle extension on/off
});

console.log('[TimeZone Converter V5] Background service worker initialized');
