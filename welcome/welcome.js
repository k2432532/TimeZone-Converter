/**
 * Welcome Page Script
 * Handles welcome page interactions
 */

// Open settings when button is clicked
document.getElementById('openSettings').addEventListener('click', function() {
  chrome.runtime.sendMessage({ action: 'openPopup' });
});

// Close tab
document.getElementById('closeTab').addEventListener('click', function() {
  window.close();
});

// Save that welcome page has been shown
chrome.storage.local.set({ welcomeShown: true });
