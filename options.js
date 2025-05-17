/**
 * DeepL Auto Translator for Thunderbird
 * Options page script
 */

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  
  // Save settings when form is submitted
  document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettings();
  });
  
  // Test API key when test button is clicked
  document.getElementById('testApiKey').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    testApiKey(apiKey);
  });
});

// Load saved settings
function loadSettings() {
  browser.storage.local.get('settings').then((result) => {
    if (result.settings) {
      document.getElementById('apiKey').value = result.settings.apiKey || '';
      document.getElementById('targetLanguage').value = result.settings.targetLanguage || 'JA';
      document.getElementById('autoTranslate').checked = result.settings.autoTranslate !== false;
      document.getElementById('showOriginal').checked = result.settings.showOriginal !== false;
    }
  });
}

// Save settings
function saveSettings() {
  const settings = {
    apiKey: document.getElementById('apiKey').value.trim(),
    targetLanguage: document.getElementById('targetLanguage').value,
    autoTranslate: document.getElementById('autoTranslate').checked,
    showOriginal: document.getElementById('showOriginal').checked
  };
  
  browser.storage.local.set({ settings }).then(() => {
    // Show success message
    const successMessage = document.getElementById('saveSuccess');
    successMessage.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  });
}

// Validate API key format (basic validation)
function validateApiKey(apiKey) {
  // Basic format validation for DeepL API key
  const apiKeyRegex = /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}(:[a-z]{2})?$/i;
  return apiKey && apiKeyRegex.test(apiKey);
}

// Test API key with DeepL API
async function testApiKey(apiKey) {
  const resultElement = document.getElementById('apiKeyTestResult');
  
  // Check if API key is empty
  if (!apiKey) {
    resultElement.innerHTML = '<span class="error">APIキーが入力されていません</span>';
    return;
  }
  
  // Check basic format
  if (!validateApiKey(apiKey)) {
    resultElement.innerHTML = '<span class="error">APIキーの形式が正しくありません</span>';
    return;
  }
  
  // Show loading indicator
  resultElement.innerHTML = '<span class="loading"></span>テスト中...';
  
  try {
    // Sample text to translate
    const sampleText = 'This is a test message for DeepL API';
    
    // Make a request to DeepL API
    const response = await fetch('https://api.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `DeepL-Auth-Key ${apiKey}`
      },
      body: new URLSearchParams({
        text: sampleText,
        target_lang: 'JA'
      })
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('APIキーが無効です');
      } else {
        throw new Error(`APIエラー: ${response.status}`);
      }
    }
    
    const data = await response.json();
    const translation = data.translations[0].text;
    
    // Show success message with the translation
    resultElement.innerHTML = `<span style="color: #28a745;">✓ APIキーは正常に動作しています</span><br>
      <small>テスト翻訳: 「${translation}」</small>`;
  } catch (error) {
    // Show error message
    resultElement.innerHTML = `<span class="error">✗ ${error.message}</span>`;
    console.error('API test error:', error);
  }
}
