/**
 * Background Service Worker V5.2.2
 * Enhanced with onboarding and better error handling
 */

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  targetTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  version: '5.2.2'
};

/**
 * Installation handler
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[TimeZone Converter V5.2] Extension installed/updated', details.reason);
  
  if (details.reason === 'install') {
    // First time installation
    initializeSettings();
    showWelcomePage();
  } else if (details.reason === 'update') {
    // Extension updated
    handleUpdate(details.previousVersion);
  }
});

/**
 * Show welcome page on first install
 */
async function showWelcomePage() {
  try {
    // Check if welcome page has been shown before
    const { welcomeShown } = await chrome.storage.local.get('welcomeShown');
    
    if (!welcomeShown) {
      // Open welcome page in a new tab
      chrome.tabs.create({ 
        url: chrome.runtime.getURL('welcome/welcome.html'),
        active: true
      });
      
      console.log('[TimeZone Converter V5.2] Welcome page opened');
    }
  } catch (error) {
    console.error('[TimeZone Converter V5.2] Failed to open welcome page:', error);
  }
}

/**
 * Initialize settings on first install
 */
async function initializeSettings() {
  try {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
    console.log('[TimeZone Converter V5.2] Default settings initialized');
  } catch (error) {
    console.error('[TimeZone Converter V5.2] Failed to initialize settings:', error);
  }
}

/**
 * Handle extension updates
 */
async function handleUpdate(previousVersion) {
  console.log(`[TimeZone Converter V5.2] Updated from ${previousVersion} to ${DEFAULT_SETTINGS.version}`);
  
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
    console.log('[TimeZone Converter V5.2] Settings updated');
    
    // Show update notification for major updates
    if (previousVersion && previousVersion.startsWith('5.1')) {
      showUpdateNotification();
    }
  } catch (error) {
    console.error('[TimeZone Converter V5.2] Failed to update settings:', error);
  }
}

/**
 * Show update notification
 */
function showUpdateNotification() {
  if (chrome.notifications && chrome.notifications.create) {
    chrome.notifications.create('update-notification', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icon128.png'),
      title: 'TimeZone Converter Updated!',
      message: 'Version 5.2.2: Fixed CSP errors and updated UI to grayscale theme.',
      buttons: [
        { title: 'See What\'s New' }
      ],
      priority: 1
    });
  }
}

/**
 * Handle notification button clicks
 */
if (chrome.notifications && chrome.notifications.onButtonClicked) {
  chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationId === 'update-notification' && buttonIndex === 0) {
      chrome.tabs.create({ 
        url: chrome.runtime.getURL('welcome/welcome.html'),
        active: true
      });
    }
  });
}

/**
 * Handle messages from content scripts or popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[TimeZone Converter V5.2] Message received:', message);
  
  switch (message.action) {
    case 'getSettings':
      handleGetSettings(sendResponse);
      return true;
      
    case 'updateSettings':
      handleUpdateSettings(message.settings, sendResponse);
      return true;
      
    case 'openPopup':
      // Open the popup programmatically (if needed)
      chrome.action.openPopup();
      sendResponse({ success: true });
      return true;
      
    case 'reportError':
      handleErrorReport(message.error, sender, sendResponse);
      return true;
      
    default:
      return false;
  }
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
    console.log('[TimeZone Converter V5.2] Settings saved:', newSettings);
    
    // Notify all tabs about settings change
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'settingsUpdated',
        settings: newSettings
      }).catch(() => {
        // Tab might not have content script loaded
      });
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('[TimeZone Converter V5.2] Failed to save settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle error reports from content scripts
 */
async function handleErrorReport(error, sender, sendResponse) {
  console.error('[TimeZone Converter V5.2] Error reported:', {
    error,
    tab: sender.tab?.url,
    frameId: sender.frameId
  });
  
  // Store error for debugging (optional)
  try {
    const { errors = [] } = await chrome.storage.local.get('errors');
    errors.push({
      timestamp: new Date().toISOString(),
      error: error,
      url: sender.tab?.url,
      version: DEFAULT_SETTINGS.version
    });
    
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.splice(0, errors.length - 50);
    }
    
    await chrome.storage.local.set({ errors });
    sendResponse({ success: true });
  } catch (e) {
    sendResponse({ success: false, error: e.message });
  }
}

/**
 * Handle browser action click (if popup is not defined)
 */
chrome.action.onClicked.addListener((tab) => {
  console.log('[TimeZone Converter V5.2] Extension icon clicked');
});

/**
 * Keep service worker alive
 */
const keepAlive = () => {
  // Simple keep-alive to prevent service worker from going idle
  setTimeout(keepAlive, 20000);
};
keepAlive();

console.log('[TimeZone Converter V5.2] Background service worker initialized');