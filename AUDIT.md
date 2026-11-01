# GhanaAlert Mobile Application Audit

## 1. Executive summary

GhanaAlert is an Expo Router / React Native (SDK 58) consumer-alert application with a polished mobile UI, mock data, persisted Zustand state, local notifications, location, image picking, and reporting. The codebase is small, typed, and generally coherent. No critical confirmed security exposure or data-integrity failure was found.

The most important confirmed defects were content/state mismatches, notification routing and permission-state errors, web rendering breakage, accessibility contrast/touch-target failures, and release-readiness gaps. A substantial remediation batch has now been implemented and verified with typecheck, lint, Expo Doctor, web export, and iOS/Android exports.

Overall condition after remediation: **good for continued development and internal testing; not yet store-release ready** because it still lacks real backend/auth, remote push, production identifiers, privacy/support metadata, crash reporting, EAS configuration, and automated tests.

## 2. Architecture assessment

- Framework: Expo SDK 58, React Native 0.88.1, React 19.3, TypeScript strict.
- Routing: Expo Router; routes in `app/`, navigators in `_layout.tsx`.
- State: Zustand with AsyncStorage persistence (`authStore`, `prefsStore`, `savedStore`, `reportsStore`).
- Data: mock arrays in `src/data`; no backend or API client.
- Forms: React Hook Form + Zod in `app/report.tsx`.
- Notifications: `expo-notifications`, local only.
- Location: `expo-location`.
- Media: `expo-image-picker`.
- Theming: centralized tokens in `src/theme/tokens.ts`.
- No dependency injection, no tests, no EAS configuration.

The architecture is appropriate for the app's size. Main maintainability risks are duplicated async hook patterns, mock-only data, unscoped local persistence, and lack of automated coverage.

## 3. Audit coverage

Inspected:

- Configuration: `package.json`, `app.json`, `tsconfig.json`, `eslint.config.js`, `.expo`, README.
- App routes and screens: onboarding, auth, tabs, alert detail, category, saved, report, all settings.
- Components: all files in `src/components`.
- State/hooks/data/types/theme/utils.
- Platform/build checks: typecheck, lint, Expo Doctor, npm audit, web/iOS/Android exports.
- Web UI flow: Chromium 390x844, deviceScaleFactor 2, via Playwright.

Not inspected or not available:

- Physical iPhone / iOS Simulator / Android Emulator (explicitly not started).
- Native OS permission dialogs and notification tap lifecycle on device.
- Real backend, auth, push delivery, payments, offline sync.
- Performance profiling with native profilers.
- Store submission metadata and signing.

## 4. Baseline verification

| Check | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass with 1 React Compiler warning: `app/report.tsx:92:21` |
| `npx expo-doctor` | 20/20 pass |
| `npm audit --omit=dev` | 12 moderate, all build tooling (`glob`/`minimatch`); no high/critical |
| Web export | Pass after `app/+html.tsx` fix |
| iOS export | Pass |
| Android export | Pass |
| Playwright web flow | Pass after notification guards; warnings only |

## 5. Issue register

### A-001 — Home featured banner summary mismatch
- Severity: High
- Confidence: Confirmed
- Status: Fixed
- Files: `app/(tabs)/index.tsx`, `src/data/alerts.ts`
- Evidence: banner rendered `strings.home.featuredSummary` ("counterfeit electronics") while `featuredAlert` is the first high-priority alert, "Contaminated Cereals".
- Root cause: featured content was hardcoded instead of derived from `featuredAlert`.
- Fix: render `featuredAlert.summary`.
- Effort: 0.25h

### A-002 — Alert detail bookmark state conflates saved and read later
- Severity: High
- Confidence: Confirmed
- Status: Fixed
- Files: `app/alert/[id].tsx`, `src/store/savedStore.ts`
- Evidence: `isBookmarked = !!entry`, so a `read_later` entry displayed as bookmarked and menu labels were wrong.
- Root cause: status was not distinguished.
- Fix: `isBookmarked = entry?.status === 'saved'`.
- Effort: 0.5h

### A-003 — Stale notification response can reopen an alert
- Severity: High
- Confidence: Confirmed
- Status: Fixed
- Files: `src/hooks/useNotificationRouting.ts`
- Evidence: cold-start `getLastNotificationResponseAsync()` was not consistently cleared after handling.
- Root cause: response lifecycle was incomplete.
- Fix: clear last response after both listener and cold-start handling.
- Effort: 0.5h

### A-004 — Logged-out notification target is lost after login
- Severity: High
- Confidence: Confirmed
- Status: Fixed
- Files: `src/hooks/useNotificationRouting.ts`, `src/store/authStore.ts`
- Evidence: notification tap while logged out could not route after authentication.
- Root cause: no pending alert state survived login.
- Fix: store pending alert ID and route it after login.
- Effort: 1h

### A-005 — Splash redirect delay after notification back-navigation
- Severity: Medium
- Confidence: Confirmed
- Status: Fixed
- Files: `app/index.tsx`
- Evidence: `useFocusEffect` always waited 1.6s, including after returning from a notification-opened alert.
- Root cause: no distinction between first launch and refocus.
- Fix: redirect immediately on subsequent focus.
- Effort: 0.5h

### A-006 — Notification master toggle defaults enabled without permission
- Severity: High
- Confidence: Confirmed
- Status: Fixed
- Files: `src/store/prefsStore.ts`
- Evidence: `notificationsEnabled` initialized to `true` even before OS permission.
- Root cause: default state did not represent permission state.
- Fix: default to `false`.
- Effort: 0.25h

### A-007 — Test alert bypasses disabled master toggle
- Severity: Medium
- Confidence: Confirmed
- Status: Fixed
- Files: `app/settings/notifications.tsx`
- Evidence: `sendTest` scheduled regardless of `notificationsEnabled`.
- Root cause: missing guard and disabled UI.
- Fix: guard and disable the test action when notifications are off.
- Effort: 0.5h

### A-008 — Notification denial has no settings recovery
- Severity: Medium
- Confidence: Confirmed
- Status: Fixed
- Files: `app/settings/notifications.tsx`
- Evidence: denial alert had no Open Settings action.
- Root cause: incomplete permission UX.
- Fix: add cancel/Open Settings alert.
- Effort: 0.5h

### A-009 — Web SSR renders blank page
- Severity: High
- Confidence: Confirmed
- Status: Fixed
- Files: `app/+html.tsx`
- Evidence: SDK 58 requires `useServerDocumentContext()`; old `+html.tsx` omitted client scripts.
- Root cause: outdated Expo Router HTML API.
- Fix: render `headNodes` and `bodyNodes`.
- Effort: 1h

### A-010 — Web runtime crash from expo-notifications
- Severity: High
- Confidence: Confirmed
- Status: Fixed
- Files: `src/hooks/useNotificationRouting.ts`, `src/utils/notifications.ts`, `app/settings/notifications.tsx`
- Evidence: Playwright captured `ExpoNotifications.getLastNotificationResponse is not available on web`.
- Root cause: native-only notification APIs called on web.
- Fix: platform guards and web-specific messaging.
- Effort: 1h

### A-011 — Image picker requests media permission unnecessarily
- Severity: Medium
- Confidence: Confirmed
- Status: Fixed
- Files: `app/report.tsx`
- Evidence: `requestMediaLibraryPermissionsAsync()` was called before `launchImageLibraryAsync()`.
- Root cause: redundant permission flow.
- Fix: remove manual request and let the picker handle permission.
- Effort: 0.25h

### A-012 — Unused camera and microphone permissions
- Severity: Medium
- Confidence: Confirmed
- Status: Fixed
- Files: `app.json`
- Evidence: `expo-image-picker` defaults add camera and `RECORD_AUDIO` permissions although only gallery picking is used.
- Root cause: plugin defaults not overridden.
- Fix: set `cameraPermission: false` and `microphonePermission: false`.
- Effort: 0.25h

### A-013 — Category chip text contrast failure
- Severity: High
- Confidence: Confirmed (measured)
- Status: Fixed
- Files: `src/theme/tokens.ts`, `src/components/CategoryIcon.tsx`
- Evidence: 12px semibold text on 12% tint measured 3.35 (danger), 2.93 (success), 2.48 (warning), 3.20 (info), 2.66 (teal), 4.75 (purple); required 4.5:1.
- Root cause: light category colors used as text on tinted backgrounds.
- Fix: darken category colors and make decorative icon non-accessible.
- Effort: 1h

### A-014 — PriorityBanner contrast failure
- Severity: Medium
- Confidence: Confirmed (measured)
- Status: Fixed
- Files: `src/components/PriorityBanner.tsx`, `src/theme/tokens.ts`
- Evidence: high `#E5484D` on `#FDECEC` = 3.43; low `#3B82F6` on `#EAF2FF` = 3.27.
- Root cause: insufficient foreground/background contrast.
- Fix: use `#B42318` (5.76) and `#1D4ED8` (5.95).
- Effort: 0.5h

### A-015 — Form error text contrast failure
- Severity: Medium
- Confidence: Confirmed (measured)
- Status: Fixed
- Files: `src/theme/tokens.ts`, `src/components/FormField.tsx`
- Evidence: `#E5484D` on white = 3.91.
- Root cause: error color too light.
- Fix: darken danger to `#B42318` (6.57).
- Effort: 0.25h

### A-016 — Logout text contrast failure
- Severity: Low
- Confidence: Confirmed (measured)
- Status: Fixed
- Files: `src/theme/tokens.ts`, `app/(tabs)/profile.tsx`
- Evidence: `#E5484D` on white = 3.91.
- Root cause: shared danger token too light.
- Fix: shared token darkened.
- Effort: included in A-015

### A-017 — Welcome muted text contrast failure
- Severity: Low
- Confidence: Confirmed (measured)
- Status: Fixed
- Files: `src/theme/tokens.ts`, `app/(onboarding)/welcome.tsx`
- Evidence: `#6B7280` on `#DCEBFC` = 3.99.
- Root cause: muted token too light on tinted background.
- Fix: `textMuted` changed to `#4B5563` (6.24 on `#DCEBFC`).
- Effort: 0.25h

### A-018 — Non-text contrast failure for solid warning icon
- Severity: Low
- Confidence: Confirmed (measured)
- Status: Fixed
- Files: `src/theme/tokens.ts`
- Evidence: white on `#F97316` = 2.8, below 3:1 for graphical object.
- Root cause: warning color too light.
- Fix: warning changed to `#C2410C` (white icon 5.18).
- Effort: 0.25h

### A-019 — Touch targets below 44px
- Severity: Medium
- Confidence: Confirmed (measured)
- Status: Fixed
- Files: `src/components/Chip.tsx`, `src/components/SegmentedControl.tsx`, `app/(tabs)/alerts.tsx`, `src/components/Snackbar.tsx`, `src/components/SearchBar.tsx`
- Evidence: chips 36px, segmented 40px, active filter 30px, snackbar action ~33px, close icons 38px, search clear 34px.
- Root cause: compact control sizes without sufficient hit areas.
- Fix: minHeight/hitSlop adjustments to at least 44px.
- Effort: 1h

### A-020 — Fixed heights break dynamic type
- Severity: Medium
- Confidence: Confirmed (code inspection)
- Status: Fixed
- Files: `app/(tabs)/alerts.tsx`, `app/(tabs)/categories.tsx`, `src/components/FormField.tsx`, `src/components/PriorityBanner.tsx`, `src/components/PrimaryButton.tsx`, `src/components/Skeleton.tsx`
- Evidence: fixed `height` values for cards, rows, selects, banners, chips, inputs, and buttons.
- Root cause: containers could not grow with larger text.
- Fix: converted relevant fixed heights to `minHeight`.
- Effort: 1h

### A-021 — Home search control has incorrect accessibility role
- Severity: Low
- Confidence: Confirmed
- Status: Fixed
- Files: `src/components/SearchBar.tsx`
- Evidence: `accessibilityRole="search"` on a button-like control.
- Root cause: non-standard role.
- Fix: changed to `accessibilityRole="button"`.
- Effort: 0.25h

### A-022 — Decorative category icon exposed to assistive tech
- Severity: Low
- Confidence: Confirmed
- Status: Fixed
- Files: `src/components/CategoryIcon.tsx`
- Evidence: icon inside buttons was not explicitly hidden.
- Root cause: missing decorative accessibility attributes.
- Fix: `accessible={false}` and `importantForAccessibility="no"`.
- Effort: 0.25h

### A-023 — Skeleton has no loading semantics or reduce-motion support
- Severity: Low
- Confidence: Partially verified
- Status: Partially fixed
- Files: `src/components/Skeleton.tsx`
- Evidence: animated skeleton had no progress role/label; animation always runs.
- Root cause: missing accessibility metadata.
- Fix applied: progressbar role and label.
- Remaining: respect reduced-motion preference.
- Effort: 0.5h remaining

### A-024 — Snackbar lacks alert semantics and adequate action target
- Severity: Low
- Confidence: Confirmed
- Status: Fixed
- Files: `src/components/Snackbar.tsx`
- Evidence: container had only live region; action hit slop was 8px.
- Root cause: incomplete accessibility and touch target.
- Fix: `accessibilityRole="alert"`, assertive live region, 44px action target.
- Effort: 0.5h

### A-025 — Modal semantics and focus handling are incomplete
- Severity: Medium
- Confidence: Confirmed
- Status: Partially fixed
- Files: `src/components/OptionSheet.tsx`, `app/(tabs)/alerts.tsx`, `app/report.tsx`
- Evidence: modals lacked `accessibilityViewIsModal`; no explicit focus management.
- Root cause: modal accessibility not fully implemented.
- Fix applied: `accessibilityViewIsModal`.
- Remaining: focus trapping/restoration.
- Effort: 1h remaining

### A-026 — Form field error association and live region are incomplete
- Severity: Low
- Confidence: Confirmed
- Status: Fixed
- Files: `src/components/FormField.tsx`
- Evidence: error text had Android-only live region and no alert role.
- Root cause: incomplete cross-platform semantics.
- Fix: added `accessibilityRole="alert"` while retaining live region.
- Effort: 0.25h

### A-027 — Login can retain stale user name
- Severity: Medium
- Confidence: Confirmed
- Status: Fixed
- Files: `src/store/authStore.ts`
- Evidence: `login(email)` only updated email and preserved previous name.
- Root cause: user object was patched instead of rebuilt.
- Fix: rebuild user from email local part.
- Effort: 0.5h

### A-028 — Logout leaves user data in memory
- Severity: Medium
- Confidence: Confirmed
- Status: Fixed
- Files: `src/store/authStore.ts`
- Evidence: logout set `isLoggedIn: false` but retained user, saved reports, and preferences.
- Root cause: incomplete session teardown.
- Fix: reset user and clear saved/reports/preferences.
- Effort: 0.5h

### A-029 — Local data is not user-scoped
- Severity: Medium
- Confidence: Confirmed
- Status: Partially fixed
- Files: `src/store/authStore.ts`, `src/store/savedStore.ts`, `src/store/reportsStore.ts`, `src/store/prefsStore.ts`
- Evidence: all persisted stores use global keys and are not tied to user ID.
- Root cause: demo auth has no real user identity.
- Fix applied: clear local data on login/register/logout.
- Remaining: true per-user storage keys or backend sync.
- Effort: 2h remaining

### A-030 — Reports persist PII and photo URIs without management UI
- Severity: Medium
- Confidence: Confirmed
- Status: Partially fixed
- Files: `src/store/reportsStore.ts`, `app/report.tsx`, `app/(tabs)/profile.tsx`
- Evidence: reports with title, description, location, and photo URI persist indefinitely; no view/delete screen.
- Root cause: demo reporting has no retention or management workflow.
- Fix applied: added `removeReport` and clear-on-auth-change.
- Remaining: user-facing report list/delete and retention policy.
- Effort: 2h remaining

### A-031 — Report draft is lost on interruption
- Severity: Low
- Confidence: Confirmed
- Status: Open
- Files: `app/report.tsx`
- Evidence: form state is component-only; process termination discards it.
- Root cause: no draft persistence.
- Impact: minor usability loss.
- Effort: 1h

### A-032 — No automated tests
- Severity: High (process)
- Confidence: Confirmed
- Status: Open
- Files: repository root
- Evidence: no test scripts or test files; `package.json` has only lint/typecheck.
- Root cause: test infrastructure not implemented.
- Recommendation: add `jest-expo`, unit tests for utils/stores, component tests for forms/navigation.
- Effort: 4-8h

### A-033 — No EAS build configuration
- Severity: Medium (release)
- Confidence: Confirmed
- Status: Open
- Files: repository root
- Evidence: no `eas.json`.
- Root cause: cloud build profiles not configured.
- Recommendation: add development/preview/production profiles and environment variables.
- Effort: 1-2h

### A-034 — Placeholder bundle identifiers
- Severity: Medium (release)
- Confidence: Confirmed
- Status: Open
- Files: `app.json`
- Evidence: `com.yourorg.ghanaalert` is used for both iOS and Android.
- Root cause: identifiers not finalized.
- Recommendation: replace with owned reverse-domain identifiers before release.
- Effort: 0.5h

### A-035 — Missing privacy/support metadata
- Severity: Medium (release/compliance)
- Confidence: Confirmed
- Status: Open
- Files: `app.json`, `app/settings/about.tsx`, `app/settings/help.tsx`
- Evidence: no privacy policy URL, support URL, or store metadata.
- Root cause: release metadata not prepared.
- Recommendation: add URLs and store listing content.
- Effort: 2-4h

### A-036 — No crash reporting or diagnostics
- Severity: Medium
- Confidence: Confirmed
- Status: Open
- Files: application root
- Evidence: no Sentry/Crashlytics or equivalent dependency.
- Root cause: diagnostics not integrated.
- Recommendation: add Expo-compatible crash reporting before beta.
- Effort: 2-4h

### A-037 — No remote push backend
- Severity: Medium (product)
- Confidence: Confirmed
- Status: Open
- Files: `src/utils/notifications.ts`, `src/hooks/useNotificationRouting.ts`
- Evidence: notifications are local only; test alert explicitly says remote push requires backend.
- Root cause: backend not implemented.
- Recommendation: implement push registration, token refresh, and delivery service.
- Effort: 8-16h

### A-038 — Moderate dependency vulnerabilities
- Severity: Medium (tooling)
- Confidence: Confirmed
- Status: Open (accepted)
- Files: `package-lock.json`
- Evidence: `npm audit --omit=dev` reports 12 moderate vulnerabilities in `glob`/`minimatch` via Expo CLI tooling.
- Root cause: vulnerable transitive build dependencies.
- Recommendation: do not force-fix; it downgrades Expo to SDK 51. Wait for compatible Expo update.
- Effort: 0.5h when compatible update exists

### A-039 — Unused dependencies
- Severity: Low
- Confidence: Confirmed
- Status: Fixed
- Files: `package.json`
- Evidence: `expo-symbols` and `expo-web-browser` had no source references.
- Root cause: leftover dependencies.
- Fix: removed both.
- Effort: 0.25h

### A-040 — Unused font asset
- Severity: Low
- Confidence: Confirmed
- Status: Open
- Files: `assets/fonts/SpaceMono-Regular.ttf`
- Evidence: no source reference found.
- Root cause: leftover asset.
- Recommendation: remove asset and any font loading if unused.
- Effort: 0.25h

### A-041 — Unused `getEntry` API
- Severity: Low
- Confidence: Confirmed
- Status: Open
- Files: `src/store/savedStore.ts`
- Evidence: no caller found.
- Root cause: leftover helper.
- Recommendation: remove or document intended use.
- Effort: 0.25h

### A-042 — Unused `authDemoNote` export
- Severity: Low
- Confidence: Confirmed
- Status: Open
- Files: `src/components/AuthShell.tsx`
- Evidence: no caller found.
- Root cause: leftover export.
- Recommendation: remove or use.
- Effort: 0.25h

### A-043 — OptionSheet scroll can overflow
- Severity: Low
- Confidence: Confirmed
- Status: Fixed
- Files: `src/components/OptionSheet.tsx`
- Evidence: ScrollView inside constrained sheet had no shrink behavior.
- Root cause: missing flex shrink.
- Fix: `style={{ flexShrink: 1 }}`.
- Effort: 0.25h

### A-044 — Location permission denial lacks settings recovery
- Severity: Medium
- Confidence: Confirmed
- Status: Fixed
- Files: `app/settings/location.tsx`, `app/report.tsx`
- Evidence: denial only set an error string.
- Root cause: incomplete permission UX.
- Fix: add cancel/Open Settings alert.
- Effort: 0.5h

### A-045 — Help mailto has no error handling
- Severity: Low
- Confidence: Confirmed
- Status: Fixed
- Files: `app/settings/help.tsx`
- Evidence: `Linking.openURL` result was ignored.
- Root cause: missing failure path.
- Fix: try/catch with alert.
- Effort: 0.25h

### A-046 — Web notification APIs are unsupported
- Severity: Medium
- Confidence: Confirmed
- Status: Fixed
- Files: `src/utils/notifications.ts`, `src/hooks/useNotificationRouting.ts`, `app/settings/notifications.tsx`
- Evidence: web build emitted unsupported-operation errors.
- Root cause: native-only APIs invoked on web.
- Fix: platform guards and web messaging.
- Effort: 1h

### A-047 — `featuredSummary` string is now unused
- Severity: Low
- Confidence: Confirmed
- Status: Open
- Files: `src/strings.ts`, `app/(tabs)/index.tsx`
- Evidence: Home now uses `featuredAlert.summary`.
- Root cause: leftover copy.
- Recommendation: remove or reuse.
- Effort: 0.25h

### A-048 — No native device testing
- Severity: Informational
- Confidence: Confirmed
- Status: Limitation
- Files: N/A
- Evidence: user requested no emulator; agent cannot access physical iPhone.
- Impact: native lifecycle, permissions, notification tap, and visual behavior are unverified.
- Effort: manual QA required

### A-049 — No performance measurements
- Severity: Informational
- Confidence: Confirmed
- Status: Limitation
- Files: N/A
- Evidence: no profiler data collected.
- Impact: performance recommendations are not evidence-based.
- Effort: profile before optimizing

## 6. Root-cause analysis for major issues

- **Content mismatch:** Home used a static featured summary instead of the selected alert.
- **Bookmark confusion:** saved and read-later states shared one boolean.
- **Notification routing:** native notification response was not cleared and pending state was not preserved across auth changes.
- **Permission state:** notification preference defaulted to enabled and test alerts ignored it.
- **Web rendering:** `+html.tsx` used an outdated Expo Router API, omitting client scripts.
- **Accessibility:** color tokens were chosen for brand aesthetics rather than WCAG contrast; several controls used fixed compact sizes.
- **Session/data:** demo auth did not reset user or local data.

## 7. Security and privacy assessment

Confirmed:

- No hardcoded secrets or credentials found.
- No network/API layer exists; app is mock-only.
- Sensitive report data (title, description, location, photo URI) persists in AsyncStorage without encryption or retention controls.
- Local data is cleared on login/register/logout after remediation.
- Deep-link and notification payloads use alert IDs; no evidence of injection, but production should validate/backend-authorize.
- Permissions were reduced for image picking.
- 12 moderate npm vulnerabilities are in build tooling, not runtime app dependencies.

Residual risks:

- AsyncStorage is not encrypted.
- Reports can persist PII indefinitely.
- No privacy policy, support URL, or crash diagnostics.
- No real authentication or backend authorization.

## 8. Device compatibility

Verified:

- Web export and Playwright Chromium 390x844, deviceScaleFactor 2.
- iOS export.
- Android export.
- Expo Doctor 20/20.

Not verified:

- Physical iPhone, iOS Simulator, Android Emulator/device.
- OS permission dialogs and notification tap routing.
- Dynamic Type / TalkBack / VoiceOver.
- Tablets, foldables, split screen, orientation changes.

## 9. Performance assessment

No performance profiling was performed. The app uses small mock datasets and simple lists, so no measured bottleneck is confirmed. Web bundle is approximately 1.1MB entry plus route chunks; this is acceptable for a demo but should be measured before release. No caching, memoization, native rewrite, or architectural performance change is recommended without measurement.

## 10. Recommended solutions summary

Implemented in this remediation:

- Home uses `featuredAlert.summary`.
- Alert detail distinguishes saved vs read later.
- Notification response is cleared and pending target survives login.
- Splash avoids repeated 1.6s delay on refocus.
- Notification default is false and test alert respects it.
- Permission denials offer Open Settings.
- Image picker no longer requests media permission.
- Unused camera/mic permissions are disabled.
- Contrast tokens and priority colors were darkened.
- Touch targets and dynamic-type containers were enlarged.
- SearchBar home control is a button.
- Decorative icon is hidden.
- Skeleton has progress semantics.
- Snackbar has alert semantics and 44px action.
- Modal views are marked modal.
- Form errors have alert role.
- Auth name updates and logout resets session/data.
- Local saved/reports/preferences are cleared on auth changes.
- OptionSheet scroll can shrink.
- Location/report permission denials offer settings.
- Help mailto has error handling.
- Web notifications are guarded.
- Unused dependencies removed.
- `+html.tsx` was updated to SDK 58 API.

## 11. Remediation roadmap

### Phase A — Critical security and release blockers
- A-029, A-030, A-034, A-035, A-036
- Effort: 6-12h
- Outcome: safer local data handling and release metadata.

### Phase B — Functional stability
- A-001, A-002, A-004, A-007, A-031
- Effort: 2-4h
- Status: mostly complete.

### Phase C — Lifecycle, device, and platform compatibility
- A-003, A-005, A-006, A-008, A-010, A-011, A-012, A-044, A-046
- Effort: 4-6h
- Status: complete for code-level fixes; native device QA remains.

### Phase D — UI/UX, responsive layout, and accessibility
- A-013 through A-026
- Effort: 4-6h
- Status: mostly complete; reduce-motion and modal focus remain.

### Phase E — Offline behavior and data reliability
- A-029, A-030, A-031
- Effort: 4-8h
- Outcome: retention, deletion, and draft recovery policy.

### Phase F — Performance and resource optimization
- A-049
- Effort: profile first, then optimize measured bottlenecks.
- No optimization implemented without measurement.

### Phase G — Architecture and maintainability
- A-032, A-040, A-041, A-042, A-047
- Effort: 4-8h
- Outcome: cleaner codebase and automated coverage.

### Phase H — Testing and regression prevention
- A-032
- Effort: 4-8h
- Outcome: unit/component/E2E coverage for critical flows.

### Phase I — Production and store readiness
- A-033, A-034, A-035, A-036, A-037, A-038
- Effort: 12-24h
- Outcome: deployable beta/release candidate.

## 12. Implementation report

Files changed in this remediation:

- `app/+html.tsx`
- `app/(tabs)/index.tsx`
- `app/alert/[id].tsx`
- `app/index.tsx`
- `app/report.tsx`
- `app/settings/help.tsx`
- `app/settings/location.tsx`
- `app/settings/notifications.tsx`
- `app.json`
- `src/components/CategoryIcon.tsx`
- `src/components/Chip.tsx`
- `src/components/FormField.tsx`
- `src/components/OptionSheet.tsx`
- `src/components/PriorityBanner.tsx`
- `src/components/SearchBar.tsx`
- `src/components/SegmentedControl.tsx`
- `src/components/Skeleton.tsx`
- `src/components/Snackbar.tsx`
- `src/hooks/useNotificationRouting.ts`
- `src/store/authStore.ts`
- `src/store/prefsStore.ts`
- `src/store/reportsStore.ts`
- `src/store/savedStore.ts`
- `src/strings.ts`
- `src/theme/tokens.ts`
- `src/utils/notifications.ts`
- `package.json` and `package-lock.json` (removed unused dependencies)

Verification performed:

- `npm run typecheck`: pass
- `npm run lint`: pass, 1 non-blocking React Compiler warning in `app/report.tsx:92:21`
- `npx expo-doctor`: 20/20 pass
- `npm audit --omit=dev`: 12 moderate, all build tooling
- Web export: pass
- iOS export: pass
- Android export: pass
- Playwright web flow: pass after notification guards

## 13. Release-readiness assessment

Not ready for store submission. Blocking items:

- Placeholder bundle identifiers.
- No privacy policy or support URLs.
- No EAS configuration.
- No crash reporting.
- No automated tests.
- No real backend, authentication, or remote push.
- Native device QA not performed.

Ready for:

- Local development.
- Web preview.
- Internal code review and continued feature work.

## 14. Technical debt register

- Mock data and no API layer.
- Duplicated async hook patterns.
- Global persisted stores without user scoping.
- React Hook Form `watch()` React Compiler warning.
- Unused copy/helpers/assets.
- No test infrastructure.
- No release/deployment configuration.

## 15. Remaining risks and limitations

- Native permission, notification tap, and lifecycle behavior are unverified because no simulator/emulator or physical device was used.
- Accessibility was improved but not manually tested with TalkBack/VoiceOver or reduced motion.
- Performance is unmeasured.
- npm audit vulnerabilities remain because the safe fix breaks Expo compatibility.
- Report data retention and deletion UX remain incomplete.
- The app remains a frontend demo with mock data.
