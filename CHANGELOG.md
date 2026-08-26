# Druze Connect Changelog

All meaningful application changes should be recorded here and accompanied by an appropriate semantic version increment.

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
