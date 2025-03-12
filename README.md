# tabX - Tab Groups Manager Chrome Extension

A Chrome extension that lets users manage groups of tabs for easy session restoration. Users can create, rename, add, and delete tabs and groups, with preset groups like 'Social Media' and 'Work' for convenience.

## Features

- **Color-coded groups**: Assign colors to tab groups for easy identification
- **"Add This Tab" button**: Instantly add the current tab to a selected group from the popup
- **Tab preview**: Shows titles and favicons of tabs in each group
- **One-click tab cleanup**: Close all tabs in a group or restore them as needed
- **Pinned groups**: Keep frequently used groups at the top for quick access
- **Drag-and-drop reordering**: Easily organize your groups
- **Confirmation toast**: Get feedback when adding a tab or performing other actions

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Search for "Tab Groups Manager"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension should now be installed and visible in your toolbar

## Usage

1. Click on the extension icon in your Chrome toolbar to open the popup
2. Create new groups using the "New Group" button
3. Add the current tab to a group by selecting a group from the dropdown and clicking "Add This Tab"
4. Manage your tabs and groups using the intuitive interface
5. Drag groups between "Pinned Groups" and "All Groups" sections to pin/unpin them

## Default Groups

The extension comes with two default groups:
- Social Media (blue)
- Work (green)

## Storage

All your tab groups are stored using Chrome's storage API, ensuring your data persists between browser sessions.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 