/**
 * Main Content Script V2
 * Enhanced to work with DateTimeDetector V2.0
 * - Confidence-based filtering
 * - Natural language support
 * - Relative time detection
 * - Performance optimizations
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    hoverDelay: 300,           // ms to wait before detecting on hover
    maxTextLength: 500,        // max text length to process
    debounceDelay: 150,        // debounce delay for events
    tooltipOffset: 12,         // pixels from cursor/selection
    minConfidence: 70,         // minimum confidence score (0-100)
    showConfidence: true       // show confidence in tooltip
  };

  // State
  let detector = null;
  let converter = null;
  let tooltip = null;
  let userTimezone = null;
  let isEnabled = true;
  let hoverTimer = null;
  let lastProcessedText = '';

  /**
   * Initialize extension
   */
  function init() {
    console.log('[TimeZone Converter V5.1] Initializing with enhanced detector...');
    
    // Create instances
    detector = new DateTimeDetector();
    converter = new TimeZoneConverter();
    
    // Get user's timezone
    userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('[TimeZone Converter V5.1] User timezone:', userTimezone);
    
    // Load settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('[TimeZone Converter V5.1] Ready! Features: Natural Language, Relative Time, 100+ Timezones');
  }

  /**
   * Load settings from storage
   */
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['targetTimezone', 'enabled']);
      userTimezone = result.targetTimezone || userTimezone;
      isEnabled = result.enabled !== false;
      console.log('[TimeZone Converter V5.1] Settings loaded:', { userTimezone, isEnabled });
    } catch (error) {
      console.log('[TimeZone Converter V5.1] Using default settings');
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Selection events (highest priority for user intent)
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('selectionchange', debounce(handleSelectionChange, CONFIG.debounceDelay));
    
    // Hover events (secondary, passive detection)
    document.addEventListener('mousemove', debounce(handleMouseMove, CONFIG.hoverDelay), true);
    
    // Hide tooltip on scroll/click
    document.addEventListener('scroll', hideTooltip, true);
    document.addEventListener('mousedown', hideTooltip, true);
    
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
   * Setup handlers for contenteditable elements (Gmail, webmail)
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
    
    element.addEventListener('mouseup', (e) => {
      if (!isEnabled) return;
      setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (selectedText && selectedText.length < CONFIG.maxTextLength) {
          processText(selectedText, e.clientX, e.clientY, 'selection');
        }
      }, 50);
    }, true);
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
   * Handle mouse up (text selection)
   */
  function handleMouseUp(e) {
    if (!isEnabled) return;
    
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText && selectedText.length < CONFIG.maxTextLength) {
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
      }
    }, 50);
  }

  /**
   * Handle selection change
   */
  function handleSelectionChange() {
    if (!isEnabled) return;
    
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (!selectedText) {
      hideTooltip();
      return;
    }
    
    if (selectedText.length < CONFIG.maxTextLength && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + window.scrollY;
      
      processText(selectedText, x, y, 'selection');
    }
  }

  /**
   * Handle mouse move (hover detection)
   */
  function handleMouseMove(e) {
    if (!isEnabled) return;
    
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }
    
    hoverTimer = setTimeout(() => {
      const element = e.target;
      const text = element.textContent?.trim() || '';
      
      if (text && text.length < CONFIG.maxTextLength) {
        processText(text, e.pageX, e.pageY, 'hover');
      }
    }, CONFIG.hoverDelay);
  }

  /**
   * Process text for date/time detection
   * Enhanced with confidence filtering
   */
  function processText(text, x, y, source) {
    // Avoid reprocessing same text
    if (text === lastProcessedText) return;
    lastProcessedText = text;
    
    // Detect date/time pattern with new detector
    const detected = detector.detect(text);
    
    if (!detected || !detected.parsed) {
      if (source === 'selection') {
        hideTooltip();
      }
      return;
    }

    // Confidence-based filtering
    if (detected.confidence && detected.confidence < CONFIG.minConfidence) {
      console.log(`[TZ Converter] Low confidence (${detected.confidence}%) - skipping:`, detected.matched);
      if (source === 'selection') {
        hideTooltip();
      }
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
    
    if (!converted) return;
    
    console.log('[TZ Converter] Converted:', converted);
    
    // Show tooltip with confidence info
    showTooltip(converted, x, y, detected);
  }

  /**
   * Show tooltip with conversion result
   * Enhanced to show confidence and metadata
   */
  function showTooltip(result, x, y, detected) {
    hideTooltip();
    
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'tz-converter-tooltip';
    tooltipElement.setAttribute('role', 'tooltip');
    tooltipElement.setAttribute('aria-live', 'polite');
    
    const content = buildTooltipContent(result, detected);
    tooltipElement.innerHTML = content;
    
    document.body.appendChild(tooltipElement);
    tooltip = tooltipElement;
    
    console.log('[TZ Converter] Tooltip element created');
    
    requestAnimationFrame(() => {
      if (!tooltipElement.parentNode) return;
      
      console.log('[TZ Converter] First RAF - positioning tooltip');
      positionTooltip(tooltipElement, x, y);
      
      requestAnimationFrame(() => {
        if (tooltipElement.parentNode) {
          console.log('[TZ Converter] Second RAF - adding visible class');
          tooltipElement.classList.add('visible');
        }
      });
    });
  }

  /**
   * Build tooltip HTML content
   * Enhanced with confidence and metadata display
   */
  function buildTooltipContent(result, detected) {
    const { source, target, inferred, confidence, metadata } = result;
    
    let html = `
      <div class="tooltip-header">
        Converted Time
        ${CONFIG.showConfidence && confidence ? `
          <span style="float: right; font-size: 10px; opacity: 0.8;">
            ${confidence}% confidence
          </span>
        ` : ''}
      </div>
      <div class="tooltip-main">
        <div class="converted-time">
          ${escapeHtml(target.datetime)}
          <span class="timezone-badge">${escapeHtml(target.timezone)}</span>
        </div>
      </div>
    `;
    
    // Show source time if different from target
    if (source.timezoneIANA !== target.timezoneIANA) {
      html += `
        <div class="tooltip-source">
          Original: ${escapeHtml(source.datetime)}
          <span class="timezone-badge secondary">${escapeHtml(source.timezone)}</span>
        </div>
      `;
    }
    
    // Show inferred information
    if (inferred && inferred.length > 0) {
      html += `
        <div class="tooltip-inferred">
          <div class="inferred-label">⚠️ Assumptions:</div>
          <ul class="inferred-list">
            ${inferred.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
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
          ${features.join(' · ')}
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
    
    if (!x || !y || isNaN(x) || isNaN(y)) {
      console.warn('[TZ Converter] Invalid coordinates:', { x, y });
      x = viewportWidth / 2;
      y = viewportHeight / 2;
    }
    
    console.log('[TZ Converter] Positioning tooltip:', {
      inputX: x,
      inputY: y,
      rectWidth: rect.width,
      rectHeight: rect.height,
      scrollX,
      scrollY
    });
    
    let left = x - rect.width / 2;
    let top = y - rect.height - CONFIG.tooltipOffset;
    
    if (!rect.width || !rect.height) {
      console.warn('[TZ Converter] Invalid tooltip dimensions');
      left = Math.max(10, Math.min(x - 150, viewportWidth - 310));
      top = Math.max(10, y - 120);
    } else {
      const minLeft = scrollX + 10;
      const maxLeft = scrollX + viewportWidth - rect.width - 10;
      
      if (left < minLeft) left = minLeft;
      else if (left > maxLeft) left = maxLeft;
      
      const minTop = scrollY + 10;
      const maxTop = scrollY + viewportHeight - rect.height - 10;
      
      if (top < minTop) top = y + CONFIG.tooltipOffset;
      if (top > maxTop) top = maxTop;
      if (top < minTop) top = minTop;
    }
    
    element.style.position = 'fixed';
    element.style.left = `${left - scrollX}px`;
    element.style.top = `${top - scrollY}px`;
    
    console.log('[TZ Converter] Final position:', { left: left - scrollX, top: top - scrollY });
  }

  /**
   * Hide tooltip
   */
  function hideTooltip() {
    if (tooltip && tooltip.parentNode) {
      tooltip.classList.remove('visible');
      setTimeout(() => {
        if (tooltip && tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
        tooltip = null;
      }, 200);
    } else if (tooltip) {
      tooltip = null;
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
        if (!isEnabled) hideTooltip();
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
      if (!isEnabled) hideTooltip();
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