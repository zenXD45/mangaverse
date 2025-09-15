'use client';

import JSZip from 'jszip';

export async function downloadPanelsAsZip(panels: { imageUrl: string; description?: string }[], chapterTitle: string) {
  const zip = new JSZip();
  const folder = zip.folder(chapterTitle || 'chapter')!;

  // Download each image and add to zip
  await Promise.all(
    panels.map(async (panel, idx) => {
      try {
        const response = await fetch(panel.imageUrl);
        const blob = await response.blob();
        folder.file(`panel-${idx + 1}.jpg`, blob);
      } catch (err) {
        // skip failed images
      }
    })
  );

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${chapterTitle || 'chapter'}.zip`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
