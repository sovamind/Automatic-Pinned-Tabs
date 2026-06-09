# Changelog
All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-06-09
### Added
- UUID-based stable identity for pinned tabs
- Update data store format for new UUID format
- Full migration system for old pinned tab formats
- Corruption detection and automatic repair of data store
- Automatic rebuild when data store is unrecoverably corrupted
- User-facing messages for storage migration, repair, and rebuild events
- Duplicate-prevention logic using chrome.sessions metadata

---

## [1.2.0] - 2026-06-03
### Added
- Ability to edit URLs directly in the popup
- Up/down arrow buttons for reordering pinned tabs
- Improved popup UI layout and row controls

### Fixed
- Drag-and-drop ordering issues
- Occasional reversed ordering when creating pinned tabs

### Notes
- This update improves usability and makes managing pinned tabs significantly easier.

---

## [1.1.0] - 2026-05-31
### Added
- Improved background script logic for tab creation
- Better handling of pinned tab ordering using explicit indices
- More robust tab creation timing to avoid race conditions

### Fixed
- Tabs sometimes appearing in the wrong order
- Tabs occasionally not pinning immediately on creation

### Notes
- This update focused on stability and correctness of tab creation.

---

## [1.0.0] - 2026-05-29
### Added
- Initial public release of **Automatic Pinned Tabs**
- Popup UI for managing pinned URLs (add, edit, reorder, delete)
- Arrow button icons using PNG assets for consistent rendering
- Automatic pinned tab creation on new window
- Correct left-to-right tab ordering using explicit tab indices
- Immediate pinning without waiting for page load
- Sync storage support so pinned tab lists follow the user across devices
- Cross-browser compatibility (Chrome, Edge, Chromium-based browsers)

### Fixed
- Unicode arrow rendering issues in popup UI
- Reversed tab ordering caused by Chromium’s pinned tab insertion behavior

### Notes
- This release is fully functional and stable for everyday use
- Ready for submission to Microsoft Edge Add-ons and Chrome Web Store
