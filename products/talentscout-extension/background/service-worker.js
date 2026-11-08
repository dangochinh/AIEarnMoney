/**
 * TalentScout AI — Background Service Worker (Manifest V3)
 * Manages daily quota, lifecycle & background notifications.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("🐸 TalentScout AI — Auto-Pilot LinkedIn Harvester Installed!");
  initDailyState();
});

chrome.runtime.onStartup.addListener(() => {
  initDailyState();
});

function getTodayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function initDailyState() {
  const today = getTodayIso();
  chrome.storage.local.get(["talentscout_daily_state"], res => {
    const stored = res.talentscout_daily_state;
    if (!stored || stored.date !== today) {
      const reset = {
        date: today,
        scanned: 0,
        quota: stored?.quota || 50
      };
      chrome.storage.local.set({ talentscout_daily_state: reset });
    }
  });
}

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_STATS") {
    chrome.storage.local.get(["talentscout_candidates", "talentscout_daily_state"], res => {
      const list = res.talentscout_candidates || [];
      const daily = res.talentscout_daily_state || { date: getTodayIso(), scanned: 0, quota: 50 };
      sendResponse({
        count: list.length,
        dailyScanned: daily.scanned,
        dailyQuota: daily.quota
      });
    });
    return true; // async
  }
});
