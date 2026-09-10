const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// We reuse the parsing logic we wrote in importDocx.ts, but adapted to Node.js environments
const jszip = require('jszip');
const mammoth = require('mammoth');

const DOCX_PATH = '/home/mohitraj8503/Pictures/Work Files/AI Career Gold Rush.docx';
const AUTHOR_ID = 'cmq8znup900001j9n9z11y0m0'; // mukulonthenet@gmail.com

function parseChartXml(xmlContent) {
  const valMatches = [...xmlContent.matchAll(/<c:v>([^<]+)<\/c:v>/g)].map(m => m[1]);
  const textMatches = [...xmlContent.matchAll(/<a:t>([^<]+)<\/a:t>/g)].map(m => m[1]);
  const labels = [];
  const values = [];

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

function generateSvgChart(chart) {
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

  const base64Svg = Buffer.from(svgString).toString('base64');
  return `<img src="data:image/svg+xml;base64,${base64Svg}" alt="${chart.title}" style="max-width: 100%; height: auto; border-radius: 24px; margin: 32px auto; display: block; border: 1px solid rgba(255,255,255,0.1);" />`;
}

async function run() {
  try {
    console.log('1. Reading DOCX file...');
    const fileBuffer = fs.readFileSync(DOCX_PATH);
    const zip = await jszip.loadAsync(fileBuffer);
    const relsText = await zip.file('word/_rels/document.xml.rels').async('text');
    let documentXml = await zip.file('word/document.xml').async('text');

    console.log('2. Extracting charts...');
    const chartRels = new Map();
    const relRegex = /<Relationship\s+Id="([^"]+)"\s+Type="[^"]*?relationships\/chart"\s+Target="([^"]+)"/g;
    let relMatch;
    while ((relMatch = relRegex.exec(relsText)) !== null) {
      chartRels.set(relMatch[1], relMatch[2]);
    }

    const chartDataMap = new Map();
    for (const [rId, target] of chartRels.entries()) {
      const chartPath = `word/${target.replace(/^\//, '')}`;
      const chartFile = zip.file(chartPath);
      if (chartFile) {
        const chartXml = await chartFile.async('text');
        chartDataMap.set(rId, parseChartXml(chartXml));
      }
    }

    const drawingRegex = /<w:drawing>[^]*?<c:chart[^>]*?r:id=\"([^\"]+)\"[^]*?<\/w:drawing>/g;
    documentXml = documentXml.replace(drawingRegex, (match, rId) => {
      return `<w:p><w:r><w:t>[[CHART_${rId}]]</w:t></w:r></w:p>`;
    });

    zip.file('word/document.xml', documentXml);
    const modifiedBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    console.log('3. Running Mammoth conversion...');
    const result = await mammoth.convertToHtml(
      { buffer: modifiedBuffer },
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
        ]
      }
    );

    let html = result.value;

    console.log('4. Embedding SVG charts...');
    for (const [rId, chart] of chartDataMap.entries()) {
      const svgChartHtml = generateSvgChart(chart);
      const placeholderRegex = new RegExp(`(<p>)*\\s*\\[\\[CHART_${rId}\\]\\]\\s*(</p>)*`, 'g');
      html = html.replace(placeholderRegex, svgChartHtml);
    }

    // Clean HTML spacing
    html = html
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<\/h([1-6])><p>/g, '</h$1><p>')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Set high-performing SEO Title, Excerpt, and Slug
    const title = 'AI Career Gold Rush: Best AI Tools & High-Paying Roles of 2026 🚀';
    const slug = 'ai-career-gold-rush-high-paying-roles-tools-2026';
    const excerpt = 'Discover the ultimate roadmap to build future-proof AI skills, master top-tier tools, and land high-paying roles in the 2026 AI transition.';

    console.log('5. Inserting post into database...');
    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content: html,
        category: 'AI & ML',
        tags: 'AI, Career Guide, Future of Work, Machine Learning, Resume Builder',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        status: 'published',
        authorId: AUTHOR_ID
      }
    });

    console.log('🚀 Blog Post published successfully!');
    console.log('   ID:', blogPost.id);
    console.log('   Slug:', blogPost.slug);
    console.log('   Title:', blogPost.title);
  } catch (err) {
    console.error('❌ Failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
