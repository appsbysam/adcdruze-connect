# Druze Connect Changelog

All meaningful application changes should be recorded here and accompanied by an appropriate semantic version increment.

## v0.3.2 — 27 August 2026

### Fixed
- Repositioned the global version badge into its own top-right lane so it no longer overlays the Notifications bell or other top-right action buttons.
- Kept the version badge fixed to the viewport so it stays in exactly the same screen position while page content scrolls.
- Added sufficient horizontal separation between the version badge and notification/settings/share controls.

## v0.3.1 — 27 August 2026

### Fixed
- Activated the previously non-functional **Privacy policy**, **Terms of use**, and **Account settings** rows on the More screen.
- Account Settings now loads the signed-in member profile and saves editable member details to the database.
- Notification preference switches now persist to Supabase instead of resetting whenever the screen is reopened.
- Member profile detail rows for email, mobile and suburb now perform the expected email, call and map actions.
- Removed the obsolete hard-coded `v1.0` label from the More screen so the global release version remains authoritative.

### Audited
- Checked bottom navigation and the main event, group, business, directory, notification, donation and volunteer navigation flows for dead routes and inactive controls.

## v0.3.0 — 26 August 2026

### Added
- Automatic **What's New** modal shown once after a user receives a new app version.
- Clickable global version badge to reopen the What's New modal at any time.
- Public `version.json` marker for lightweight update detection.
- Automatic update check when the app launches and whenever it returns to the foreground.
- Stronger PWA cache-busting and network-first handling for navigation and version metadata.

### Changed
- Repositioned the version badge so it no longer clashes with the notifications bell.
- Home dashboard statistics now use database counts, including volunteer registrations instead of the previous hard-coded volunteer value.
- Event cards and group cards now support richer database-driven imagery.
- Added realistic sample community data for development/testing of the directory, events, groups and businesses.

## v0.2.0 — 26 August 2026

### Added
- Druze Link PWA icon/logo pack based on the approved supplied artwork.
- Installable PWA manifest, service worker, splash treatment and app icon references.
- Global visible version badge.

### Changed
- Replaced earlier icon artwork with the approved Druze star and gold chain artwork.
- Improved GitHub Pages/PWA asset cache handling.

## v0.1.0.1 — Initial PWA conversion

- Initial installable PWA configuration and icon-pack groundwork.
