# Teleprompter App

A macOS teleprompter application that overlays fullscreen presentations while remaining invisible to screen sharing tools like Teams and Zoom.

## Overview

This Electron-based app solves a specific problem for presenters: displaying speaker notes that are visible on your screen but not captured by screen sharing software. Perfect for demos, webinars, and presentations where you need prompts without your audience seeing them.

## Features

- **Screen Capture Protection**: Uses native macOS APIs to prevent the window from appearing in screen recordings and shares
- **Fullscreen Overlay**: Displays on top of fullscreen PowerPoint presentations
- **Slide-by-Slide Scripts**: Manage separate scripts for each slide with titles
- **Keyboard Navigation**: Quick navigation with arrow keys, spacebar, and number keys
- **Customizable Display**: Adjust font size and line height for optimal readability
- **Persistent Storage**: Scripts automatically save to disk
- **Minimal UI**: Small, semi-transparent floating window that doesn't interfere with presentations

## Requirements

### System Requirements
- macOS 10.11 or later (tested on macOS 12+)
- Accessibility permissions (required to overlay fullscreen apps)

### Development Requirements
- Node.js 16 or later
- Xcode Command Line Tools
- Python (for node-gyp)

## Installation

### 1. Install Xcode Command Line Tools

```bash
xcode-select --install
```

### 2. Clone and Install Dependencies

```bash
git clone <repository-url>
cd teleprompter
npm install
```

### 3. Build Native Module

The app requires a native macOS module to enable screen capture protection:

```bash
npm run build-native
```

### 4. Grant Accessibility Permissions

1. Run the app: `npm start`
2. When prompted, open System Preferences → Security & Privacy → Privacy → Accessibility
3. Grant permission to the Electron app or Terminal (depending on your setup)
4. Restart the app

## Usage

### Starting the App

```bash
npm start
```

The teleprompter window will appear in the top-right corner of your screen.

### Basic Controls

**Navigation:**
- `←` / `→` Arrow keys: Navigate between slides
- `Space`: Next slide
- `1-9`: Jump to specific slide number

**Editing:**
- `E`: Toggle edit mode
- Click the `✎` button: Enter edit mode
- `Escape`: Cancel editing

**Settings:**
- Click the `⚙` button: Open display settings
- Adjust font size and line height

### Workflow

1. **Add Scripts**: Click the edit button or press `E` to enter edit mode
2. **Write Your Script**: Enter the script for the current slide
3. **Add Titles**: (Optional) Add a title for each slide in the input field
4. **Navigate**: Use arrow keys or Next/Prev buttons to move between slides
5. **During Presentation**: Navigate slides while presenting; the window overlays PowerPoint

### Screen Capture Testing

To verify the app is protected from screen capture:

1. Open a PowerPoint presentation in fullscreen mode
2. Start a Teams/Zoom meeting and share your screen
3. The PowerPoint slides should be visible to participants
4. The teleprompter window should NOT be visible to participants
5. Check the console for "✅" confirmation that protection is active

## Architecture

### Project Structure

```
teleprompter/
├── package.json           # Node.js dependencies and scripts
├── main.js                # Electron main process (window setup)
├── preload.js             # Electron preload script (IPC bridge)
├── index.html             # UI markup and styles
├── renderer.js            # UI logic and state management
├── test.js                # Testing utilities
├── native/
│   ├── binding.gyp        # Native module build configuration
│   └── window_protection.mm  # Objective-C++ native code
└── README.md              # This file
```

### Key Components

**Electron Main Process (`main.js`)**
- Creates and configures the BrowserWindow
- Sets window properties (frameless, transparent, always on top)
- Loads native module for screen capture protection
- Handles file I/O for saving/loading scripts

**Native Module (`native/window_protection.mm`)**
- Written in Objective-C++ to access macOS NSWindow APIs
- Sets `NSWindowSharingNone` to prevent screen capture
- Sets `NSScreenSaverWindowLevel` to overlay fullscreen apps
- Configures collection behavior for multi-workspace support

**Renderer Process (`renderer.js`, `index.html`)**
- Manages application state (slides, scripts, settings)
- Handles keyboard shortcuts and navigation
- Provides edit/view mode switching
- Saves settings to localStorage

### How Screen Protection Works

The app uses macOS-specific window properties that cannot be set from JavaScript:

```objc
[window setSharingType:NSWindowSharingNone];  // Prevents screen capture
[window setLevel:NSScreenSaverWindowLevel];   // Overlays fullscreen apps
```

These APIs are only accessible via native code, which is why the project includes an Objective-C++ addon compiled with node-gyp.

## Development

### Available Scripts

```bash
# Start the app
npm start

# Build native module
npm run build-native

# Rebuild native module (clean + build)
npm run rebuild

# Clean build artifacts
npm run clean
```

### Rebuilding After Changes

**After changing JavaScript/HTML:**
```bash
npm start
```

**After changing native code:**
```bash
npm run rebuild
npm start
```

### Data Storage

- **Scripts**: Saved to `~/Library/Application Support/Teleprompter/scripts.json`
- **Settings**: Stored in localStorage (font size, line height)

### File Format

Scripts are stored in JSON format:

```json
{
  "1": {
    "script": "Welcome to our demo...",
    "title": "Introduction"
  },
  "2": {
    "script": "In this section...",
    "title": "Overview"
  }
}
```

## Troubleshooting

### Build Errors

**Error: `xcode-select: error: tool 'xcodebuild' requires Xcode`**

Solution: Install Xcode Command Line Tools
```bash
xcode-select --install
```

**Error: `gyp: No Xcode or CLT version detected!`**

Solution: Reset Xcode path
```bash
sudo xcode-select --reset
```

### Runtime Issues

**Window not overlaying fullscreen PowerPoint**

1. Grant Accessibility permissions in System Preferences
2. Restart the app after granting permissions
3. Check console for permission-related errors

**Still visible in screen capture**

1. Verify native module compiled successfully (look for ✅ in console)
2. Check that you're testing with Teams/Zoom (some recording tools may bypass protection)
3. Try rebuilding: `npm run rebuild`

**Scripts not saving**

1. Check console for save errors
2. Verify write permissions to `~/Library/Application Support`
3. Check available disk space

### Debugging

Enable developer tools in `main.js`:

```javascript
// Uncomment this line in main.js
mainWindow.webContents.openDevTools();
```

## Known Limitations

1. **macOS only**: Native module uses macOS-specific APIs
2. **Screen recording tools**: Some advanced screen capture tools may bypass `NSWindowSharingNone`
3. **Single screen**: Optimized for single-screen presentations (multi-monitor support planned)
4. **Manual sync**: Slide navigation is manual (automatic PowerPoint integration planned)

## Future Enhancements

- [ ] Auto-detect PowerPoint slide changes
- [ ] Import/export scripts (JSON, Markdown)
- [ ] Auto-scroll teleprompter mode
- [ ] Multi-monitor support
- [ ] Cloud sync for scripts
- [ ] Voice-activated navigation
- [ ] Timer/countdown functionality
- [ ] Code signing and distribution

## Contributing

This is a personal project, but suggestions and bug reports are welcome via GitHub issues.

## License

MIT

## Technical Notes

### Why Native Code?

Electron's BrowserWindow API doesn't expose macOS window-level properties like `sharingType`. The only way to set these properties is through native Objective-C/C++ code, bridged to Node.js via N-API.

### Why node-gyp?

node-gyp is the standard build tool for compiling native Node.js addons. It uses Python and Xcode tooling to compile C/C++/Objective-C++ code into `.node` modules that can be loaded by Node.js.

### Accessibility Permissions

macOS requires explicit permission for apps to display windows over fullscreen applications. This is a security feature to prevent malicious apps from overlaying sensitive content.

---

**Last Updated**: 2025-10-20
**Version**: 1.0.0
