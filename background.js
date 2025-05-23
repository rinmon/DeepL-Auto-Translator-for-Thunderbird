/**
 * DeepL Auto Translator for Thunderbird
 * Background script to handle message display events
 */

// デバッグ用のロガー関数
function logDebug(message) {
  console.log(`[DeepL Translator Debug] ${message}`);
}

// Initialize when the extension loads
browser.runtime.onInstalled.addListener(() => {
  logDebug("DeepL Auto Translator installed");
  // Set default settings if not already set
  browser.storage.local.get("settings").then((result) => {
    if (!result.settings) {
      browser.storage.local.set({
        settings: {
          apiKey: "",
          targetLanguage: "JA", // Default to Japanese
          autoTranslate: true,
          showOriginal: true
        }
      });
    }
  });
});

// Listen for message display
browser.messageDisplay.onMessageDisplayed.addListener((tab, message) => {
  logDebug(`Message displayed in tab ${tab.id}`);
  // Check if auto-translate is enabled
  browser.storage.local.get("settings").then((result) => {
    logDebug(`Settings retrieved: ${JSON.stringify(result.settings)}`);
    if (result.settings && result.settings.autoTranslate) {
      logDebug('Auto-translate is enabled, proceeding with translation');
      translateMessage(tab, message);
    } else {
      logDebug('Auto-translate is disabled or settings not found');
    }
  }).catch(error => {
    logDebug(`Error retrieving settings: ${error.message}`);
  });
});

// Function to translate the current message
function translateMessage(tab, message) {
  logDebug(`translateMessage called for tab ${tab.id}`);
  // Get message content
  browser.messageDisplay.getDisplayedMessage(tab.id).then((messageDetails) => {
    // Check if messageDetails and body exist
    if (!messageDetails || !messageDetails.body) {
      logDebug(`Error: Message body is undefined for tab ${tab.id}`);
      return;
    }
    
    // Simple language detection (very basic)
    const body = messageDetails.body;
    logDebug(`Retrieved message body with content length: ${body.content ? body.content.length : 0}`);
    
    if (isEnglish(body.content)) {
      browser.storage.local.get("settings").then((result) => {
        if (result.settings && result.settings.apiKey) {
          // Inject content script to modify the message display
          browser.tabs.executeScript(tab.id, {
            file: "content.js"
          }).then(() => {
            // Pass message content to content script
            browser.tabs.sendMessage(tab.id, {
              action: "translate",
              content: body.content,
              settings: result.settings
            });
          });
        } else {
          console.warn("DeepL API key is not set. Please configure in options.");
          // Optionally notify the user to set up the API key
          browser.notifications.create({
            type: "basic",
            title: "DeepL Auto Translator",
            message: "Please set your DeepL API key in the extension options.",
            iconUrl: "icons/translate-48.png"
          });
        }
      });
    }
  });
}

// Simple function to detect if text is predominantly English
// This is a basic implementation and could be improved
function isEnglish(text) {
  if (!text) return false;
  
  // Remove HTML tags for better analysis
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  // Count English characters vs. Japanese characters
  const englishChars = cleanText.match(/[a-zA-Z]/g) || [];
  const japaneseChars = cleanText.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g) || [];
  
  // If there are significantly more English characters than Japanese
  return englishChars.length > 0 && englishChars.length > japaneseChars.length * 2;
}

// Add context menu for manual translation
browser.menus.create({
  id: "translate-selection",
  title: "DeepLで翻訳",
  contexts: ["selection"]
});

browser.menus.onClicked.addListener((info, tab) => {
  logDebug(`Menu clicked: ${info.menuItemId}`);
  if (info.menuItemId === "translate-selection" && info.selectionText) {
    logDebug(`Selection text: ${info.selectionText.substring(0, 50)}...`);
    browser.storage.local.get("settings").then((result) => {
      if (result.settings && result.settings.apiKey) {
        translateText(info.selectionText, result.settings.apiKey, result.settings.targetLanguage)
          .then(translatedText => {
            // First check if content script is already injected
            logDebug('Injecting content script before sending message');
            browser.tabs.executeScript(tab.id, {
              code: "typeof contentScriptLoaded !== 'undefined'"
            }).then(results => {
              if (!results || !results[0]) {
                logDebug('Content script not loaded, injecting it now');
                return browser.tabs.executeScript(tab.id, {file: "content.js"});
              } else {
                logDebug('Content script already loaded');
                return Promise.resolve();
              }
            }).then(() => {
              logDebug('Sending translation message to content script');
              return browser.tabs.sendMessage(tab.id, {
                action: "showTranslation",
                original: info.selectionText,
                translated: translatedText
              });
            }).catch(error => {
              logDebug(`Error in script injection or messaging: ${error.message}`);
            });
          });
      } else {
        console.warn("DeepL API key is not set. Please configure in options.");
      }
    });
  }
});

// Function to call DeepL API
async function translateText(text, apiKey, targetLang = "JA") {
  try {
    const response = await fetch("https://api.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `DeepL-Auth-Key ${apiKey}`
      },
      body: new URLSearchParams({
        text: text,
        target_lang: targetLang
      })
    });
    
    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error("Translation error:", error);
    return `[Translation error: ${error.message}]`;
  }
}
