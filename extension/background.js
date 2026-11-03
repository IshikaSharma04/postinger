// Background service worker for Postinger Web Clipper (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-page-to-postinger",
    title: "Save page to Postinger Ideas",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "save-text-to-postinger",
    title: "Save selection to Postinger Ideas",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "save-image-to-postinger",
    title: "Save image to Postinger Ideas",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const settings = await chrome.storage.sync.get(["apiUrl", "workspaceId"]);
  const baseUrl = settings.apiUrl || "http://localhost:3001";
  const workspaceId = settings.workspaceId;

  if (!workspaceId) {
    console.warn("Postinger: No workspaceId configured. Open extension popup to configure.");
    return;
  }

  let title = tab?.title || "Clipped Idea";
  let content = "";
  let mediaUrl = undefined;

  if (info.menuItemId === "save-text-to-postinger" && info.selectionText) {
    title = `Snippet: "${info.selectionText.slice(0, 60)}..."`;
    content = `${info.selectionText}\n\nSource: ${info.pageUrl}`;
  } else if (info.menuItemId === "save-image-to-postinger" && info.srcUrl) {
    title = `Image from ${new URL(info.pageUrl || baseUrl).hostname}`;
    mediaUrl = info.srcUrl;
    content = `Captured image: ${info.srcUrl}\n\nSource: ${info.pageUrl}`;
  } else {
    content = `Clipped URL: ${tab?.url || info.pageUrl}`;
  }

  try {
    await fetch(`${baseUrl}/api/ideas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        title,
        content,
        mediaUrl,
        tags: ["Clipped", "Extension"],
      }),
    });
  } catch (err) {
    console.error("Failed to save to Postinger:", err);
  }
});
