/**
 * Main Content Script V5.2 - Enhanced Selection Detection
 * Improved tooltip behavior and cleanup
 * - Fixed: Tooltip now appears only after mouse release
 * - Fixed: Proper tooltip cleanup on deselection
 * - Added: Better state management and error handling
 * - Added: Performance optimizations
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    maxTextLength: 500,        // max text length to process
    debounceDelay: 100,        // reduced debounce delay for better responsiveness
    tooltipOffset: 12,         // pixels from cursor/selection
    minConfidence: 70,         // minimum confidence score (0-100)
    showConfidence: true,      // show confidence in tooltip
    tooltipTimeout: 300        // delay before showing tooltip to prevent flashing
  };

  // State management
  let detector = null;
  let converter = null;
  let tooltip = null;
  let userTimezone = null;
  let isEnabled = true;
  let lastProcessedText = '';
  let tooltipTimer = null;
  let isMouseDown = false;  // Track mouse button state
  let selectionMade = false; // Track if valid selection was made

  /**
   * Initialize extension
   */
  function init() {
    console.log('[TimeZone Converter V5.2] Initializing (Enhanced Selection Mode)...');
    
    // Create instances
    detector = new DateTimeDetector();
    converter = new TimeZoneConverter();
    
    // Get user's timezone
    userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('[TimeZone Converter V5.2] User timezone:', userTimezone);
    
    // Load settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('[TimeZone Converter V5.2] Ready! Select text to convert times.');
  }

  /**
   * Load settings from storage
   */
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['targetTimezone', 'enabled']);
      userTimezone = result.targetTimezone || userTimezone;
      isEnabled = result.enabled !== false;
      console.log('[TimeZone Converter V5.2] Settings loaded:', { userTimezone, isEnabled });
    } catch (error) {
      console.log('[TimeZone Converter V5.2] Using default settings');
    }
  }

  /**
   * Setup event listeners with improved handling
   */
  function setupEventListeners() {
    // Track mouse button state
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    
    // Handle selection changes with debouncing
    document.addEventListener('selectionchange', debounce(handleSelectionChange, CONFIG.debounceDelay));
    
    // Hide tooltip on these events
    document.addEventListener('scroll', hideTooltipImmediately, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);
    
    // Handle window blur/focus
    window.addEventListener('blur', hideTooltipImmediately);
    
    // Special handling for Gmail and webmail (contenteditable)
    setupContentEditableHandlers();
    
    // Listen for dynamically added content
    setupMutationObserver();
    
    // Listen for settings changes
    chrome.storage.onChanged.addListener(handleStorageChange);
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(handleMessage);
  }

  /**
   * Handle mouse down - track button state and hide tooltip
   */
  function handleMouseDown(e) {
    isMouseDown = true;
    hideTooltipImmediately();
  }

  /**
   * Handle mouse up - process selection only after release
   */
  function handleMouseUp(e) {
    isMouseDown = false;
    
    if (!isEnabled) return;
    
    // Use a small delay to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText && selectedText.length > 0 && selectedText.length < CONFIG.maxTextLength) {
        selectionMade = true;
        
        // Calculate position based on selection bounds
        let x = e.pageX || e.clientX + window.scrollX;
        let y = e.pageY || e.clientY + window.scrollY;
        
        if (selection.rangeCount > 0) {
          try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              x = rect.left + rect.width / 2 + window.scrollX;
              y = rect.top + window.scrollY;
            }
          } catch (err) {
            console.log('[TZ Converter] Could not get selection rect:', err);
          }
        }
        
        processText(selectedText, x, y, 'selection');
      } else {
        selectionMade = false;
      }
    }, 50);
  }

  /**
   * Handle selection change - only process if mouse is not down
   */
  function handleSelectionChange() {
    if (!isEnabled || isMouseDown) return;
    
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    // If no text selected, hide tooltip
    if (!selectedText || selectedText.length === 0) {
      selectionMade = false;
      hideTooltipImmediately();
      lastProcessedText = '';
      return;
    }
    
    // Don't process if we're in the middle of selecting (mouse is down)
    if (isMouseDown) return;
    
    // Only process if we have a valid selection and mouse was released
    if (selectionMade && selectedText.length < CONFIG.maxTextLength && selection.rangeCount > 0) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const x = rect.left + rect.width / 2 + window.scrollX;
        const y = rect.top + window.scrollY;
        
        processText(selectedText, x, y, 'selection-change');
      } catch (err) {
        console.log('[TZ Converter] Selection change error:', err);
      }
    }
  }

  /**
   * Handle click events - hide tooltip if clicking outside selection
   */
  function handleClick(e) {
    // Don't hide if clicking on the tooltip itself
    if (tooltip && tooltip.contains(e.target)) return;
    
    // Check if click is outside current selection
    const selection = window.getSelection();
    if (!selection.toString().trim()) {
      hideTooltipImmediately();
    }
  }

  /**
   * Handle keyboard events
   */
  function handleKeyDown(e) {
    // Hide tooltip on Escape key
    if (e.key === 'Escape') {
      hideTooltipImmediately();
    }
  }

  /**
   * Setup handlers for contenteditable elements
   */
  function setupContentEditableHandlers() {
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    editableElements.forEach(element => {
      attachEditableListeners(element);
    });
  }

  /**
   * Attach listeners to a contenteditable element
   */
  function attachEditableListeners(element) {
    if (element.dataset.tzListeners) return;
    element.dataset.tzListeners = 'true';
    
    element.addEventListener('mousedown', handleMouseDown, true);
    element.addEventListener('mouseup', handleMouseUp, true);
  }

  /**
   * Setup mutation observer to detect dynamically added content
   */
  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.contentEditable === 'true') {
              attachEditableListeners(node);
            }
            const editables = node.querySelectorAll?.('[contenteditable="true"]');
            if (editables) {
              editables.forEach(attachEditableListeners);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Process text for date/time detection
   */
  function processText(text, x, y, source) {
    // Don't process if mouse is still down
    if (isMouseDown) return;
    
    // Avoid reprocessing same text
    if (text === lastProcessedText && tooltip) return;
    
    lastProcessedText = text;
    
    // Clear any pending tooltip timer
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }
    
    // Detect date/time pattern
    const detected = detector.detect(text);
    
    if (!detected || !detected.parsed) {
      hideTooltipImmediately();
      return;
    }

    // Confidence-based filtering
    if (detected.confidence && detected.confidence < CONFIG.minConfidence) {
      console.log(`[TZ Converter] Low confidence (${detected.confidence}%) - skipping:`, detected.matched);
      hideTooltipImmediately();
      return;
    }
    
    console.log('[TZ Converter] Detected:', {
      matched: detected.matched,
      type: detected.type,
      confidence: detected.confidence,
      parsed: detected.parsed
    });
    
    // Convert to user's timezone
    detected.parsed.fullText = detected.matched;
    detected.parsed.confidence = detected.confidence;
    const converted = converter.convert(detected.parsed, userTimezone);
    
    if (!converted) {
      hideTooltipImmediately();
      return;
    }
    
    console.log('[TZ Converter] Converted:', converted);
    
    // Show tooltip with a small delay to prevent flashing
    tooltipTimer = setTimeout(() => {
      showTooltip(converted, x, y, detected);
    }, CONFIG.tooltipTimeout);
  }

  /**
   * Show tooltip with conversion result
   */
  function showTooltip(result, x, y, detected) {
    // Clean up any existing tooltip first
    hideTooltipImmediately();
    
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'tz-converter-tooltip';
    tooltipElement.setAttribute('role', 'tooltip');
    tooltipElement.setAttribute('aria-live', 'polite');
    
    const content = buildTooltipContent(result, detected);
    tooltipElement.innerHTML = content;
    
    document.body.appendChild(tooltipElement);
    tooltip = tooltipElement;
    
    // Position and show tooltip
    requestAnimationFrame(() => {
      if (!tooltipElement.parentNode) return;
      
      positionTooltip(tooltipElement, x, y);
      
      requestAnimationFrame(() => {
        if (tooltipElement.parentNode) {
          tooltipElement.classList.add('visible');
        }
      });
    });
  }

  /**
   * Build tooltip HTML content with enhanced security
   */
  function buildTooltipContent(result, detected) {
    const { source, target, inferred, confidence, metadata } = result;
    
    // Ensure all dynamic content is escaped
    const safeTarget = {
      datetime: escapeHtml(target.datetime || ''),
      timezone: escapeHtml(target.timezone || '')
    };
    
    const safeSource = {
      datetime: escapeHtml(source.datetime || ''),
      timezone: escapeHtml(source.timezone || ''),
      timezoneIANA: source.timezoneIANA
    };
    
    let html = `
      <div class="tooltip-header">
        Converted Time
        ${CONFIG.showConfidence && confidence ? `
          <span style="float: right; font-size: 10px; opacity: 0.8;">
            ${escapeHtml(String(confidence))}% confidence
          </span>
        ` : ''}
      </div>
      <div class="tooltip-main">
        <div class="converted-time">
          ${safeTarget.datetime}
          <span class="timezone-badge">${safeTarget.timezone}</span>
        </div>
      </div>
    `;
    
    // Show source time if different from target
    if (safeSource.timezoneIANA !== target.timezoneIANA) {
      html += `
        <div class="tooltip-source">
          Original: ${safeSource.datetime}
          <span class="timezone-badge secondary">${safeSource.timezone}</span>
        </div>
      `;
    }
    
    // Show inferred information with proper escaping
    if (inferred && inferred.length > 0) {
      html += `
        <div class="tooltip-inferred">
          <div class="inferred-label">⚠️ Assumptions:</div>
          <ul class="inferred-list">
            ${inferred.map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Show metadata for advanced features
    if (metadata && (metadata.hasNaturalLanguage || metadata.isRelativeTime)) {
      const features = [];
      if (metadata.hasNaturalLanguage) features.push('📝 Natural Language');
      if (metadata.isRelativeTime) features.push('⏱️ Relative Time');
      
      html += `
        <div style="margin-top: 8px; font-size: 10px; opacity: 0.7; text-align: center;">
          ${features.map(f => escapeHtml(f)).join(' · ')}
        </div>
      `;
    }
    
    return html;
  }

  /**
   * Position tooltip within viewport
   */
  function positionTooltip(element, x, y) {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.pageXOffset || window.scrollX || 0;
    const scrollY = window.pageYOffset || window.scrollY || 0;
    
    // Validate coordinates
    if (!x || !y || isNaN(x) || isNaN(y)) {
      console.warn('[TZ Converter] Invalid coordinates:', { x, y });
      x = viewportWidth / 2;
      y = viewportHeight / 2;
    }
    
    // Calculate initial position
    let left = x - rect.width / 2;
    let top = y - rect.height - CONFIG.tooltipOffset;
    
    // Ensure tooltip stays within viewport
    const minLeft = scrollX + 10;
    const maxLeft = scrollX + viewportWidth - rect.width - 10;
    
    if (left < minLeft) left = minLeft;
    else if (left > maxLeft) left = maxLeft;
    
    const minTop = scrollY + 10;
    const maxTop = scrollY + viewportHeight - rect.height - 10;
    
    // If tooltip would appear above viewport, show below selection
    if (top < minTop) {
      top = y + CONFIG.tooltipOffset;
    }
    
    // Ensure tooltip doesn't go below viewport
    if (top > maxTop) top = maxTop;
    if (top < minTop) top = minTop;
    
    // Apply positioning
    element.style.position = 'fixed';
    element.style.left = `${left - scrollX}px`;
    element.style.top = `${top - scrollY}px`;
    element.style.zIndex = '2147483647'; // Maximum z-index
  }

  /**
   * Hide tooltip immediately without animation
   */
  function hideTooltipImmediately() {
    // Clear any pending tooltip timer
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }
    
    // Remove tooltip if it exists
    if (tooltip && tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
      tooltip = null;
    }
    
    // Reset state
    lastProcessedText = '';
  }

  /**
   * Hide tooltip with animation
   */
  function hideTooltip() {
    // Clear any pending tooltip timer
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }
    
    if (tooltip && tooltip.parentNode) {
      tooltip.classList.remove('visible');
      setTimeout(() => {
        if (tooltip && tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
        tooltip = null;
      }, 200);
    }
    
    lastProcessedText = '';
  }

  /**
   * Handle storage changes
   */
  function handleStorageChange(changes, namespace) {
    if (namespace === 'sync') {
      if (changes.targetTimezone) {
        userTimezone = changes.targetTimezone.newValue;
        console.log('[TZ Converter] Timezone updated:', userTimezone);
      }
      if (changes.enabled) {
        isEnabled = changes.enabled.newValue;
        if (!isEnabled) hideTooltipImmediately();
        console.log('[TZ Converter] Extension enabled:', isEnabled);
      }
    }
  }

  /**
   * Handle messages from popup
   */
  function handleMessage(message, sender, sendResponse) {
    if (message.action === 'toggle') {
      isEnabled = message.enabled;
      if (!isEnabled) hideTooltipImmediately();
      sendResponse({ success: true });
    } else if (message.action === 'updateTimezone') {
      userTimezone = message.timezone;
      sendResponse({ success: true });
    }
    return true;
  }

  /**
   * Debounce utility
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();