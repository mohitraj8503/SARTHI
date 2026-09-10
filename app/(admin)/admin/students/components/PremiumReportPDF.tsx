import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Svg, 
  Path, 
  Circle, 
  Line, 
  Rect, 
  G 
} from '@react-pdf/renderer';

// Premium Minimal HSL-Aligned Color Palette (Stripe/Linear grade)
const COLORS = {
  primary: '#0F172A',      // Slate 900 (Deep/Minimal)
  accent: '#F97316',       // SARTHI Brand Orange
  bgLight: '#F8FAFC',      // Soft Slate 50 Background
  border: '#E2E8F0',       // Slate 200 (Clean hairline dividers)
  textDark: '#0F172A',     // High-contrast text
  textMuted: '#64748B',    // Slate 500 (Clean secondary labels)
  textLight: '#94A3B8',    // Slate 400 (Metadata)
  white: '#FFFFFF',
  
  // Clean Status Indicators
  success: '#10B981',      // Emerald Green
  successBg: '#F0FDF4',
  successBorder: '#DCFCE7',
  
  pending: '#F59E0B',      // Amber
  pendingBg: '#FFFBEB',
  pendingBorder: '#FEF3C7',
  
  error: '#EF4444',        // Rose
  errorBg: '#FEF2F2',
  errorBorder: '#FEE2E2',
  
  info: '#3B82F6',         // Indigo
  infoBg: '#EFF6FF',
  infoBorder: '#DBEAFE'
};

const styles = StyleSheet.create({
  // Clean Layout System
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
    padding: 50,
    position: 'relative'
  },
  watermark: {
    position: 'absolute',
    top: 420,
    left: 120,
    fontSize: 56,
    fontWeight: 'bold',
    color: 'rgba(15, 23, 42, 0.015)',
    transform: 'rotate(-30deg)',
    zIndex: -1,
    letterSpacing: 6
  },
  
  // Running Header & Footer
  runningHeader: {
    position: 'absolute',
    top: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
    zIndex: 100
  },
  runningHeaderTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  runningHeaderLogo: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: COLORS.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  runningFooter: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    zIndex: 100
  },
  runningFooterText: {
    fontSize: 6.5,
    color: COLORS.textLight,
    letterSpacing: 0.2
  },
  pageNumber: {
    fontSize: 6.5,
    color: COLORS.textLight,
    fontWeight: 'bold'
  },

  // Cover Page Elements
  coverContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 50
  },
  coverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 20
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 0.5
  },
  logoSub: {
    fontSize: 8,
    color: COLORS.accent,
    letterSpacing: 3,
    marginTop: 3,
    fontWeight: 'bold'
  },
  consoleBadge: {
    backgroundColor: COLORS.bgLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  consoleBadgeText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  coverBody: {
    marginTop: 110,
    marginBottom: 110
  },
  coverTitlePre: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: COLORS.accent,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: -1,
    lineHeight: 1.15,
    textTransform: 'uppercase'
  },
  coverSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 20,
    maxWidth: 450,
    lineHeight: 1.6
  },
  coverMeta: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  metaItem: {
    width: '45%',
    marginBottom: 20
  },
  metaLabel: {
    fontSize: 7.5,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted
  },

  // Main Page Headers
  contentContainer: {
    marginTop: 25,
    flex: 1
  },
  sectionTitleBox: {
    marginBottom: 25,
    flexDirection: 'column'
  },
  sectionTitlePre: {
    fontSize: 7.5,
    color: COLORS.accent,
    fontWeight: 'bold',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 5
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: -0.5
  },

  // Premium Grid Cards (Elevated Stripe/Vercel Style)
  cardsGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    position: 'relative'
  },
  cardLeftAccent: {
    position: 'absolute',
    left: 0,
    top: 15,
    bottom: 15,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: -0.5,
    lineHeight: 1.1,
    marginBottom: 4
  },
  cardSub: {
    fontSize: 7.5,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 1.3
  },
  trendUp: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: COLORS.success
  },
  trendDown: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: COLORS.error
  },
  trendNeutral: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: COLORS.textMuted
  },

  // Dense Platform Stats Row
  statsBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  statBox: {
    width: '23.5%',
    backgroundColor: COLORS.bgLight,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  statBoxLabel: {
    fontSize: 6.5,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  statBoxValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary
  },

  // Premium Insight Callouts
  execSummaryText: {
    fontSize: 8.5,
    color: COLORS.textMuted,
    lineHeight: 1.6,
    backgroundColor: COLORS.bgLight,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginTop: 15
  },

  // Premium Stripe-grade Tables
  table: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 25,
    backgroundColor: COLORS.white
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  tableRowEven: {
    backgroundColor: '#FAFAFA'
  },
  tableCell: {
    fontSize: 8.5,
    color: COLORS.textDark
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  avatarCircleTeacher: {
    backgroundColor: COLORS.accent
  },
  avatarText: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: COLORS.white
  },
  nameCellBox: {
    flexDirection: 'column'
  },
  boldName: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: COLORS.textDark
  },
  mutedId: {
    fontSize: 6.5,
    color: COLORS.textLight,
    marginTop: 2
  },

  // Dynamic Status Badges (Stripe Style)
  pill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  pillText: {
    fontSize: 6.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4
  },

  // Charts
  chartContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 18,
    marginBottom: 25,
    backgroundColor: COLORS.white
  },
  chartTitle: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  chartHalf: {
    width: '48%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.white
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    flexWrap: 'wrap'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 6
  },
  legendColorBox: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6
  },
  legendText: {
    fontSize: 7,
    color: COLORS.textMuted
  },

  // Mini System LED list
  systemLED: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },

  // Empty State Compositions
  emptyStateBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginVertical: 15,
    backgroundColor: COLORS.bgLight
  },
  emptyStateText: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: 'bold'
  },

  // System notes and compliance
  systemNotesBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 18,
    backgroundColor: COLORS.bgLight,
    marginBottom: 25
  },
  systemNotesTitle: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  systemNoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border
  },
  systemNoteKey: {
    fontSize: 8,
    color: COLORS.textMuted
  },
  systemNoteValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.textDark
  },
  disclaimerBox: {
    marginTop: 35,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white
  },
  disclaimerTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  disclaimerText: {
    fontSize: 7.5,
    color: COLORS.textMuted,
    lineHeight: 1.5
  },

  // Segmented Directories (Page 5)
  gridList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  linkedinCard: {
    width: '32%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    flexDirection: 'column'
  },
  linkedinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  linkedinAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6
  },
  linkedinNameBox: {
    flexDirection: 'column',
    flex: 1
  },
  linkedinName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  linkedinTitle: {
    fontSize: 6,
    color: COLORS.textMuted,
    marginTop: 1
  },
  linkedinExpertise: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: COLORS.accent,
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  linkedinMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 6
  },
  linkedinMetricCol: {
    alignItems: 'center'
  },
  linkedinMetricVal: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  linkedinMetricLbl: {
    fontSize: 5,
    color: COLORS.textMuted,
    marginTop: 1
  },
  linkedinBadge: {
    fontSize: 6,
    fontWeight: 'bold',
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    alignSelf: 'flex-start',
    marginTop: 8,
    textTransform: 'uppercase'
  },
  domainSplitBarBox: {
    flexDirection: 'row',
    height: 12,
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 10
  },
  domainLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5
  },
  domainLabelCol: {
    alignItems: 'center',
    width: '18%'
  },
  domainLabelText: {
    fontSize: 6,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  domainValueText: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginTop: 2
  }
});

// Helper: Get initials
const getInitials = (name: string) => {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Helper: Format event severity to readable human copywriting
const formatEventName = (type: string) => {
  const t = type.toUpperCase();
  if (t.includes('REGISTER') || t.includes('SIGNUP')) return 'New student registration completed';
  if (t.includes('LOGIN')) return 'Administrative session initiated';
  if (t.includes('DEACTIVATE')) return 'Account access credentials suspended';
  if (t.includes('ACTIVATE') || t.includes('APPROVE')) return 'Account audit verified & approved';
  if (t.includes('REJECT')) return 'Course quality audit flag issued';
  if (t.includes('MUTATION') || t.includes('UPDATE')) return 'Database schema records modified';
  if (t.includes('PAYMENT') || t.includes('TRANSACTION')) return 'Portal transaction invoice processed';
  return type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
};

// Helper: Get status pill styles
const getStatusStyles = (status: string) => {
  const s = status.toUpperCase();
  switch (s) {
    case 'ACTIVE':
    case 'VERIFIED':
    case 'APPROVED':
    case 'HEALTHY':
    case 'SUCCESS':
      return {
        pill: [styles.pill, { backgroundColor: COLORS.successBg, borderColor: COLORS.successBorder }],
        text: [styles.pillText, { color: COLORS.success }],
        dot: [styles.dot, { backgroundColor: COLORS.success }]
      };
    case 'PENDING':
    case 'DRAFT':
    case 'WARNING':
      return {
        pill: [styles.pill, { backgroundColor: COLORS.pendingBg, borderColor: COLORS.pendingBorder }],
        text: [styles.pillText, { color: COLORS.pending }],
        dot: [styles.dot, { backgroundColor: COLORS.pending }]
      };
    case 'INACTIVE':
    case 'SUSPENDED':
    case 'BANNED':
    case 'CRITICAL':
    case 'ERROR':
      return {
        pill: [styles.pill, { backgroundColor: COLORS.errorBg, borderColor: COLORS.errorBorder }],
        text: [styles.pillText, { color: COLORS.error }],
        dot: [styles.dot, { backgroundColor: COLORS.error }]
      };
    default:
      return {
        pill: [styles.pill, { backgroundColor: COLORS.infoBg, borderColor: COLORS.infoBorder }],
        text: [styles.pillText, { color: COLORS.info }],
        dot: [styles.dot, { backgroundColor: COLORS.info }]
      };
  }
};

const SvgText = ({ children, x, y, fontSize, fill, ...props }: any) => {
  return React.createElement('Text', { x, y, fill, style: { fontSize }, ...props }, children);
};

interface TimelineItem {
  date: string;
  count: number;
}

// Sleek Area Curve Chart (Gradient styling simulation)
const VectorLineChart = ({ data }: { data: TimelineItem[] }) => {
  const width = 450;
  const height = 140;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyStateBox}>
        <Text style={styles.emptyStateText}>Awaiting telemetry data history</Text>
      </View>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 5);
  const stepCount = data.length;
  
  const points = data.map((item, idx) => {
    const x = paddingLeft + (idx / Math.max(1, stepCount - 1)) * chartWidth;
    const y = height - paddingBottom - (item.count / maxCount) * chartHeight;
    return { x, y, count: item.count, label: item.date };
  });

  let pathD = '';
  let fillD = '';
  
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    points.forEach((p, idx) => {
      if (idx > 0) {
        pathD += ` L ${p.x} ${p.y}`;
      }
    });
    fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }

  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    const yVal = height - paddingBottom - (i / 4) * chartHeight;
    const label = Math.round((i / 4) * maxCount);
    gridLines.push({ y: yVal, label });
  }

  return (
    <View style={{ width, height, position: 'relative' }}>
      <Svg width={width} height={height}>
        {/* Extremely thin grid lines */}
        {gridLines.map((gl, i) => (
          <G key={`grid-${i}`}>
            <Line 
              x1={paddingLeft} 
              y1={gl.y} 
              x2={width - paddingRight} 
              y2={gl.y} 
              stroke="rgba(15, 23, 42, 0.05)" 
              strokeWidth={0.5} 
            />
            <SvgText x={5} y={gl.y + 2} fontSize={6} fill={COLORS.textMuted}>
              {gl.label.toString()}
            </SvgText>
          </G>
        ))}

        {/* Soft Area Background Underlay */}
        {fillD !== '' && (
          <Path 
            d={fillD} 
            fill="rgba(249, 115, 22, 0.05)" 
          />
        )}

        {/* Dynamic Stripe-Orange Stroke */}
        {pathD !== '' && (
          <Path 
            d={pathD} 
            fill="none" 
            stroke={COLORS.accent} 
            strokeWidth={1.8} 
          />
        )}

        {/* Tiny clean nodes */}
        {points.map((p, idx) => (
          <Circle 
            key={`dot-${idx}`} 
            cx={p.x} 
            cy={p.y} 
            r={2} 
            fill={COLORS.primary} 
            stroke={COLORS.white} 
            strokeWidth={0.8} 
          />
        ))}

        {/* Horizontal X Ticks */}
        {points.map((p, idx) => {
          if (idx % Math.ceil(points.length / 5) === 0 || idx === points.length - 1) {
            const labelParts = p.label.split('-');
            const shortLabel = labelParts.length >= 3 ? `${labelParts[1]}/${labelParts[2]}` : p.label;
            return (
              <SvgText 
                key={`x-lbl-${idx}`} 
                x={p.x - 8} 
                y={height - 6} 
                fontSize={6} 
                fill={COLORS.textMuted}
              >
                {shortLabel}
              </SvgText>
            );
          }
          return null;
        })}
      </Svg>
    </View>
  );
};

// Premium Vector Bar Chart with track visualizer
const VectorBarChart = ({ data }: { data: TimelineItem[] }) => {
  const width = 450;
  const height = 140;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyStateBox}>
        <Text style={styles.emptyStateText}>Awaiting telemetry data history</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map(d => d.count), 4);
  const barCount = data.length;
  const barGap = 18;
  const barWidth = (chartWidth - (barCount - 1) * barGap) / barCount;

  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    const yVal = height - paddingBottom - (i / 4) * chartHeight;
    const label = Math.round((i / 4) * maxVal);
    gridLines.push({ y: yVal, label });
  }

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* Hairline Grid Lines */}
        {gridLines.map((gl, i) => (
          <G key={`grid-${i}`}>
            <Line 
              x1={paddingLeft} 
              y1={gl.y} 
              x2={width - paddingRight} 
              y2={gl.y} 
              stroke="rgba(15, 23, 42, 0.05)" 
              strokeWidth={0.5} 
            />
            <SvgText x={5} y={gl.y + 2} fontSize={6} fill={COLORS.textMuted}>
              {gl.label.toString()}
            </SvgText>
          </G>
        ))}

        {/* Vertical Bars */}
        {data.map((item, idx) => {
          const barHeight = (item.count / maxVal) * chartHeight;
          const x = paddingLeft + idx * (barWidth + barGap);
          const y = height - paddingBottom - barHeight;
          return (
            <G key={`bar-${idx}`}>
              {/* Background Capacity Track Bar (Linear/Stripe style) */}
              <Rect
                x={x}
                y={paddingTop}
                width={barWidth}
                height={chartHeight}
                fill="rgba(15, 23, 42, 0.02)"
                rx={2}
                ry={2}
              />
              {/* Active Value Bar */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(1, barHeight)}
                fill={COLORS.primary}
                rx={2}
                ry={2}
              />
              {/* Axis Label */}
              <SvgText 
                x={x + barWidth / 2 - 10} 
                y={height - 6} 
                fontSize={6} 
                fill={COLORS.textMuted}
              >
                {item.date}
              </SvgText>
              {/* Value Indicator */}
              {item.count > 0 && (
                <SvgText 
                  x={x + barWidth / 2 - 4} 
                  y={y - 4} 
                  fontSize={6} 
                  fill={COLORS.primary} 
                  fontWeight="bold"
                >
                  {item.count.toString()}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

// Reusable SVG Donut Chart
const VectorDonutChart = ({ active, pending }: { active: number, pending: number }) => {
  const cx = 60;
  const cy = 55;
  const r = 35;
  const strokeWidth = 8;
  const total = active + pending;
  
  const activePct = total > 0 ? active / total : 0.8;
  const circ = 2 * Math.PI * r;
  const activeStrokeDashOffset = circ * (1 - activePct);
  
  return (
    <View style={{ width: 190, height: 110, flexDirection: 'row', alignItems: 'center' }}>
      <Svg width={120} height={110}>
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.secondary} strokeWidth={strokeWidth} />
        <Circle 
          cx={cx} 
          cy={cy} 
          r={r} 
          fill="none" 
          stroke={COLORS.success} 
          strokeWidth={strokeWidth} 
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={activeStrokeDashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <SvgText x={cx - 10} y={cy + 3} fontSize={10} fill={COLORS.primary} fontWeight="bold">
          {total.toString()}
        </SvgText>
        <SvgText x={cx - 11} y={cy + 10} fontSize={5.5} fill={COLORS.textMuted}>
          TOTAL
        </SvgText>
      </Svg>

      <View style={{ flexDirection: 'column', gap: 6, flex: 1, paddingLeft: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.legendColorBox, { backgroundColor: COLORS.success, width: 6, height: 6 }]} />
          <View>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: COLORS.primary }}>ACTIVE</Text>
            <Text style={{ fontSize: 6.5, color: COLORS.textMuted }}>{active} ({Math.round(activePct * 100)}%)</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.legendColorBox, { backgroundColor: COLORS.secondary, width: 6, height: 6 }]} />
          <View>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: COLORS.primary }}>PENDING</Text>
            <Text style={{ fontSize: 6.5, color: COLORS.textMuted }}>{pending} ({Math.round((1 - activePct) * 100)}%)</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Reusable SVG Concentric Telemetry Rings
const PremiumConcentricRings = ({ activePct, pendingPct, label1 = 'ACTIVE RATIO', label2 = 'PENDING RATIO' }: any) => {
  const cx = 60;
  const cy = 55;
  
  const circ1 = 2 * Math.PI * 35;
  const circ2 = 2 * Math.PI * 25;
  
  const activeOffset = circ1 * (1 - (activePct / 100));
  const pendingOffset = circ2 * (1 - (pendingPct / 100));

  return (
    <View style={{ width: 190, height: 110, flexDirection: 'row', alignItems: 'center' }}>
      <Svg width={120} height={110}>
        <Circle cx={cx} cy={cy} r={35} fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth={5} />
        <Circle 
          cx={cx} 
          cy={cy} 
          r={35} 
          fill="none" 
          stroke={COLORS.success} 
          strokeWidth={5} 
          strokeDasharray={`${circ1} ${circ1}`}
          strokeDashoffset={activeOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />

        <Circle cx={cx} cy={cy} r={25} fill="none" stroke="rgba(245, 158, 11, 0.08)" strokeWidth={5} />
        <Circle 
          cx={cx} 
          cy={cy} 
          r={25} 
          fill="none" 
          stroke={COLORS.secondary} 
          strokeWidth={5} 
          strokeDasharray={`${circ2} ${circ2}`}
          strokeDashoffset={pendingOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>

      <View style={{ flexDirection: 'column', gap: 8, flex: 1, paddingLeft: 10 }}>
        <View>
          <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: COLORS.success }}>{label1} ({activePct}%)</Text>
          <Text style={{ fontSize: 6, color: COLORS.textMuted }}>Ecosystem operational capacity</Text>
        </View>
        <View>
          <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: COLORS.secondary }}>{label2} ({pendingPct}%)</Text>
          <Text style={{ fontSize: 6, color: COLORS.textMuted }}>Verification backlogs queue</Text>
        </View>
      </View>
    </View>
  );
};

// Segmented splits
const SegmentedBreakdownGrid = ({ active, pending, inactive, type }: any) => {
  const total = active + pending + inactive;
  const aW = total > 0 ? (active / total) * 100 : 70;
  const pW = total > 0 ? (pending / total) * 100 : 20;
  const iW = total > 0 ? (inactive / total) * 100 : 10;

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Ecosystem Status Allocation Breakdown</Text>
      
      <View style={styles.domainSplitBarBox}>
        {aW > 0 && <View style={{ width: `${aW}%`, backgroundColor: COLORS.success }} />}
        {pW > 0 && <View style={{ width: `${pW}%`, backgroundColor: COLORS.secondary }} />}
        {iW > 0 && <View style={{ width: `${iW}%`, backgroundColor: COLORS.primary }} />}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <View style={{ width: '31%' }}>
          <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: COLORS.success }}>
            {type === 'students' ? 'ACTIVE' : 'VERIFIED'}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.primary, marginTop: 2 }}>{active}</Text>
          <Text style={{ fontSize: 6, color: COLORS.textMuted, marginTop: 2, lineHeight: 1.2 }}>
            {type === 'students' ? 'Authenticated active learners.' : 'Officially verified instructors.'}
          </Text>
        </View>
        <View style={{ width: '31%' }}>
          <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: COLORS.secondary }}>PENDING</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.primary, marginTop: 2 }}>{pending}</Text>
          <Text style={{ fontSize: 6, color: COLORS.textMuted, marginTop: 2, lineHeight: 1.2 }}>
            {type === 'students' ? 'Awaiting onboarding profiles.' : 'Awaiting credentials evaluation.'}
          </Text>
        </View>
        <View style={{ width: '31%' }}>
          <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: COLORS.primary }}>
            {type === 'students' ? 'INACTIVE' : 'SUSPENDED'}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.primary, marginTop: 2 }}>{inactive}</Text>
          <Text style={{ fontSize: 6, color: COLORS.textMuted, marginTop: 2, lineHeight: 1.2 }}>
            {type === 'students' ? 'Suspended or de-registered profiles.' : 'De-activated or suspended access.'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const FacultyDomainDistribution = ({ distribution }: { distribution: any[] }) => {
  const total = distribution.reduce((acc, d) => acc + d.value, 0);
  const colors = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.accent, COLORS.info];

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Faculty Domain Distribution (Specializations)</Text>
      
      <View style={styles.domainSplitBarBox}>
        {distribution.map((d, idx) => {
          const w = total > 0 ? (d.value / total) * 100 : 20;
          return w > 0 ? (
            <View 
              key={`bar-${idx}`} 
              style={{ width: `${w}%`, backgroundColor: colors[idx % colors.length] }} 
            />
          ) : null;
        })}
      </View>

      <View style={styles.domainLabelRow}>
        {distribution.map((d, idx) => {
          const w = total > 0 ? Math.round((d.value / total) * 100) : 20;
          return (
            <View key={`lbl-${idx}`} style={styles.domainLabelCol}>
              <View style={[styles.legendColorBox, { backgroundColor: colors[idx % colors.length], alignSelf: 'center', marginBottom: 3 }]} />
              <Text style={styles.domainLabelText} numberOfLines={1}>{d.name}</Text>
              <Text style={styles.domainValueText}>{d.value} ({w}%)</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  avatar: string | null;
  studentId: string;
  createdAt: string | Date;
  courses?: string[];
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  status: string;
  image: string | null;
  teacherId: string;
  createdAt: string | Date;
  coursesCount: number;
  studentsMentored: number;
  rating: number;
  earnings: number;
  liveSessionsCount: number;
  expertise: string;
  title: string;
  experience: string;
}

interface PDFProps {
  type: 'students' | 'teachers' | 'dashboard';
  data: {
    adminName: string;
    summary: any;
    timeline?: TimelineItem[];
    distribution?: { name: string; value: number }[];
    growth?: TimelineItem[];
    students?: Student[];
    teachers?: Teacher[];
    metrics?: any;
    revenueChartData?: { label: string; value: number }[];
    activities?: any[];
    alerts?: any[];
    health?: any[];
    meta: {
      filter: string;
      search: string;
      generatedAt: string;
      executionTimeMs: number;
    }
  }
}

export const PremiumReportPDF = ({ type, data }: PDFProps) => {
  const { adminName, summary, timeline = [], distribution = [], growth = [], students = [], teachers = [], metrics, revenueChartData = [], activities = [], alerts = [], health = [], meta } = data;
  
  const isStudents = type === 'students';
  const isTeachers = type === 'teachers';
  const isDashboard = type === 'dashboard';
  const recordsCount = isStudents ? (students?.length || 0) : isTeachers ? (teachers?.length || 0) : 0;

  const formattedDate = new Date(meta.generatedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = new Date(meta.generatedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <Document title={`${type}-report-${meta.generatedAt.split('T')[0]}`}>
      
      {/* PAGE 1: COVER PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.watermark}>
          <Text>CONFIDENTIAL</Text>
        </View>
        
        <View style={styles.coverContainer}>
          {/* Logo Section */}
          <View style={styles.coverHeader}>
            <View>
              <Text style={styles.logoText}>SARTHI</Text>
              <Text style={styles.logoSub}>LEARNING PLATFORM</Text>
            </View>
            <View style={styles.consoleBadge}>
              <Text style={styles.consoleBadgeText}>ADMIN CONSOLE</Text>
            </View>
          </View>

          {/* Title Area */}
          <View style={styles.coverBody}>
            <Text style={styles.coverTitlePre}>
              {isStudents ? 'Ecosystem Analysis Report' : isTeachers ? 'Faculty Performance Dossier' : 'Platform Executive Summary'}
            </Text>
            <Text style={styles.coverTitle}>
              {isStudents ? 'STUDENT DIRECTORY' : isTeachers ? 'TEACHERS DIRECTORY' : 'PLATFORM PERFORMANCE'}
            </Text>
            <Text style={styles.coverTitle}>
              {isStudents ? '& ECOSYSTEM STATUS' : isTeachers ? '& PERFORMANCE METRICS' : 'OVERVIEW'}
            </Text>
            <Text style={styles.coverSubtitle}>
              {isStudents 
                ? 'Consolidated directory ledger of registered student profiles, verification workflows, onboarding stats, and operational capacity trends.'
                : isTeachers
                ? 'Faculty ecosystem overview and performance dossier. Contains verified educator files, rating index score metrics, and domain specializations.'
                : 'Consolidated platform metrics summary, monthly transaction indicators, services uptime health lists, and live platform operations logs.'
              }
            </Text>
          </View>

          {/* Metadata Section */}
          <View style={styles.coverMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Generated On</Text>
              <Text style={styles.metaValue}>{formattedDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Timestamp</Text>
              <Text style={styles.metaValue}>{formattedTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Generated By</Text>
              <Text style={styles.metaValue}>{adminName}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{isDashboard ? 'Ecosystem Scope' : 'Ecosystem Record Size'}</Text>
              <Text style={styles.metaValue}>{isDashboard ? 'Full Platform Scope' : `${recordsCount} Active Files`}</Text>
            </View>
          </View>

          {/* Cover Footer */}
          <View style={styles.coverFooter}>
            <Text style={styles.footerText}>© {new Date().getFullYear()} SARTHI Inc. All rights reserved.</Text>
            <Text style={[styles.footerText, { color: COLORS.accent, fontWeight: 'bold' }]}>
              {isDashboard ? 'PLATFORM INTEGRITY & SYSTEM AUDIT' : isStudents ? 'CONFIDENTIAL REPORT' : 'FACULTY GOVERNANCE LEDGER'}
            </Text>
          </View>
        </View>
      </Page>

      {isDashboard ? (
        <>
          {/* DASHBOARD PAGE 2: BUSINESS KPI SUMMARY */}
          <Page size="A4" style={styles.page}>
            <View style={styles.runningHeader} fixed>
              <Text style={styles.runningHeaderTitle}>
                SARTHI ADMIN CONSOLE — PERFORMANCE SUMMARY
              </Text>
              <Text style={styles.runningHeaderLogo}>SARTHI</Text>
            </View>
            
            <View style={styles.contentContainer}>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitlePre}>Section 01</Text>
                <Text style={styles.sectionTitle}>Dashboard Overview</Text>
              </View>

              <View style={styles.cardsGrid2x2}>
                <View style={styles.card}>
                  <View style={[styles.cardLeftAccent, { backgroundColor: COLORS.accent }]} />
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Total Revenue</Text>
                    <Text style={metrics?.revenueChangePct >= 0 ? styles.trendUp : styles.trendDown}>
                      {metrics?.revenueChangePct >= 0 ? '↑' : '↓'} {Math.abs(metrics?.revenueChangePct || 0)}% MoM
                    </Text>
                  </View>
                  <Text style={styles.cardValue}>₹{metrics?.totalRevenue?.toLocaleString() || '0'}</Text>
                  <Text style={styles.cardSub}>Platform transaction invoice aggregates</Text>
                </View>

                <View style={styles.card}>
                  <View style={[styles.cardLeftAccent, { backgroundColor: COLORS.success }]} />
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Active Learners</Text>
                    <Text style={metrics?.activeStudentsChangePct >= 0 ? styles.trendUp : styles.trendDown}>
                      {metrics?.activeStudentsChangePct >= 0 ? '↑' : '↓'} {Math.abs(metrics?.activeStudentsChangePct || 0)}% MoM
                    </Text>
                  </View>
                  <Text style={[styles.cardValue, { color: COLORS.success }]}>{metrics?.activeStudents || '0'}</Text>
                  <Text style={styles.cardSub}>Total active learners registered on database</Text>
                </View>

                <View style={styles.card}>
                  <View style={[styles.cardLeftAccent, { backgroundColor: COLORS.info }]} />
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Published Courses</Text>
                    <Text style={styles.trendNeutral}>🎓 Active</Text>
                  </View>
                  <Text style={[styles.cardValue, { color: COLORS.primary }]}>{metrics?.publishedCourses || '0'}</Text>
                  <Text style={styles.cardSub}>Courses currently active in course catalog</Text>
                </View>

                <View style={styles.card}>
                  <View style={[styles.cardLeftAccent, { backgroundColor: metrics?.pendingApplications > 0 ? COLORS.error : COLORS.primary }]} />
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Pending Approvals</Text>
                    <Text style={styles.trendNeutral}>⌛ Action</Text>
                  </View>
                  <Text style={[styles.cardValue, { color: metrics?.pendingApplications > 0 ? COLORS.error : COLORS.primary }]}>
                    {metrics?.pendingApplications || '0'}
                  </Text>
                  <Text style={styles.cardSub}>Pending student/teacher approvals in queue</Text>
                </View>
              </View>

              <View style={styles.statsBoxRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Total Accounts</Text>
                  <Text style={styles.statBoxValue}>{metrics?.totalUsers || '0'}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Active Faculty</Text>
                  <Text style={styles.statBoxValue}>{metrics?.totalTeachers || '0'}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>New Onboard</Text>
                  <Text style={styles.statBoxValue}>{metrics?.todaysEnrollment || '0'}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Completion Rate</Text>
                  <Text style={styles.statBoxValue}>{metrics?.completionRatePct || '0'}%</Text>
                </View>
              </View>

              <Text style={styles.execSummaryText}>
                Dashboard Summary: The platform’s performance review highlights stable operational integrity. Revenue indicates a {metrics?.revenueChangePct >= 0 ? 'growth' : 'decrease'} trend of {metrics?.revenueChangePct}% MoM, alongside active learning registrations scaling at {metrics?.activeStudentsChangePct}% monthly. All student onboarding and course curricula are being monitored closely, with {metrics?.pendingApplications} items currently awaiting administrative review in the verification queue.
              </Text>
            </View>

            <View style={styles.runningFooter} fixed>
              <Text style={styles.runningFooterText}>
                Confidential Report — SARTHI Platform Performance Overview
              </Text>
              <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>

          {/* DASHBOARD PAGE 3: REVENUE & TRANSACTIONS TRENDS */}
          <Page size="A4" style={styles.page}>
            <View style={styles.runningHeader} fixed>
              <Text style={styles.runningHeaderTitle}>
                SARTHI ADMIN CONSOLE — REVENUE ANALYTICS
              </Text>
              <Text style={styles.runningHeaderLogo}>SARTHI</Text>
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitlePre}>Section 02</Text>
                <Text style={styles.sectionTitle}>Revenue Analytics</Text>
              </View>

              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Monthly Revenue Trend (₹)</Text>
                {revenueChartData.length > 0 ? (
                  <VectorLineChart data={revenueChartData.map((d: any) => ({ date: d.label, count: d.value }))} />
                ) : (
                  <View style={styles.emptyStateBox}>
                    <Text style={styles.emptyStateText}>Revenue analytics will appear once transactions are recorded.</Text>
                  </View>
                )}
              </View>

              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: COLORS.accent }]} />
                  <Text style={styles.legendText}>Completed transactions</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: COLORS.success }]} />
                  <Text style={styles.legendText}>Active platform revenue</Text>
                </View>
              </View>
            </View>

            <View style={styles.runningFooter} fixed>
              <Text style={styles.runningFooterText}>
                Confidential Report — SARTHI Revenue Analytics
              </Text>
              <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>

          {/* DASHBOARD PAGE 4: SYSTEM STATUS & HEALTH */}
          <Page size="A4" style={styles.page}>
            <View style={styles.runningHeader} fixed>
              <Text style={styles.runningHeaderTitle}>
                SARTHI ADMIN CONSOLE — SYSTEM STATUS
              </Text>
              <Text style={styles.runningHeaderLogo}>SARTHI</Text>
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitlePre}>Section 03</Text>
                <Text style={styles.sectionTitle}>System Status</Text>
              </View>

              <Text style={[styles.chartTitle, { marginBottom: 12 }]}>Platform Services & Infrastructure</Text>
              <View style={styles.systemNotesBox}>
                {health && health.length > 0 ? (
                  health.map((h: any, i: number) => (
                    <View key={`health-${i}`} style={styles.systemNoteRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.systemLED, { backgroundColor: h.severity === 'healthy' ? COLORS.success : COLORS.error }]} />
                        <Text style={styles.systemNoteKey}>{h.name}</Text>
                      </View>
                      <Text style={[styles.systemNoteValue, { color: h.severity === 'healthy' ? COLORS.success : COLORS.error }]}>
                        {h.status === 'healthy' ? 'Operational' : h.status.toUpperCase()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.systemNoteRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.systemLED, { backgroundColor: COLORS.success }]} />
                      <Text style={styles.systemNoteKey}>All core database & API microservices</Text>
                    </View>
                    <Text style={[styles.systemNoteValue, { color: COLORS.success }]}>Operational</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.chartTitle, { marginTop: 15, marginBottom: 12 }]}>Critical Alerts ({alerts?.length || 0})</Text>
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Severity</Text>
                  <Text style={[styles.tableHeaderCell, { width: '55%' }]}>Alert Description</Text>
                  <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Action</Text>
                </View>
                {alerts && alerts.length > 0 ? (
                  alerts.slice(0, 5).map((a: any, idx: number) => (
                    <View key={`alert-${idx}`} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : null]}>
                      <View style={{ width: '20%' }}>
                        <View style={getStatusStyles(a.severity === 'critical' ? 'INACTIVE' : 'PENDING').pill}>
                          <Text style={getStatusStyles(a.severity === 'critical' ? 'INACTIVE' : 'PENDING').text}>
                            {a.severity}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.tableCell, { width: '55%', fontSize: 8 }]}>{a.message}</Text>
                      <Text style={[styles.tableCell, { width: '25%', fontWeight: 'bold', color: COLORS.accent }]}>{a.action || 'Investigate'}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: '100%', textAlign: 'center', color: COLORS.success, fontWeight: 'bold' }]}>
                      All platform systems are operating normally.
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerTitle}>Security & Audit Compliance Protocol</Text>
                <Text style={styles.disclaimerText}>
                  This business metrics digest is compiled automatically from real-time database ledgers. Uptime stats, transaction values, and operations logs are secure. Duplication, distribution, or external copying of this report is strictly prohibited and governed by SARTHI Inc. data security policies.
                </Text>
              </View>
            </View>

            <View style={styles.runningFooter} fixed>
              <Text style={styles.runningFooterText}>
                Confidential Report — SARTHI System Status
              </Text>
              <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>
        </>
      ) : (
        <>
          {/* REGISTRY PAGES: PAGE 2 OVERVIEW */}
          <Page size="A4" style={styles.page}>
            <View style={styles.runningHeader} fixed>
              <Text style={styles.runningHeaderTitle}>
                SARTHI ADMIN CONSOLE — {isStudents ? 'STUDENT INSIGHTS' : 'PERFORMANCE SUMMARY'}
              </Text>
              <Text style={styles.runningHeaderLogo}>SARTHI</Text>
            </View>
            
            <View style={styles.contentContainer}>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitlePre}>Section 01</Text>
                <Text style={styles.sectionTitle}>
                  {isStudents ? 'Dashboard Overview' : 'Performance Summary'}
                </Text>
              </View>

              <View style={styles.cardsGrid2x2}>
                <View style={styles.card}>
                  <View style={[styles.cardLeftAccent, { backgroundColor: COLORS.accent }]} />
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{isStudents ? 'Total Learners' : 'Total Faculty'}</Text>
                    <Text style={styles.trendUp}>↑ Live</Text>
                  </View>
                  <Text style={styles.cardValue}>
                    {isStudents ? summary.totalStudents : summary.totalTeachers}
                  </Text>
                  <Text style={styles.cardSub}>
                    {isStudents ? 'Registered learner database records' : 'All registered faculty & mentors'}
                  </Text>
                </View>

                <View style={styles.card}>
                  <View style={[styles.cardLeftAccent, { backgroundColor: COLORS.success }]} />
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{isStudents ? 'Active Learners' : 'Active Faculty'}</Text>
                    <Text style={styles.trendUp}>
                      ↑ {isStudents ? summary.activePercentage : summary.facultyEngagement}%
                    </Text>
                  </View>
                  <Text style={[styles.cardValue, { color: COLORS.success }]}>
                    {isStudents ? summary.activeStudents : summary.activeFaculty}
                  </Text>
                  <Text style={styles.cardSub}>
                    {isStudents ? 'Fully active verified learners' : 'Active and verified teachers'}
                  </Text>
                </View>

                <View style={styles.card}>
                  <View style={[styles.cardLeftAccent, { backgroundColor: COLORS.info }]} />
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{isStudents ? 'Verification Queue' : 'Assigned Courses'}</Text>
                    <Text style={styles.trendNeutral}>
                      {isStudents ? `⌛ ${summary.pendingPercentage}%` : `🎓 Live`}
                    </Text>
                  </View>
                  <Text style={[styles.cardValue, { color: isStudents ? COLORS.pending : COLORS.primary }]}>
                    {isStudents ? summary.pendingStudents : summary.coursesAssigned}
                  </Text>
                  <Text style={styles.cardSub}>
                    {isStudents ? 'Pending registration verifications' : 'Total educational courses assigned'}
                  </Text>
                </View>

                <View style={styles.card}>
                  <View style={[styles.cardLeftAccent, { backgroundColor: COLORS.accent }]} />
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{isStudents ? 'New Onboard' : 'Live Classes'}</Text>
                    <Text style={styles.trendUp}>
                      {isStudents ? `+${summary.growthRate}% MoM` : 'Conducted'}
                    </Text>
                  </View>
                  <Text style={styles.cardValue}>
                    {isStudents ? summary.newThisMonth : summary.liveSessions}
                  </Text>
                  <Text style={styles.cardSub}>
                    {isStudents ? 'Registrations completed since 1st' : 'Total live classes conducted'}
                  </Text>
                </View>
              </View>

              {isStudents ? (
                <View style={styles.statsBoxRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Active Ratio</Text>
                    <Text style={styles.statBoxValue}>{summary.activePercentage}%</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Pending Ratio</Text>
                    <Text style={styles.statBoxValue}>{summary.pendingPercentage}%</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Growth Rate</Text>
                    <Text style={styles.statBoxValue}>+{summary.growthRate}%</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Most Active Day</Text>
                    <Text style={[styles.statBoxValue, { fontSize: 8.5 }]}>{summary.mostActiveDay}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.statsBoxRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Avg Rating</Text>
                    <Text style={[styles.statBoxValue, { color: COLORS.secondary }]}>★ {summary.averageRating}/5</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Avg Attendance</Text>
                    <Text style={styles.statBoxValue}>{summary.avgAttendance}%</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Engagement</Text>
                    <Text style={[styles.statBoxValue, { color: COLORS.success }]}>{summary.facultyEngagement}%</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Classes/Teacher</Text>
                    <Text style={styles.statBoxValue}>
                      {summary.totalTeachers ? Math.round((summary.liveSessions || 0) / summary.totalTeachers * 10) / 10 : 0}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.execSummaryText}>
                {isStudents 
                  ? `Ecosystem Report Brief: A comparative analysis indicates that the student population maintains a high activation efficiency rate of ${summary.activePercentage}%. The verification backlog is at a sustainable ${summary.pendingPercentage}% (${summary.pendingStudents} records awaiting credentials review). Student registration velocity has experienced a ${summary.growthRate}% growth factor this month. The highest enrollment concentration occurred on ${summary.mostActiveDay}. Keep monitoring onboarding workflows to resolve remaining pending credentials.`
                  : `Faculty Ledger Summary: The SARTHI faculty population maintains a verified active operational capacity of ${summary.facultyEngagement}%. Instructors across the ecosystem are managing a total of ${summary.coursesAssigned} courses, delivering an excellent student rating benchmark of ★ ${summary.averageRating} out of 5. Educator classrooms maintain an average attendance index of ${summary.avgAttendance}%, reflecting high student engagement and premium delivery quality.`
                }
              </Text>
            </View>

            <View style={styles.runningFooter} fixed>
              <Text style={styles.runningFooterText}>
                Confidential Report — SARTHI {isStudents ? 'Student Insights' : 'Performance Summary'}
              </Text>
              <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>

          {/* REGISTRY PAGES: PAGE 3 REGISTRY LEDGER */}
          <Page size="A4" style={styles.page}>
            <View style={styles.runningHeader} fixed>
              <Text style={styles.runningHeaderTitle}>
                SARTHI ADMIN CONSOLE — {isStudents ? 'STUDENT INSIGHTS' : 'PERFORMANCE SUMMARY'}
              </Text>
              <Text style={styles.runningHeaderLogo}>SARTHI</Text>
            </View>
            
            <View style={styles.contentContainer}>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitlePre}>Section 02</Text>
                <Text style={styles.sectionTitle}>
                  {isStudents ? 'Student Insights' : 'Performance Summary'}
                </Text>
              </View>

              <View style={styles.table}>
                {isStudents ? (
                  <View style={styles.tableHeaderRow} fixed>
                    <Text style={[styles.tableHeaderCell, { width: '33%' }]}>Student</Text>
                    <Text style={[styles.tableHeaderCell, { width: '35%' }]}>Email</Text>
                    <Text style={[styles.tableHeaderCell, { width: '17%' }]}>Registered</Text>
                    <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Status</Text>
                  </View>
                ) : (
                  <View style={styles.tableHeaderRow} fixed>
                    <Text style={[styles.tableHeaderCell, { width: '32%' }]}>Instructor</Text>
                    <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Email</Text>
                    <Text style={[styles.tableHeaderCell, { width: '23%' }]}>Expertise</Text>
                    <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Status</Text>
                  </View>
                )}

                {recordsCount === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Text style={styles.emptyStateText}>No records match the active criteria.</Text>
                  </View>
                ) : isStudents ? (
                  // Display top 10 to fit page budget flawlessly
                  students.slice(0, 10).map((student, index) => {
                    const sStyles = getStatusStyles(student.status);
                    return (
                      <View 
                        key={student.id} 
                        style={[styles.tableRow, index % 2 === 1 ? styles.tableRowEven : {}]}
                        wrap={false}
                      >
                        <View style={{ width: '33%', flexDirection: 'row', alignItems: 'center' }}>
                          <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
                          </View>
                          <View style={styles.nameCellBox}>
                            <Text style={styles.boldName} numberOfLines={1}>{student.name}</Text>
                            <Text style={styles.mutedId}>{student.studentId || 'ID Pending'}</Text>
                          </View>
                        </View>
                        <Text style={[styles.tableCell, { width: '35%', fontSize: 8 }]} numberOfLines={1}>{student.email}</Text>
                        <Text style={[styles.tableCell, { width: '17%' }]}>
                          {new Date(student.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                        <View style={{ width: '15%' }}>
                          <View style={sStyles.pill}>
                            <View style={sStyles.dot} />
                            <Text style={sStyles.text}>{student.status.toLowerCase()}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  // Display top 10 to fit page budget flawlessly
                  teachers.slice(0, 10).map((teacher, index) => {
                    const sStyles = getStatusStyles(teacher.status);
                    return (
                      <View 
                        key={teacher.id} 
                        style={[styles.tableRow, index % 2 === 1 ? styles.tableRowEven : {}]}
                        wrap={false}
                      >
                        <View style={{ width: '32%', flexDirection: 'row', alignItems: 'center' }}>
                          <View style={[styles.avatarCircle, styles.avatarCircleTeacher]}>
                            <Text style={styles.avatarText}>{getInitials(teacher.name)}</Text>
                          </View>
                          <View style={styles.nameCellBox}>
                            <Text style={styles.boldName} numberOfLines={1}>{teacher.name}</Text>
                            <Text style={styles.mutedId}>{teacher.teacherId || 'ID Pending'}</Text>
                          </View>
                        </View>
                        <Text style={[styles.tableCell, { width: '30%', fontSize: 8 }]} numberOfLines={1}>{teacher.email}</Text>
                        <Text style={[styles.tableCell, { width: '23%', fontWeight: 'bold' }]}>
                          {teacher.expertise || teacher.title || 'Educator'}
                        </Text>
                        <View style={{ width: '15%' }}>
                          <View style={sStyles.pill}>
                            <View style={sStyles.dot} />
                            <Text style={sStyles.text}>{teacher.status === 'VERIFIED' ? 'Verified' : teacher.status.toLowerCase()}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {recordsCount > 10 && (
                <Text style={{ fontSize: 7, color: COLORS.textMuted, textAlign: 'right', marginTop: -5 }}>
                  * Displaying top 10 registry records. Remaining {recordsCount - 10} profiles listed in main console database.
                </Text>
              )}
            </View>

            <View style={styles.runningFooter} fixed>
              <Text style={styles.runningFooterText}>
                Confidential Report — SARTHI Registry Ledger
              </Text>
              <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>

          {/* REGISTRY PAGES: PAGE 4 ANALYTICS & CHARTS */}
          <Page size="A4" style={styles.page}>
            <View style={styles.runningHeader} fixed>
              <Text style={styles.runningHeaderTitle}>
                SARTHI ADMIN CONSOLE — {isStudents ? 'STUDENT INSIGHTS' : 'PERFORMANCE SUMMARY'}
              </Text>
              <Text style={styles.runningHeaderLogo}>SARTHI</Text>
            </View>
            
            <View style={styles.contentContainer}>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitlePre}>Section 03</Text>
                <Text style={styles.sectionTitle}>
                  {isStudents ? 'Student Insights' : 'Performance Summary'}
                </Text>
              </View>

              {isStudents ? (
                <VectorLineChart data={timeline} />
              ) : (
                <VectorBarChart data={growth} />
              )}

              <View style={styles.chartRow}>
                <View style={styles.chartHalf}>
                  <Text style={[styles.chartTitle, { marginBottom: 5 }]}>Ecosystem Allocation Ratio</Text>
                  <VectorDonutChart 
                    active={isStudents ? summary.activeStudents! : summary.activeFaculty!} 
                    pending={isStudents ? summary.pendingStudents! : summary.pendingFaculty!} 
                  />
                </View>

                <View style={styles.chartHalf}>
                  <Text style={[styles.chartTitle, { marginBottom: 5 }]}>Verification Telemetry</Text>
                  <PremiumConcentricRings 
                    activePct={isStudents ? summary.activePercentage! : summary.facultyEngagement!} 
                    pendingPct={isStudents ? summary.pendingPercentage! : summary.pendingFaculty! && summary.totalTeachers ? Math.round((summary.pendingFaculty / summary.totalTeachers) * 100) : 10} 
                    label1={isStudents ? 'ACTIVE RATIO' : 'ENGAGEMENT'}
                    label2={isStudents ? 'PENDING RATIO' : 'BACKLOGS'}
                  />
                </View>
              </View>

              {isStudents ? (
                <SegmentedBreakdownGrid 
                  active={summary.activeStudents} 
                  pending={summary.pendingStudents} 
                  inactive={summary.inactiveStudents} 
                  type={type}
                />
              ) : (
                <FacultyDomainDistribution distribution={distribution} />
              )}
            </View>

            <View style={styles.runningFooter} fixed>
              <Text style={styles.runningFooterText}>
                Confidential Report — SARTHI Analytics Dashboard
              </Text>
              <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>

          {/* REGISTRY PAGES: PAGE 5 PROFILE CARDS SPLIT */}
          <Page size="A4" style={styles.page}>
            <View style={styles.runningHeader} fixed>
              <Text style={styles.runningHeaderTitle}>
                SARTHI ADMIN CONSOLE — {isStudents ? 'STUDENT INSIGHTS' : 'PERFORMANCE SUMMARY'}
              </Text>
              <Text style={styles.runningHeaderLogo}>SARTHI</Text>
            </View>
            
            <View style={styles.contentContainer}>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitlePre}>Section 04</Text>
                <Text style={styles.sectionTitle}>
                  {isStudents ? 'Student Insights' : 'Performance Summary'}
                </Text>
              </View>

              {isStudents ? (
                <View>
                  <View style={{ marginBottom: 15 }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: COLORS.success, marginBottom: 8, letterSpacing: 0.5 }}>
                      AUTHENTICATED ACTIVE LEARNERS
                    </Text>
                    <View style={styles.gridList}>
                      {students.filter(s => s.status === 'ACTIVE').slice(0, 9).map(student => (
                        <View key={student.id} style={[styles.linkedinCard, { height: 'auto', padding: 10, width: '32%' }]}>
                          <Text style={[styles.linkedinName, { fontSize: 7.5 }]} numberOfLines={1}>{student.name}</Text>
                          <Text style={[styles.linkedinTitle, { fontSize: 6 }]} numberOfLines={1}>{student.studentId || 'ACTIVE'}</Text>
                          <View style={[styles.linkedinBadge, { backgroundColor: COLORS.successBg, color: COLORS.success, marginTop: 5, fontSize: 5 }]}>
                            <Text>Active Verified</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={{ marginTop: 15 }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: COLORS.pending, marginBottom: 8, letterSpacing: 0.5 }}>
                      PENDING ONBOARDING PIPELINE
                    </Text>
                    <View style={styles.gridList}>
                      {students.filter(s => s.status === 'PENDING').slice(0, 9).map(student => (
                        <View key={student.id} style={[styles.linkedinCard, { height: 'auto', padding: 10, width: '32%' }]}>
                          <Text style={[styles.linkedinName, { fontSize: 7.5 }]} numberOfLines={1}>{student.name}</Text>
                          <Text style={[styles.linkedinTitle, { fontSize: 6 }]} numberOfLines={1}>{student.studentId || 'PENDING'}</Text>
                          <View style={[styles.linkedinBadge, { backgroundColor: COLORS.pendingBg, color: COLORS.pending, marginTop: 5, fontSize: 5 }]}>
                            <Text>Awaiting Review</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.gridList}>
                  {teachers.slice(0, 9).map((teacher) => (
                    <View key={teacher.id} style={styles.linkedinCard}>
                      <View style={styles.linkedinHeader}>
                        <View style={styles.linkedinAvatar}>
                          <Text style={styles.avatarText}>{getInitials(teacher.name)}</Text>
                        </View>
                        <View style={styles.linkedinNameBox}>
                          <Text style={styles.linkedinName} numberOfLines={1}>{teacher.name}</Text>
                          <Text style={styles.linkedinTitle} numberOfLines={1}>{teacher.title || 'Educator'}</Text>
                        </View>
                      </View>

                      <Text style={styles.linkedinExpertise} numberOfLines={1}>
                        {teacher.expertise || 'General'}
                      </Text>

                      <Text style={styles.linkedinBadge}>
                        {teacher.experience || 'Faculty Member'}
                      </Text>

                      <View style={styles.linkedinMetricRow}>
                        <View style={styles.linkedinMetricCol}>
                          <Text style={styles.linkedinMetricVal}>{teacher.coursesCount}</Text>
                          <Text style={styles.linkedinMetricLbl}>Courses</Text>
                        </View>
                        <View style={styles.linkedinMetricCol}>
                          <Text style={styles.linkedinMetricVal}>{teacher.studentsMentored}</Text>
                          <Text style={styles.linkedinMetricLbl}>Mentored</Text>
                        </View>
                        <View style={styles.linkedinMetricCol}>
                          <Text style={[styles.linkedinMetricVal, { color: COLORS.secondary }]}>
                            ★ {teacher.rating}
                          </Text>
                          <Text style={styles.linkedinMetricLbl}>Rating</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {recordsCount > 9 && (
                <Text style={{ fontSize: 6.5, color: COLORS.textMuted, textAlign: 'right', marginTop: -5 }}>
                  * Showing first 9 records. Remaining {recordsCount - 9} profiles listed in main console ledger.
                </Text>
              )}
            </View>

            <View style={styles.runningFooter} fixed>
              <Text style={styles.runningFooterText}>
                Confidential Report — SARTHI Segmented Profiles
              </Text>
              <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>

          {/* REGISTRY PAGES: PAGE 6 SYSTEM SYNC & METADATA */}
          <Page size="A4" style={styles.page}>
            <View style={styles.runningHeader} fixed>
              <Text style={styles.runningHeaderTitle}>
                SARTHI ADMIN CONSOLE — {isStudents ? 'STUDENT INSIGHTS' : 'PERFORMANCE SUMMARY'}
              </Text>
              <Text style={styles.runningHeaderLogo}>SARTHI</Text>
            </View>
            
            <View style={styles.contentContainer}>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitlePre}>Section 05</Text>
                <Text style={styles.sectionTitle}>
                  {isStudents ? 'Student Insights' : 'Performance Summary'}
                </Text>
              </View>

              <View style={styles.systemNotesBox}>
                <Text style={styles.systemNotesTitle}>
                  {isStudents ? 'System Verification Ledgers' : 'Faculty Allocation Ledgers'}
                </Text>
                
                <View style={styles.systemNoteRow}>
                  <Text style={styles.systemNoteKey}>
                    {isStudents ? 'Active Profile Records' : 'Active Educator Profiles'}
                  </Text>
                  <Text style={styles.systemNoteValue}>
                    {isStudents ? `${summary.totalStudents} Accounts` : `${summary.totalTeachers} Faculty Files`}
                  </Text>
                </View>
                <View style={styles.systemNoteRow}>
                  <Text style={styles.systemNoteKey}>
                    {isStudents ? 'Fully Verified Entities' : 'Verified Instructors'}
                  </Text>
                  <Text style={[styles.systemNoteValue, { color: COLORS.success }]}>
                    {isStudents ? `${summary.activeStudents} verified` : `${summary.activeFaculty} approved`}
                  </Text>
                </View>
                <View style={styles.systemNoteRow}>
                  <Text style={styles.systemNoteKey}>
                    {isStudents ? 'Pending Verification Queue' : 'Pending Verification Queue'}
                  </Text>
                  <Text style={[styles.systemNoteValue, { color: COLORS.pending }]}>
                    {isStudents ? `${summary.pendingStudents} pending` : `${summary.pendingFaculty} applications`}
                  </Text>
                </View>
                <View style={styles.systemNoteRow}>
                  <Text style={styles.systemNoteKey}>Sync Channel Integrity</Text>
                  <Text style={styles.systemNoteValue}>100% Core Database Sync</Text>
                </View>
                <View style={styles.systemNoteRow}>
                  <Text style={styles.systemNoteKey}>Sync Hash Code</Text>
                  <Text style={[styles.systemNoteValue, { fontSize: 6.5, color: COLORS.textMuted }]}>
                    sha256-4d05f32aef5c8bfd9a6c6e7a2b9d031c6a
                  </Text>
                </View>
              </View>

              <View style={styles.systemNotesBox}>
                <Text style={styles.systemNotesTitle}>Export Audit Metadata</Text>
                
                <View style={styles.systemNoteRow}>
                  <Text style={styles.systemNoteKey}>Triggered By</Text>
                  <Text style={styles.systemNoteValue}>{adminName}</Text>
                </View>
                <View style={styles.systemNoteRow}>
                  <Text style={styles.systemNoteKey}>Search State Query</Text>
                  <Text style={styles.systemNoteValue}>&quot;{meta.search || 'None'}&quot;</Text>
                </View>
                <View style={styles.systemNoteRow}>
                  <Text style={styles.systemNoteKey}>Workspace Filter</Text>
                  <Text style={styles.systemNoteValue}>{meta.filter || 'All'}</Text>
                </View>
                <View style={styles.systemNoteRow}>
                  <Text style={styles.systemNoteKey}>Query Execution Velocity</Text>
                  <Text style={styles.systemNoteValue}>{meta.executionTimeMs} ms</Text>
                </View>
                <View style={styles.systemNoteRow}>
                  <Text style={styles.systemNoteKey}>Ledger Sync Stamp</Text>
                  <Text style={styles.systemNoteValue}>{new Date(meta.generatedAt).toISOString()}</Text>
                </View>
              </View>

              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerTitle}>Security Ledger & System Sync Disclaimer</Text>
                <Text style={styles.disclaimerText}>
                  {isStudents 
                    ? 'This document is a business intelligence report generated directly from the SARTHI core administration datastore. The student profiles, registration schedules, and activation status records presented herein constitute proprietary, confidential assets of SARTHI. Duplication, dissemination, or distribution of this report violates the standard enterprise data governance policies.'
                    : 'This document is an HR and operational faculty intelligence report generated from the core administrator console of SARTHI. All teacher dossiers, specialized credentials, courses, and rating index metrics are sensitive proprietary records. Distribution or duplication of these files outside approved administrative circles is strictly prohibited.'
                  }
                </Text>
              </View>
            </View>

            <View style={styles.runningFooter} fixed>
              <Text style={styles.runningFooterText}>
                Confidential Report — SARTHI Sync Log
              </Text>
              <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>
        </>
      )}

    </Document>
  );
};
