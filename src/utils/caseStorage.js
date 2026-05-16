// src/utils/caseStorage.js
// =========================================================
// Tracked Cases — Local Persistence
// ---------------------------------------------------------
// Stores the list of receipt numbers the user is tracking,
// plus the most recent status snapshot for each. We persist
// the snapshot so the app can show the last-known status
// even when offline (or before the first refresh completes).
//
// Storage shape (JSON-stringified in AsyncStorage):
//   {
//     "MSC2190000000": {
//       receiptNumber: "MSC2190000000",
//       nickname: "My I-485",     // optional, user-set
//       addedAt: 1730000000000,
//       lastFetchedAt: 1730000000000,
//       snapshot: { ...getCaseSnapshot output... } | null,
//       lastError: { code, message, ... } | null
//     },
//     ...
//   }
//
// We use a single AsyncStorage key holding all cases as one
// JSON blob — simpler than per-case keys, and the dataset is
// tiny (a typical user tracks 1–5 cases for themselves +
// family members).
// =========================================================

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@onepath:trackedCases";

async function readAll() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Defensive: if storage was corrupted or pre-migration,
    // start clean rather than crash.
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.warn("[caseStorage] readAll failed:", err.message);
    return {};
  }
}

async function writeAll(cases) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    return true;
  } catch (err) {
    console.warn("[caseStorage] writeAll failed:", err.message);
    return false;
  }
}

/**
 * Get all tracked cases as an array, sorted by most-recently-added first.
 */
export async function getTrackedCases() {
  const map = await readAll();
  return Object.values(map).sort(
    (a, b) => (b.addedAt || 0) - (a.addedAt || 0)
  );
}

/**
 * Get a single tracked case by receipt number, or null.
 */
export async function getTrackedCase(receiptNumber) {
  const map = await readAll();
  return map[receiptNumber] || null;
}

/**
 * Add a new case to tracking. If it already exists, this is
 * a no-op (returns the existing entry) — caller can decide
 * whether to refresh.
 */
export async function addTrackedCase(receiptNumber, { nickname } = {}) {
  const map = await readAll();

  if (map[receiptNumber]) {
    return map[receiptNumber];
  }

  const entry = {
    receiptNumber,
    nickname: nickname || "",
    addedAt: Date.now(),
    lastFetchedAt: null,
    snapshot: null,
    lastError: null,
  };

  map[receiptNumber] = entry;
  await writeAll(map);
  return entry;
}

/**
 * Update an existing case after a successful fetch.
 * Stores the snapshot and clears any prior error.
 */
export async function updateCaseSnapshot(receiptNumber, snapshot) {
  const map = await readAll();
  if (!map[receiptNumber]) return null;

  map[receiptNumber] = {
    ...map[receiptNumber],
    snapshot,
    lastFetchedAt: Date.now(),
    lastError: null,
  };

  await writeAll(map);
  return map[receiptNumber];
}

/**
 * Record an error against a case after a failed fetch.
 * Keeps the prior snapshot intact (so user still sees
 * last-known status) but surfaces the error.
 */
export async function recordCaseError(receiptNumber, error) {
  const map = await readAll();
  if (!map[receiptNumber]) return null;

  map[receiptNumber] = {
    ...map[receiptNumber],
    lastError: error,
    lastFetchedAt: Date.now(),
  };

  await writeAll(map);
  return map[receiptNumber];
}

/**
 * Remove a case from tracking entirely.
 */
export async function removeTrackedCase(receiptNumber) {
  const map = await readAll();
  if (!map[receiptNumber]) return false;
  delete map[receiptNumber];
  await writeAll(map);
  return true;
}

/**
 * Update a case's nickname.
 */
export async function setCaseNickname(receiptNumber, nickname) {
  const map = await readAll();
  if (!map[receiptNumber]) return null;
  map[receiptNumber] = { ...map[receiptNumber], nickname: nickname || "" };
  await writeAll(map);
  return map[receiptNumber];
}

/**
 * Wipe all tracked cases — used by the "Reset App Data"
 * flow in Settings.
 */
export async function clearAllTrackedCases() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}