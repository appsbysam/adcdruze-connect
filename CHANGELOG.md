# Druze Connect Changelog

All meaningful application changes should be recorded here and accompanied by an appropriate semantic version increment.

## v0.4.1 — 28 August 2026

### Member directory data
- Removed the fictional/test member records from the live `members` table.
- Imported all 393 member rows supplied in `DruzeList_v2 (2).xlsx`.
- Added dedicated street-address and postcode fields to the member data model and made email optional for spreadsheet-only records.
- Preserved the supplied names, street addresses, suburbs and postcodes; no telephone numbers, email addresses, occupations, biographies or committee assignments were invented.
- Updated Directory search to include names, street addresses, suburbs and postcodes.
- Updated member cards and member profiles to display the imported address information and open the full address in Google Maps.

### Source-data note
- One supplied spreadsheet row for Ayman El Kasamani contains spreadsheet error/source values (`26/128`, `#VALUE!`, `28,`). Those values were preserved rather than guessed or silently corrected.

## v0.4.0 — 28 August 2026

### Connectivity & functionality
- Completed a broad route/control audit across Home, Events, Directory, Groups, Businesses, Volunteer, Donations, Notifications and Admin.
- Connected Home announcement cards to announcement details, Home group cards to group details, and all four Community at a Glance statistic tiles to their relevant modules.
- Confirmed Quick Access, featured/upcoming event cards and bottom navigation use real application routes.
- Confirmed event detail actions include RSVP status changes, maps, sharing and calendar integration.
- Confirmed group detail flows include join/leave membership, member profiles, posts and committee-leader/admin controls.
- Confirmed volunteer opportunity cards open detail pages and registration/cancellation persists through Supabase.
- Confirmed Notifications routes event, committee, volunteer, business, announcement, donation and welcome items to their appropriate destinations.
- Confirmed Admin dashboard tiles and navigation lead to the corresponding management modules.
- Improved business details so addresses open Maps and website values without an explicit protocol still open correctly.
- Retained functional member call, email, SMS and suburb/map actions.

### Known boundary
- Donation records currently remain a sample/internal flow and do not process real payments. A payment provider must be selected before live donations can be enabled.

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
