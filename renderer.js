// Application State
let currentSlide = 1;
let slides = {}; // { slideNumber: { script: scriptText, title: titleText } }
let isEditMode = false;

// Default settings
let settings = {
  fontSize: 13,
  lineHeight: 1.5
};

// DOM Elements
const elements = {
  closeBtn: document.getElementById('closeBtn'),
  editBtn: document.getElementById('editBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  currentSlideEl: document.getElementById('currentSlide'),
  slideTitleInput: document.getElementById('slideTitleInput'),
  scriptView: document.getElementById('scriptView'),
  emptyState: document.getElementById('emptyState'),
  viewMode: document.getElementById('viewMode'),
  editMode: document.getElementById('editMode'),
  scriptEditor: document.getElementById('scriptEditor'),
  saveBtn: document.getElementById('saveBtn'),
  cancelBtn: document.getElementById('cancelBtn'),
  status: document.getElementById('status'),
  settingsOverlay: document.getElementById('settingsOverlay'),
  settingsCloseBtn: document.getElementById('settingsCloseBtn'),
  fontSizeSlider: document.getElementById('fontSizeSlider'),
  fontSizeValue: document.getElementById('fontSizeValue'),
  lineHeightSlider: document.getElementById('lineHeightSlider'),
  lineHeightValue: document.getElementById('lineHeightValue'),
  fontPreview: document.getElementById('fontPreview')
};

// Initialize app
async function init() {
  console.log('✅ Renderer process loaded');

  // Load saved settings
  loadSettings();

  // Load saved data
  try {
    const data = await window.electronAPI.loadScripts();

    // Convert old format to new format if needed
    if (data && Object.keys(data).length > 0) {
      const firstKey = Object.keys(data)[0];
      if (typeof data[firstKey] === 'string') {
        // Old format: { slideNumber: scriptText }
        console.log('📝 Converting old format to new format...');
        slides = {};
        for (const [slideNum, scriptText] of Object.entries(data)) {
          slides[slideNum] = { script: scriptText, title: '' };
        }
      } else {
        // New format: { slideNumber: { script, title } }
        slides = data;
      }
      console.log('📝 Loaded slides:', Object.keys(slides).length, 'slides');
    }
  } catch (error) {
    console.error('❌ Failed to load slides:', error);
    slides = {};
  }

  // Setup event listeners
  setupEventListeners();

  // Apply settings to UI
  applySettings();

  // Display current slide
  updateView();
}

// Setup Event Listeners
function setupEventListeners() {
  // Window controls
  elements.closeBtn.addEventListener('click', () => {
    window.electronAPI.closeWindow();
  });

  // Edit mode toggle
  elements.editBtn.addEventListener('click', toggleEditMode);

  // Settings
  elements.settingsBtn.addEventListener('click', openSettings);
  elements.settingsCloseBtn.addEventListener('click', closeSettings);
  elements.settingsOverlay.addEventListener('click', (e) => {
    if (e.target === elements.settingsOverlay) {
      closeSettings();
    }
  });

  // Settings sliders
  elements.fontSizeSlider.addEventListener('input', (e) => {
    settings.fontSize = parseInt(e.target.value);
    updateSettingsPreview();
  });

  elements.fontSizeSlider.addEventListener('change', () => {
    applySettings();
    saveSettings();
  });

  elements.lineHeightSlider.addEventListener('input', (e) => {
    settings.lineHeight = parseFloat(e.target.value);
    updateSettingsPreview();
  });

  elements.lineHeightSlider.addEventListener('change', () => {
    applySettings();
    saveSettings();
  });

  // Navigation
  elements.prevBtn.addEventListener('click', () => navigateSlide(-1));
  elements.nextBtn.addEventListener('click', () => navigateSlide(1));

  // Edit mode actions
  elements.saveBtn.addEventListener('click', saveScript);
  elements.cancelBtn.addEventListener('click', cancelEdit);

  // Slide title
  elements.slideTitleInput.addEventListener('change', saveTitle);
  elements.slideTitleInput.addEventListener('blur', saveTitle);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
}

// Navigate slides
function navigateSlide(direction) {
  if (isEditMode) return; // Don't navigate in edit mode

  const newSlide = currentSlide + direction;
  if (newSlide < 1) return; // Can't go below slide 1

  currentSlide = newSlide;
  updateView();
}

// Go to specific slide
function goToSlide(slideNumber) {
  if (slideNumber < 1) return;
  currentSlide = slideNumber;
  updateView();
}

// Update the view
function updateView() {
  // Update slide number
  elements.currentSlideEl.textContent = currentSlide;

  // Update navigation buttons
  elements.prevBtn.disabled = currentSlide === 1;

  // Get slide data
  const slideData = slides[currentSlide] || { script: '', title: '' };
  const script = slideData.script || '';
  const title = slideData.title || '';

  // Update title input
  elements.slideTitleInput.value = title;

  // Update view mode
  if (script) {
    elements.scriptView.textContent = script;
    elements.scriptView.style.display = 'block';
    elements.emptyState.style.display = 'none';
  } else {
    elements.scriptView.style.display = 'none';
    elements.emptyState.style.display = 'block';
  }
}

// Toggle edit mode
function toggleEditMode() {
  isEditMode = !isEditMode;

  if (isEditMode) {
    enterEditMode();
  } else {
    exitEditMode();
  }
}

// Enter edit mode
function enterEditMode() {
  isEditMode = true;

  // Populate editor with current script
  const slideData = slides[currentSlide] || { script: '', title: '' };
  elements.scriptEditor.value = slideData.script || '';

  // Show edit mode, hide view mode
  elements.viewMode.style.display = 'none';
  elements.editMode.classList.add('active');

  // Update edit button
  elements.editBtn.classList.add('active');

  // Focus editor
  elements.scriptEditor.focus();
}

// Exit edit mode
function exitEditMode(saved = false) {
  isEditMode = false;

  // Show view mode, hide edit mode
  elements.viewMode.style.display = 'block';
  elements.editMode.classList.remove('active');

  // Update edit button
  elements.editBtn.classList.remove('active');

  // Update view if saved
  if (saved) {
    updateView();
  }
}

// Save script
async function saveScript() {
  const scriptText = elements.scriptEditor.value.trim();

  // Get current slide data or create new
  const slideData = slides[currentSlide] || { script: '', title: '' };

  // Update script
  slideData.script = scriptText;

  // Update or remove slide data
  if (scriptText || slideData.title) {
    slides[currentSlide] = slideData;
  } else {
    // Remove if both script and title are empty
    delete slides[currentSlide];
  }

  // Save to disk
  try {
    elements.status.textContent = 'Saving...';
    const success = await window.electronAPI.saveScripts(slides);

    if (success) {
      elements.status.textContent = 'Saved ✓';
      setTimeout(() => {
        elements.status.textContent = 'Protected';
      }, 2000);

      exitEditMode(true);
    } else {
      elements.status.textContent = 'Save failed';
      setTimeout(() => {
        elements.status.textContent = 'Protected';
      }, 2000);
    }
  } catch (error) {
    console.error('❌ Save error:', error);
    elements.status.textContent = 'Save failed';
    setTimeout(() => {
      elements.status.textContent = 'Protected';
    }, 2000);
  }
}

// Cancel edit
function cancelEdit() {
  exitEditMode(false);
}

// Save title
async function saveTitle() {
  const titleText = elements.slideTitleInput.value.trim();

  // Get current slide data or create new
  const slideData = slides[currentSlide] || { script: '', title: '' };

  // Update title
  slideData.title = titleText;

  // Update or remove slide data
  if (titleText || slideData.script) {
    slides[currentSlide] = slideData;
  } else {
    // Remove if both script and title are empty
    delete slides[currentSlide];
  }

  // Save to disk
  try {
    const success = await window.electronAPI.saveScripts(slides);
    if (success) {
      console.log('✅ Title saved for slide', currentSlide);
    }
  } catch (error) {
    console.error('❌ Failed to save title:', error);
  }
}

// Keyboard shortcuts
function handleKeyboard(e) {
  // Don't interfere with typing in editor
  if (isEditMode && e.target === elements.scriptEditor) {
    // Allow Escape to exit edit mode
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
    return;
  }

  // Don't interfere with typing in title input
  if (e.target === elements.slideTitleInput) {
    return;
  }

  // Close settings with Escape
  if (elements.settingsOverlay.classList.contains('active')) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSettings();
    }
    return;
  }

  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      navigateSlide(-1);
      break;

    case 'ArrowRight':
    case ' ':
      e.preventDefault();
      navigateSlide(1);
      break;

    case 'e':
    case 'E':
      e.preventDefault();
      toggleEditMode();
      break;

    case 'Escape':
      if (isEditMode) {
        e.preventDefault();
        cancelEdit();
      }
      break;

    // Number keys 1-9 for quick slide access
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      if (!isEditMode) {
        e.preventDefault();
        goToSlide(parseInt(e.key));
      }
      break;
  }
}

// Settings Functions
function loadSettings() {
  try {
    const saved = localStorage.getItem('teleprompter-settings');
    if (saved) {
      settings = { ...settings, ...JSON.parse(saved) };
      console.log('✅ Settings loaded:', settings);
    }
  } catch (error) {
    console.error('❌ Failed to load settings:', error);
  }
}

function saveSettings() {
  try {
    localStorage.setItem('teleprompter-settings', JSON.stringify(settings));
    console.log('✅ Settings saved:', settings);
  } catch (error) {
    console.error('❌ Failed to save settings:', error);
  }
}

function applySettings() {
  // Apply to script view
  elements.scriptView.style.fontSize = `${settings.fontSize}px`;
  elements.scriptView.style.lineHeight = settings.lineHeight;

  // Update sliders and values
  elements.fontSizeSlider.value = settings.fontSize;
  elements.fontSizeValue.textContent = `${settings.fontSize}px`;

  elements.lineHeightSlider.value = settings.lineHeight;
  elements.lineHeightValue.textContent = settings.lineHeight.toFixed(1);

  // Update preview
  updateSettingsPreview();
}

function updateSettingsPreview() {
  elements.fontSizeValue.textContent = `${settings.fontSize}px`;
  elements.lineHeightValue.textContent = settings.lineHeight.toFixed(1);
  elements.fontPreview.style.fontSize = `${settings.fontSize}px`;
  elements.fontPreview.style.lineHeight = settings.lineHeight;
}

function openSettings() {
  elements.settingsOverlay.classList.add('active');
  updateSettingsPreview();
}

function closeSettings() {
  elements.settingsOverlay.classList.remove('active');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
