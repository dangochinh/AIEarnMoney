/**
 * TalentScout AI — Background Service Worker (Manifest V3)
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("🐸 TalentScout AI — LinkedIn Headhunter Extension Installed Successfully!");
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_STATS") {
    chrome.storage.local.get(["talentscout_candidates"], res => {
      const list = res.talentscout_candidates || [];
      sendResponse({ count: list.length });
    });
    return true; // async response
  }
});
