import { toPng, toJpeg, toCanvas } from 'html-to-image';

/**
 * Renders the provided HTML snapshot string as a PDF using the browser's native print dialog.
 */
export async function downloadCertificateAsPdf(target: HTMLElement | string, filename = 'Certificate'): Promise<void> {
  if (typeof target === 'string') {
    const isPortrait = target.toLowerCase().includes('size: a4 portrait') || target.toLowerCase().includes('a4_portrait_letter');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const origin = window.location.origin;
      let patchedHtml = target.replace(/https:\/\/sarthi\.in/g, origin);
      if (!patchedHtml.includes('<base')) {
        patchedHtml = patchedHtml.replace('<head>', `<head><base href="${origin}/">`);
      }
      printWindow.document.write(patchedHtml);
      const printOverride = printWindow.document.createElement('style');
      if (isPortrait) {
        printOverride.textContent = `
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `;
      } else {
        printOverride.textContent = `
          @page {
            size: A4 landscape;
            margin: 0 !important;
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body {
              width: 297mm !important;
              height: 210mm !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }
            .certificate-card,
            .cert-card {
              width: 263mm !important;
              height: 194mm !important;
              padding: 12mm 15mm !important;
              background: rgba(255, 255, 255, 0.96) !important;
              background-color: rgba(255, 255, 255, 0.96) !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
              border: 2.5px solid rgba(255, 255, 255, 0.95) !important;
              border-radius: 8mm !important;
              box-shadow: none !important;
              position: relative !important;
              z-index: 2 !important;
            }
          }
        `;
      }
      printWindow.document.head.appendChild(printOverride);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 600);
    } else {
      console.warn('Failed to open print window. Popup blocker may be enabled.');
    }
    return;
  }

  // HTMLElement target — render high-res PDF using jsPDF with exact page size
  const { jsPDF } = await import('jspdf');

  let dataUrl: string;
  try {
    dataUrl = await toJpeg(target, {
      quality: 0.92,
      pixelRatio: 2.5,
      skipFonts: true,
      fontEmbedCSS: '',
      backgroundColor: '#ffffff',
      cacheBust: false,
    });
  } catch (err) {
    console.warn('toJpeg font fetch error, attempting fallback rendering:', err);
    const canvas = await toCanvas(target, {
      pixelRatio: 2.5,
      skipFonts: true,
      fontEmbedCSS: '',
    });
    dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  }

  const isLandscape = target.offsetWidth > target.offsetHeight;
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = isLandscape ? 297 : 210;
  const pdfHeight = isLandscape ? 210 : 297;

  pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  pdf.save(`${filename.endsWith('.pdf') ? filename : filename + '.pdf'}`);
}

/**
 * Renders the provided HTML snapshot string into a high-res PNG and triggers a download.
 *
 * Core insight: html-to-image uses a <canvas> internally. Drawing cross-origin images
 * onto a canvas throws a SecurityError (serialised as {}). The certificate images
 * (excel-bg.jpg, logo-tt.png, msme-logo.png, signature-mukul-pandey.png) all live in
 * the /public folder of this Next.js app, so they are always available at the *same*
 * origin as the running page.
 *
 * Strategy:
 *  1. Replace every `https://sarthi-woad.vercel.app/` reference in the snapshot with
 *     the current page origin so every image is same-origin — no CORS required.
 *  2. Extract the certificate card's <style> and <body> from the patched HTML.
 *  3. Inject them into a hidden fixed div inside the *current* document
 *     (html-to-image works correctly in the same document context).
 *  4. Apply the background image directly on the wrapper so the full certificate
 *     design (green Excel bg) renders correctly.
 *  5. Capture with toPng at 3× pixel density → download.
 */
export async function downloadCertificateAsPng(
  htmlSnapshot: string,
  filename: string,
): Promise<void> {
  // ── 1. Rewrite all production-domain image URLs to same-origin ──────────────
  const origin = window.location.origin; // e.g. "http://localhost:3000"
  const patchedHtml = htmlSnapshot.replace(
    /https?:\/\/sarthi\.in\//g,
    `${origin}/`,
  );

  // ── 2. Extract <style> blocks ────────────────────────────────────────────────
  const styleMatches = [
    ...patchedHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi),
  ];
  const combinedStyles = styleMatches.map((m) => m[1]).join('\n');

  // ── 3. Extract the background-image URL from html/body CSS ──────────────────
  // Pattern: background-image: url('...') in the html, body rule
  const bgMatch = combinedStyles.match(
    /background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/,
  );
  const bgUrl = bgMatch ? bgMatch[1] : '';

  // ── 4. Extract <body> inner HTML ─────────────────────────────────────────────
  const bodyMatch = patchedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : patchedHtml;

  // ── 5. Mount an off-screen container in the current document ────────────────
  const W = 1050;
  const H = 787.5;

  const wrapper = document.createElement('div');
  Object.assign(wrapper.style, {
    position: 'fixed',
    top: '-99999px',
    left: '-99999px',
    width: `${W}px`,
    height: `${H}px`,
    overflow: 'hidden',
    zIndex: '-9999',
    fontFamily: "'Montserrat', sans-serif",
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // Apply the background image directly so the Excel/Python bg renders
    backgroundImage: bgUrl ? `url('${bgUrl}')` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  });

  // Scoped styles for the certificate card
  const styleEl = document.createElement('style');
  styleEl.textContent = combinedStyles;
  wrapper.appendChild(styleEl);

  // Certificate body content
  const contentDiv = document.createElement('div');
  Object.assign(contentDiv.style, {
    width: `${W}px`,
    height: `${H}px`,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  });
  contentDiv.innerHTML = bodyContent;
  wrapper.appendChild(contentDiv);

  document.body.appendChild(wrapper);

  try {
    // Give the browser a tick to layout and paint
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => setTimeout(r, 300));

    const dataUrl = await toPng(wrapper, {
      width: W,
      height: H,
      pixelRatio: 3,
      skipFonts: true,       // Google Fonts are cross-origin; system fallback is fine for PNG
      cacheBust: true,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    document.body.removeChild(wrapper);
  }
}
