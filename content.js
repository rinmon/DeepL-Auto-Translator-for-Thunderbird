/**
 * DeepL Auto Translator for Thunderbird
 * Content script to modify message display
 */

// デバッグ用のロガー関数
function logDebug(message) {
  console.log(`[DeepL Translator Content] ${message}`);
}

// スクリプトが読み込まれたことをログに記録
logDebug('Content script loaded');

// コンテンツスクリプトがロードされたことを示すグローバル変数
window.contentScriptLoaded = true;

// Listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
  logDebug(`Message received from background: ${JSON.stringify(message.action)}`);
  
  if (message.action === "translate") {
    // Process translation request
    logDebug('Processing translation request for full message');
    translateMessageContent(message.content, message.settings);
  } else if (message.action === "showTranslation") {
    // Show translation for selected text
    logDebug(`Showing translation for selection: ${message.original.substring(0, 30)}...`);
    showSelectionTranslation(message.original, message.translated);
  } else {
    logDebug(`Unknown action: ${message.action}`);
  }
  return true;
});

// Function to translate message content
async function translateMessageContent(content, settings) {
  try {
    // Call DeepL API
    const translatedText = await callDeepLApi(content, settings.apiKey, settings.targetLanguage);
    
    // Display the translation
    displayTranslation(content, translatedText, settings.showOriginal);
  } catch (error) {
    console.error("Error translating message:", error);
  }
}

// Function to call DeepL API
async function callDeepLApi(text, apiKey, targetLang = "JA") {
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

// Function to display translation in the message
function displayTranslation(originalContent, translatedContent, showOriginal) {
  logDebug('Attempting to display translation');
  // Get the message container
  const messageContainer = document.querySelector('div.moz-text-html');
  if (!messageContainer) {
    logDebug("Error: Message container not found");
    // Try alternative selectors
    const alternativeContainers = [
      document.querySelector('div.mimePartBody'),
      document.querySelector('body'),
      document.querySelector('#message-content'),
      document.querySelector('[id$="message-body"]')
    ];
    
    const validContainer = alternativeContainers.find(container => container !== null);
    if (validContainer) {
      logDebug(`Found alternative container: ${validContainer.tagName}${validContainer.id ? '#'+validContainer.id : ''}`);
      messageContainer = validContainer;
    } else {
      logDebug("No valid message container found. DOM structure:");
      logDebug(document.body.innerHTML.substring(0, 200) + '...');
      return;
    }
  } else {
    logDebug("Found standard message container");
  }
  
  // Create translation container
  const translationDiv = document.createElement('div');
  translationDiv.className = 'deepl-translation';
  translationDiv.style.cssText = 'border-top: 1px solid #ccc; margin-top: 20px; padding-top: 15px;';
  
  // Add header
  const header = document.createElement('div');
  header.style.cssText = 'font-weight: bold; margin-bottom: 10px; color: #0c64c0;';
  header.textContent = '🌐 DeepL翻訳:';
  translationDiv.appendChild(header);
  
  // Add translated content
  const translatedDiv = document.createElement('div');
  translatedDiv.innerHTML = translatedContent;
  translatedDiv.style.cssText = 'margin-bottom: 15px;';
  translationDiv.appendChild(translatedDiv);
  
  // Check if we should hide original content
  if (!showOriginal) {
    messageContainer.style.display = 'none';
  }
  
  // Insert translation after the original message
  messageContainer.parentNode.insertBefore(translationDiv, messageContainer.nextSibling);
}

// Function to show translation for selected text
function showSelectionTranslation(originalText, translatedText) {
  logDebug(`Creating translation popup for: ${originalText.substring(0, 30)}...`);
  // Remove any existing popup
  const existingPopup = document.getElementById('deepl-selection-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Create popup
  const popup = document.createElement('div');
  popup.id = 'deepl-selection-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    padding: 15px;
    max-width: 80%;
    max-height: 80%;
    overflow-y: auto;
  `;
  
  // Add content
  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <h3 style="margin: 0; color: #0c64c0;">DeepL翻訳結果</h3>
      <button id="deepl-close-btn" style="border: none; background: none; cursor: pointer; font-size: 16px;">✕</button>
    </div>
    <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
      <div style="font-size: 12px; color: #666; margin-bottom: 5px;">原文:</div>
      <div>${originalText}</div>
    </div>
    <div>
      <div style="font-size: 12px; color: #666; margin-bottom: 5px;">翻訳:</div>
      <div>${translatedText}</div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(popup);
  logDebug('Translation popup added to the document');
  
  // Add close handler
  document.getElementById('deepl-close-btn').addEventListener('click', () => {
    logDebug('Close button clicked, removing popup');
    popup.remove();
  });
  
  // Close when clicking outside
  document.addEventListener('click', (event) => {
    if (event.target !== popup && !popup.contains(event.target)) {
      popup.remove();
    }
  }, { once: true });
}
