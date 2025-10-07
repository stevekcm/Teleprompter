# Teleprompter App - Claude Code Context

## Project Overview

This is an Electron-based teleprompter app for macOS that solves a specific problem: displaying presentation scripts that are **visible to the presenter but invisible to screen sharing tools like Teams/Zoom**.

### Core Requirements

1. **Overlay fullscreen PowerPoint** presentations (single screen setup)
2. **Avoid screen capture** - not visible in Teams/Zoom screen sharing
3. **Small floating window** in top-right corner
4. **Script navigation** synced with PowerPoint slides
5. **macOS only** (using native NSWindow APIs)

### Why This Architecture?

- **Electron**: Cross-platform framework, easy UI development
- **Native Node Addon**: Required to access macOS `NSWindow.setSharingType(NSWindowSharingNone)`
- **Objective-C++**: Bridge between Node.js and macOS Cocoa APIs
- **High Window Level**: `NSScreenSaverWindowLevel` to overlay fullscreen apps
- **Accessibility Permissions**: Required to display over fullscreen PowerPoint

## Technical Stack

- **Electron 28+**: Main framework
- **Node-API (N-API)**: Native addon interface
- **Objective-C++**: Native macOS integration
- **Vanilla HTML/CSS/JS**: Frontend (can upgrade to React later)
- **node-gyp**: Build system for native module

## Current Implementation Status

### ✅ Completed

- Project structure defined
- Native addon code written (`window_protection.mm`)
- Electron main process configured
- Basic "TEST" overlay UI
- Build configuration (`binding.gyp`)

### 🚧 In Progress

- Initial build and testing phase
- Verifying screen capture avoidance works
- Testing fullscreen overlay capability

### 📋 Next Steps (After Verification)

1. Replace "TEST" with full teleprompter UI
2. Add script editor/management
3. Add keyboard shortcuts (arrow keys, space)
4. Add slide navigation controls
5. Import/export script functionality
6. Font size and opacity controls

## Project Structure

```
teleprompter-app/
├── claude.md              # This file - project context
├── package.json           # Node.js dependencies
├── main.js                # Electron main process
├── index.html             # UI markup
├── preload.js             # Electron preload script
├── native/
│   ├── binding.gyp        # Native module build config
│   └── window_protection.mm  # Objective-C++ native code
└── README.md              # User documentation
```

## Key Technical Details

### Native Module (window_protection.mm)

**Purpose**: Set macOS window properties that JavaScript cannot access

**Key Functions**:

```objc
[window setSharingType:NSWindowSharingNone];  // Prevent screen capture
[window setLevel:NSScreenSaverWindowLevel];   // Overlay fullscreen apps
[window setCollectionBehavior:...];           // Persist across spaces
```

**Important**: The native module receives the window handle as a buffer from Electron:

```javascript
const buffer = mainWindow.getNativeWindowHandle();
windowProtection.setWindowProtection(buffer);
```

### Electron Window Configuration

**Critical settings in main.js**:

- `frame: false` - Frameless window
- `transparent: true` - See-through background
- `alwaysOnTop: true` - Stay on top
- `type: 'panel'` - macOS panel type window
- `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })` - Show in fullscreen

### Build Process

1. **Native module build**: `node-gyp configure && node-gyp build`
2. **Electron run**: `npm start`

**Dependencies**:

- Xcode Command Line Tools
- Node.js 16+
- Python (for node-gyp)

## Testing Requirements

### Test 1: Basic Overlay

- [ ] Window appears in top-right corner
- [ ] Window is draggable
- [ ] Window is semi-transparent
- [ ] Can close with × button

### Test 2: Fullscreen PowerPoint

- [ ] Open PowerPoint presentation mode (fullscreen)
- [ ] Teleprompter overlay still visible on top
- [ ] Can read text clearly
- [ ] Window doesn't interfere with presentation controls

### Test 3: Screen Capture Avoidance

- [ ] Share screen in Teams/Zoom
- [ ] Teleprompter NOT visible to other participants
- [ ] PowerPoint slides ARE visible
- [ ] Native module console shows ✅ success

### Test 4: Permissions

- [ ] Accessibility permission granted
- [ ] App appears in System Preferences → Security & Privacy → Accessibility
- [ ] No permission errors in console

## Known Issues & Gotchas

1. **Native Module Build Failures**

   - Ensure Xcode Command Line Tools installed: `xcode-select --install`
   - Clean build: `cd native && node-gyp clean && node-gyp configure && node-gyp build`

2. **Window Not Overlaying Fullscreen**

   - Grant Accessibility permissions
   - Restart app after granting permissions

3. **Still Visible in Screen Capture**

   - Check native module compiled successfully (look for ✅ in console)
   - Verify `NSWindowSharingNone` was set (add logging)
   - Some recording tools may bypass this (test with Teams specifically)

4. **macOS Version Compatibility**
   - `setSharingType` available in macOS 10.7+
   - Fullscreen overlay requires macOS 10.11+
   - Tested on macOS 12+ recommended

## Development Commands

```bash
# Install dependencies
npm install

# Build native module
cd native
node-gyp configure
node-gyp build
cd ..

# Run app
npm start

# Rebuild native module (after changes)
npm run rebuild

# Clean build
cd native && node-gyp clean && cd .. && npm run build-native
```

## Future Enhancements (Post-MVP)

1. **Rich UI Features**

   - React-based UI for better state management
   - Syntax highlighting for scripts
   - Multiple script templates
   - Timer/countdown functionality

2. **PowerPoint Integration**

   - Auto-detect slide changes (AppleScript?)
   - Sync script automatically with slide number
   - Import PowerPoint speaker notes

3. **Advanced Features**

   - Voice-activated navigation
   - Teleprompter scroll mode
   - Multi-monitor support with different modes
   - Cloud sync for scripts

4. **Distribution**
   - Code signing for macOS
   - Notarization
   - Auto-updater
   - DMG installer

## Important Files to Reference

When working on specific features, refer to:

- **Window behavior**: `main.js` - Electron window configuration
- **Screen capture protection**: `native/window_protection.mm` - Native code
- **UI/UX**: `index.html` - Current minimal test UI
- **Build issues**: `native/binding.gyp` - Build configuration

## Coding Conventions

- Use ES6+ JavaScript syntax
- Prefer `const` over `let`, avoid `var`
- Add error handling for native module loading (graceful degradation)
- Log important events with emoji prefixes: ✅ ⚠️ ❌
- Comment complex native code thoroughly
- Use JSDoc for function documentation when complexity increases

## Questions to Investigate

1. Can we detect PowerPoint slide changes programmatically?
2. Should we support partial transparency for better readability?
3. What's the optimal window size for single-screen use?
4. Should we support multiple script formats (markdown, plain text, JSON)?
5. How to handle updates without breaking native module?

## Contact & Context

**User Profile**:

- macOS user (Mac)
- Gives frequent demos/presentations
- Uses PowerPoint in fullscreen on single screen
- Uses Teams for screen sharing
- Forgets or mumbles without script prompts
- Willing to grant full permissions for app functionality

**User Expectations**:

- Minimal, non-intrusive UI
- Quick navigation between slides
- Reliable screen capture avoidance
- Easy to read during presentations

---

## Current Session Goal

We're at the **initial build and test phase**. The immediate next step is:

1. User builds the project following the setup guide
2. User tests the "TEST" overlay appears
3. User verifies it overlays fullscreen PowerPoint
4. User confirms it's NOT visible in Teams screen share

Once these three tests pass, we'll proceed to build the full teleprompter UI with script management and navigation controls.

---

_Last Updated: 2025-10-08_
_Started by: Claude (Sonnet 4.5) via web chat_
_Continuing with: Claude Code CLI_
