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

// Validate API key (optional feature)
function validateApiKey(apiKey) {
  // This could be enhanced to actually test the API key by making a simple request
  return apiKey && apiKey.length > 10;
}
