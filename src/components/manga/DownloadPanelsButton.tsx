"use client";
import { useState } from "react";

export function DownloadPanelsButton({ panels, chapterTitle }: { panels: { imageUrl: string; description?: string }[]; chapterTitle: string }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const folder = zip.folder(chapterTitle || "chapter")!;
    let downloaded = 0;
    await Promise.all(
      panels.map(async (panel, idx) => {
        try {
          const response = await fetch(panel.imageUrl);
          if (!response.ok) return;
          const blob = await response.blob();
          folder.file(`panel-${idx + 1}.jpg`, blob);
          downloaded++;
        } catch (err) {
          // skip failed images
        }
      })
    );
    if (downloaded === 0) {
      alert("No images could be downloaded. This may be due to CORS or server errors.");
      setDownloading(false);
      return;
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chapterTitle || "chapter"}.zip`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 1000);
  }

  return (
    <button
      className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80"
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? "Downloading..." : "Download for Offline"}
    </button>
  );
}
