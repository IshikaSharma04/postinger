document.addEventListener("DOMContentLoaded", async () => {
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const tagsInput = document.getElementById("tags");
  const form = document.getElementById("clipForm");
  const status = document.getElementById("status");

  // Autofill current tab info
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      titleInput.value = tab.title || "";
      contentInput.value = `Source: ${tab.url || ""}`;
    }
  } catch (err) {
    console.error(err);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Saving...";
    status.style.color = "#525252";

    try {
      const res = await fetch("http://localhost:3001/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleInput.value.trim(),
          content: contentInput.value.trim(),
          tags: tagsInput.value.split(",").map((t) => t.trim()).filter(Boolean),
          status: "UNASSIGNED",
        }),
      });

      if (res.ok) {
        status.textContent = "✓ Saved to your Ideas board!";
        status.style.color = "#059669";
        setTimeout(() => window.close(), 1200);
      } else {
        status.textContent = "Please sign in to Postinger at localhost:3001";
        status.style.color = "#DC2626";
      }
    } catch {
      status.textContent = "Could not reach Postinger server.";
      status.style.color = "#DC2626";
    }
  });
});
