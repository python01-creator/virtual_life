# My Life HQ code map

The site is a buildless application, so the order of classic scripts in `index.html` is part of the runtime contract.

## Core ownership

- `cloud.js`: authentication and user-scoped Supabase access.
- `features/room-core.js`: shared room state, drawing primitives, records, and the diary UI.
- `features/room-places.js`: place selection and per-place room state.
- `features/room-layout.js`: placement handles for the built-in study-room furniture.
- `features/interior-catalog.js`: addable furniture and placement in office/bedroom scenes.
- `sw.js`: offline cache. Every versioned script URL in `index.html` must use the same version in `APP_FILES`.

## Extension order

Several feature files extend shared functions by saving the previous function and installing a wrapper. Do not reorder these scripts without checking the complete chain.

- `lifePut`: `room-core` → `room-layout` → `study` → `growth`
- `lifeRender`: `room-core` → `room-layout` → `navigation` → `object-navigation` → `memory-popup` → `writing-popup`
- `openPanel`: `room-core` → `legacy-core` → `today-room` → `study` → `calendar` → `object-navigation` → `notion-monitor`
- `drawRoom`: `room-core` → room furniture features → movement/scene features → `interior-catalog`
- `lifeRoomSave`: `room-core` → `room-places` → `enhancements` → `interior-catalog`

## Safe change checklist

1. Keep the script order stable unless the wrapper chain is updated deliberately.
2. Bump the changed file's query version in both `index.html` and `sw.js`.
3. Bump `CACHE` in `sw.js`.
4. Run `node --check` for every JavaScript file and `git diff --check`.
5. Verify login, room loading, furniture placement, Today, diary, and mobile overflow in the deployed build.

`room-core.js` is still the largest file. Further extraction should be incremental: diary UI first, then record editor/import, with a deployed smoke test after each move.
