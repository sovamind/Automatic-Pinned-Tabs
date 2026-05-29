# Changelog
All notable changes to this project will be documented in this file.

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
