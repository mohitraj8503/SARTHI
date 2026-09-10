import mammoth from 'mammoth';
import JSZip from 'jszip';

export interface DocxImportResult {
  html: string;
  htmlWithoutFirstImage: string;
  title: string;        // first H1 found, used to auto-fill blog title
  firstImage?: string;  // first extracted image used for cover image proposal
  warnings: string[];   // mammoth conversion warnings
  imageCount: number;   // how many images were embedded
  wordCount: number;    // approximate word count
}

interface ChartData {
  title: string;
  labels: string[];
  values: number[];
}

// Extract chart data from the chart XML file content
function parseChartXml(xmlContent: string): ChartData {
  const valMatches = [...xmlContent.matchAll(/<c:v>([^<]+)<\/c:v>/g)].map(m => m[1]);
  const textMatches = [...xmlContent.matchAll(/<a:t>([^<]+)<\/a:t>/g)].map(m => m[1]);

  const labels: string[] = [];
  const values: number[] = [];

  const numbers = valMatches.map(v => parseFloat(v)).filter(v => !isNaN(v));
  const nonNumbers = valMatches.filter(v => isNaN(parseFloat(v)));

  if (nonNumbers.length > 0 && numbers.length > 0) {
    labels.push(...nonNumbers);
    values.push(...numbers);
  } else {
    for (let i = 0; i < valMatches.length; i++) {
      const val = valMatches[i];
      if (isNaN(parseFloat(val))) {
        labels.push(val);
      } else {
        values.push(parseFloat(val));
      }
    }
  }

  const title = textMatches.join(' ').replace(/\s+/g, ' ').trim() || 'Data Chart';

  return {
    title,
    labels: labels.slice(0, values.length),
    values
  };
}

// Generate a responsive SVG chart
function generateSvgChart(chart: ChartData, type: 'pie'): string {
  const colors = ['#38BDF8', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];
  const total = chart.values.reduce((sum, val) => sum + val, 0);

  let accumulatedAngle = 0;
  const radius = 80;
  const cx = 100;
  const cy = 100;

  const slices = chart.values.map((val, index) => {
    const angle = (val / total) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const rad1 = ((startAngle - 90) * Math.PI) / 180;
    const rad2 = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(rad1);
    const y1 = cy + radius * Math.sin(rad1);
    const x2 = cx + radius * Math.cos(rad2);
    const y2 = cy + radius * Math.sin(rad2);

    const largeArc = angle > 180 ? 1 : 0;
    const color = colors[index % colors.length];

    return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${color}" stroke="#ffffff" stroke-width="2" />`;
  }).join('');

  const legendItems = chart.labels.map((label, index) => {
    const val = chart.values[index];
    const percentage = Math.round((val / total) * 100);
    const color = colors[index % colors.length];
    const yOffset = 50 + index * 30;
    return `
      <circle cx="210" cy="${yOffset}" r="8" fill="${color}" />
      <text x="230" y="${yOffset + 5}" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">${label} (${percentage}%)</text>
    `;
  }).join('');

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" width="100%" height="auto">
      <rect width="100%" height="100%" rx="20" fill="#1e293b" />
      <text x="30" y="40" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing="1">${chart.title.toUpperCase()}</text>
      <g transform="translate(10, 20)">
        ${slices}
        <circle cx="100" cy="100" r="30" fill="#1e293b" />
      </g>
      <g transform="translate(40, 20)">
        ${legendItems}
      </g>
    </svg>
  `.trim();

  const base64Svg = typeof window !== 'undefined'
    ? btoa(unescape(encodeURIComponent(svgString)))
    : Buffer.from(svgString).toString('base64');
  
  return `<img src="data:image/svg+xml;base64,${base64Svg}" alt="${chart.title}" style="max-width: 100%; height: auto; border-radius: 24px; margin: 32px auto; display: block; border: 1px solid rgba(255,255,255,0.1);" />`;
}

export async function importDocxToHtml(file: File): Promise<DocxImportResult> {
  const arrayBuffer = await file.arrayBuffer();
  
  const zip = await JSZip.loadAsync(arrayBuffer);
  const relsText = await zip.file('word/_rels/document.xml.rels')?.async('text') || '';
  let documentXml = await zip.file('word/document.xml')?.async('text') || '';

  const chartRels = new Map<string, string>();
  const relRegex = /<Relationship\s+Id="([^"]+)"\s+Type="[^"]*?relationships\/chart"\s+Target="([^"]+)"/g;
  let relMatch;
  while ((relMatch = relRegex.exec(relsText)) !== null) {
    chartRels.set(relMatch[1], relMatch[2]);
  }

  const chartDataMap = new Map<string, ChartData>();
  for (const [rId, target] of chartRels.entries()) {
    const chartPath = `word/${target.replace(/^\//, '')}`;
    const chartFile = zip.file(chartPath);
    if (chartFile) {
      const chartXml = await chartFile.async('text');
      const parsedData = parseChartXml(chartXml);
      chartDataMap.set(rId, parsedData);
    }
  }

  const drawingRegex = /<w:drawing>[^]*?<c:chart[^>]*?r:id="([^"]+)"[^]*?<\/w:drawing>/g;
  documentXml = documentXml.replace(drawingRegex, (match, rId) => {
    return `
      <w:p>
        <w:r>
          <w:t>[[CHART_${rId}]]</w:t>
        </w:r>
      </w:p>
    `;
  });

  zip.file('word/document.xml', documentXml);
  const modifiedBuffer = await zip.generateAsync({ type: 'arraybuffer' });

  const result = await mammoth.convertToHtml(
    { arrayBuffer: modifiedBuffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Heading 1 Char'] => h2:fresh",
        "p[style-name='Body Text'] => p:fresh",
        "p[style-name='Default Paragraph Style'] => p:fresh",
        "p[style-name='List Paragraph'] => li:fresh",
      ],
      convertImage: mammoth.images.imgElement(async (image) => {
        const base64 = await image.read('base64');
        const contentType = image.contentType || 'image/png';
        return {
          src: `data:${contentType};base64,${base64}`,
          style: 'max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;',
        };
      }),
    }
  );

  let html = result.value;

  for (const [rId, chart] of chartDataMap.entries()) {
    const svgChartHtml = generateSvgChart(chart, 'pie');
    const placeholderRegex = new RegExp(`(<p>)*\\s*\\[\\[CHART_${rId}\\]\\]\\s*(</p>)*`, 'g');
    html = html.replace(placeholderRegex, svgChartHtml);
  }

  html = html
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<\/h([1-6])><p>/g, '</h$1><p>')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Extract title from first H1
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const title = titleMatch
    ? titleMatch[1].replace(/<[^>]+>/g, '').trim()
    : '';

  if (titleMatch) {
    html = html.replace(titleMatch[0], '').trim();
  }

  // Extract first image src if present for cover image proposal
  const firstImgMatch = html.match(/<img[^>]+src="([^">]+)"/i);
  const firstImage = firstImgMatch ? firstImgMatch[1] : undefined;

  let htmlWithoutFirstImage = html;
  if (firstImgMatch) {
    // Remove the first image element (and its parent <p> if isolated) to avoid duplicating cover image in body
    const firstImgTag = firstImgMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const standaloneRegex = new RegExp(`(<p[^>]*>\\s*)?${firstImgTag}(\\s*<\\/p>)?`, 'i');
    htmlWithoutFirstImage = html.replace(standaloneRegex, '').trim();
  }

  const imageCount = (html.match(/<img /gi) || []).length;
  const wordCount = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 0).length;

  return {
    html,
    htmlWithoutFirstImage,
    title,
    firstImage,
    warnings: result.messages.map(m => m.message),
    imageCount,
    wordCount,
  };
}
