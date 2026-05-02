# RequestsNearbyScreen UI Analysis

**Date:** February 13, 2025  
**Scope:** Compare `RequestsNearbyScreen.tsx` with `ProfileScreen.tsx` and `HomeScreen.tsx` for header, card layout, and theme usage inconsistencies.

---

## Executive Summary

`RequestsNearbyScreen` uses a cartoon-style card layout similar to Profile and Home, but mixes hard-coded values with theme tokens and uses different shadow offsets and radii. Several magic numbers and raw hex values should be replaced with theme constants for design-system consistency.

---

## 1. Nearby Requests Header

### Current Implementation (RequestsNearbyScreen)

| Property | Current Value | Reference (Profile BentoCard) | Issue |
|----------|---------------|-------------------------------|-------|
| `topCardShadow` offset | `top: 5, left: 5, right: -5, bottom: -5` | Profile `cardShadow`: `top: 6, left: 6, right: -6, bottom: -6` | **Inconsistent** – Profile uses 6px offset for cartoon shadow |
| `topCardShadow` borderRadius | `18` | Profile `cardShadow`: `20` | Close but not mapped to theme; `theme.radius.lg` = 18 |
| `topCard` backgroundColor | `'#FFFFFF'` | Profile `sectionCard`: `'#FFFFFF'` | **Hard-coded** – should use `theme.colors.white` |
| `topCard` padding | `paddingVertical: 10, paddingHorizontal: 12` | Profile `sectionCard`: `padding: theme.spacing.md` | **Magic numbers** – use `theme.spacing.sm` / `theme.spacing.md` |
| `topCard` borderRadius | `18` | Profile: `18` | Should use `theme.radius.lg` |
| `refreshButton` borderRadius | `14` | Profile `switchButton` / `areaBadge`: `12` (`theme.radius.md`) | **Inconsistent** – use `theme.radius.md` |
| `refreshButton` size | `40 x 40` | N/A | Raw numbers; acceptable but could be `theme.spacing.lg + theme.spacing.xs` (24 + 4 = 28) – 40 is fine as a constant |

### Cartoon Shadow Structure

- **Profile** `cardShadow`: bottom-right offset `(6, 6, -6, -6)`, `SketchFill`, `theme.colors.lightAccent`, `theme.colors.borderCardLight`.
- **RequestsNearby** `topCardShadow`: offset `(5, 5, -5, -5)` – same pattern but 5px vs 6px.
- **ActionCard** (Home): uses `(6, 6, -6, -6)` with `theme.radius.xl`, `theme.colors.lightAccent`, `theme.colors.borderCardLight`.

**Recommendation:** Align `topCardShadow` offset to `6` and use `theme.radius.lg` throughout the header.

---

## 2. Request Card Layout

### Card Container (stackWrap)

| Property | Current Value | Issue |
|----------|---------------|-------|
| `bottom` | `theme.layout.tabBarHeight + theme.spacing.sm - 100` | **Magic number `-100`** – ad hoc; suggest `theme.layout.tabBarHeight + theme.spacing.md` |
| `minHeight` | `220` | No fixed height; card height varies with content |

### Popup Card (popupCard / popupShadow)

| Property | Current Value | Theme Equivalent | Issue |
|----------|---------------|------------------|-------|
| `popupShadow` offset | `6, 6, -6, -6` | ✓ Matches Profile | OK |
| `popupShadow` / `popupCard` borderRadius | `22` | `theme.radius.xl` = 24 | **Magic number** – use `theme.radius.xl` |
| `popupCard` backgroundColor | `'#FFFFFF'` | `theme.colors.white` | **Hard-coded** |
| `popupCard` padding | `theme.spacing.sm + 4` | ~12px | Mixed; use `theme.spacing.md` for clarity |
| `popupCard` minHeight | `150` | N/A | **Variable height** – no fixed height; card grows with content |

### Card Size Stability

- `problemText` uses `numberOfLines={isFront ? 2 : 1}` – front card shows 2 lines, back cards 1.
- Description length changes card height.
- **Recommendation:** Use `numberOfLines={1}` and `ellipsizeMode="tail"` for all cards, and set a fixed `height` (e.g. 220) to keep card size stable.

---

## 3. Card Internal Spacing

### Current Values vs Theme

| Element | Current | Theme Alternative |
|---------|---------|-------------------|
| `popupHeader` gap | `10` | `theme.spacing.sm` (8) or keep 10 if preferred |
| `customerName` marginRight | `8` | `theme.spacing.sm` |
| `headerActions` gap | `6` | Between `theme.spacing.xs` (4) and `theme.spacing.sm` (8) |
| `problemText` marginTop | `6` | `theme.spacing.xs` (4) or `theme.spacing.sm` (8) |
| `metaRow` marginTop | `8` | `theme.spacing.sm` |
| `metaRow` marginBottom | `10` | Mix of sm/md; use `theme.spacing.sm` for consistency |
| `actionsRow` marginTop | `2` | `theme.spacing.xs` (4) is closest |
| `actionsRow` gap | `10` | `theme.spacing.sm` (8) for consistency with Profile |

**Profile** uses `gap: 10` in `sectionCard` and `gap: 8` in `sectionHeader` / `tagWrap` / `statsGrid`. **Recommendation:** Standardize on `theme.spacing.sm` (8) and `theme.spacing.xs` (4) for small gaps.

---

## 4. Border Radii Alignment

| Location | Current | theme.radius | Recommendation |
|----------|---------|--------------|----------------|
| Header card | 18 | `lg` = 18 | Use `theme.radius.lg` |
| Request cards | 22 | `xl` = 24 | Use `theme.radius.xl` |
| refreshButton | 14 | `md` = 12 | Use `theme.radius.md` |
| switchButton | 12 | `md` = 12 | ✓ Already matches |
| emptyCenter | 14 | `md` = 12 | Use `theme.radius.md` |

---

## 5. Color Usage

| Location | Current | Should Use |
|----------|---------|------------|
| `topCard` backgroundColor | `'#FFFFFF'` | `theme.colors.white` |
| `popupCard` backgroundColor | `'#FFFFFF'` | `theme.colors.white` |
| `emptyCenter` backgroundColor | `'rgba(255,255,255,0.92)'` | Consider `theme.colors.white` with opacity or a semantic token if one exists |

---

## 6. Empty State (emptyCenter)

| Property | Current | Issue |
|----------|---------|-------|
| paddingHorizontal | `12` | Use `theme.spacing.md` |
| paddingVertical | `8` | Use `theme.spacing.sm` |
| borderRadius | `14` | Use `theme.radius.md` |
| backgroundColor | `rgba(255,255,255,0.92)` | Use theme-based white + opacity |

---

## 7. Summary of Inconsistencies

### High Priority

1. **Hard-coded white** – Replace `'#FFFFFF'` with `theme.colors.white`.
2. **Variable card height** – Fix `popupCard` height and `problemText` `numberOfLines` so cards do not grow with content.
3. **Magic `-100` in stackWrap bottom** – Replace with a clear offset (e.g. `theme.layout.tabBarHeight + theme.spacing.md`).

### Medium Priority

4. **Shadow offset mismatch** – Header uses 5px, Profile/ActionCard use 6px; align to 6px.
5. **Magic radii** – Replace 18, 22, 14 with `theme.radius.lg`, `theme.radius.xl`, `theme.radius.md`.
6. **Magic spacing** – Replace 6, 8, 10, 2 with `theme.spacing.*`.

### Lower Priority

7. **emptyCenter** – Use theme tokens for padding, radius, and background.
8. **Typography** – `topTitle` uses raw `fontSize: 16`; could align with `theme.typography.subtitle` if desired.

---

## 8. What Is Already Consistent

- Screen background uses `theme.colors.cartoon.cream`.
- Cartoon palette (`charcoal`, `gray`, `blue`, `blueBg`, etc.) is used correctly.
- Typography uses `theme.typography.caption` and `theme.typography.body`.
- `CartoonActionButton` with `variant="reject"` / `"accept"` matches Profile.
- Card width calculation uses `theme.spacing.md`.
- 2px border with `theme.colors.borderCardLight` matches Profile cards.
- `SketchFill` + offset shadow pattern is correct for cartoon style.
