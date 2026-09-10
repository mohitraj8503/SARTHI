/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
  Path,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from '@react-pdf/renderer';
import path from 'path';

/* ── Palette ─────────────────────────────────────────────────────── */
const C = {
  navy:    '#06122e',
  navyMid: '#0F2D5C',
  gold:    '#d8b773',
  goldLight:'#f5d76e',
  goldDark: '#b8860b',
  ink:     '#081a36',
  paper:   '#ffffff',
  grayText:'#64748b',
  blueLabel:'#94a3b8',
  thinRule:'#d4a017',
};

/* ── A4 Landscape dimensions in pt ────────────────────────────────── */
const W = 842;
const H = 595;

const s = StyleSheet.create({
  page: {
    width:  W,
    height: H,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: W,
    height: H,
    paddingHorizontal: 80,
    paddingTop: 45,
    paddingBottom: 40,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 5,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
  orgName: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#0f2d5c',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  bodyInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 15,
    flex: 1,
    width: '100%',
  },
  certTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 34,
    color: '#0f2d5c',
    letterSpacing: 4,
    textTransform: 'uppercase',
    lineHeight: 1,
  },
  subText: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#d4a017',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  certify: {
    fontFamily: 'Times-Italic',
    fontSize: 10,
    color: '#94a3b8',
    letterSpacing: 2,
    marginTop: 10,
  },
  nameContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  name: {
    fontFamily: 'Times-Italic',
    fontSize: 36,
    color: '#081a36',
    lineHeight: 1,
  },
  nameRuleContainer: {
    width: 240,
    alignItems: 'center',
    marginTop: 6,
  },
  rule1: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#d4a017',
  },
  rule2: {
    width: '85%',
    height: 0.8,
    backgroundColor: '#d4a017',
    opacity: 0.6,
    marginTop: 1.5,
  },
  supportText: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#475569',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 420,
    lineHeight: 1.4,
  },
  courseName: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0f2d5c',
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 20,
  },
  footerColLeft: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  footerColCenter: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  footerColRight: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  dateVal: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#0f2d5c',
    marginBottom: 4,
  },
  metaRule: {
    width: 130,
    height: 1,
    backgroundColor: '#cbd5e1',
    marginBottom: 4,
  },
  dateLabel: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 6.5,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  idVal: {
    fontFamily: 'Helvetica',
    fontSize: 6,
    color: '#555555',
    marginTop: 2,
  },
  sigContainer: {
    height: 25,
    width: 110,
    position: 'relative',
    marginBottom: 2,
  },
  sigImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  sigName: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#0f2d5c',
    marginTop: 4,
  },
  sigRole: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 6.5,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  qrContainer: {
    position: 'absolute',
    bottom: 30,
    right: 32,
    alignItems: 'center',
  },
  qrImg: {
    width: 32,
    height: 32,
    padding: 1.5,
    backgroundColor: '#ffffff',
    border: '0.5pt solid #cbd5e1',
    borderRadius: 2,
  },
  qrLabel: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 5,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 3,
  },
});

/* ── Gold Seal Component ────────────────────────────────────────── */
function GoldSeal() {
  const r = 26;
  const serratedPath = (() => {
    const cx = r, cy = r, innerRadius = 21, outerRadius = 25, points = 36;
    let path = '';
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const r_val = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + r_val * Math.cos(angle);
      const y = cy + r_val * Math.sin(angle);
      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return path + ' Z';
  })();

  return (
    <Svg width={r * 2} height={r * 2 + 10} style={{ overflow: 'visible', marginBottom: -5 }}>
      <Defs>
        <LinearGradient id="sealG" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%"   stopColor="#b8860b" />
          <Stop offset="50%"  stopColor="#f5d76e" />
          <Stop offset="100%" stopColor="#b8860b" />
        </LinearGradient>
        <LinearGradient id="sealGDk" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%"   stopColor="#8a6105" />
          <Stop offset="50%"  stopColor="#d4a017" />
          <Stop offset="100%" stopColor="#8a6105" />
        </LinearGradient>
      </Defs>
      {/* Ribbon tails */}
      <Path d="M 22,20 L 16,48 L 25,44 L 32,48 L 29,20 Z" fill="#b8860b" opacity="0.9" />
      <Path d="M 30,20 L 36,48 L 27,44 L 20,48 L 23,20 Z" fill="#8a6105" opacity="0.9" />
      
      {/* Serrated Ring */}
      <Path d={serratedPath} fill="url(#sealG)" />
      
      {/* Inner Circles */}
      <Circle cx={r} cy={r} r={19} fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
      <Circle cx={r} cy={r} r={17} fill="url(#sealGDk)" />
      <Circle cx={r} cy={r} r={15} fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.6" />
      
      {/* Mini Star */}
      <Path d="M 26,23 L 27.5,25.5 L 30.5,25.5 L 28,27.5 L 29,30.5 L 26,28.5 L 23,30.5 L 24,27.5 L 21.5,25.5 L 24.5,25.5 Z" fill="url(#sealG)" transform="scale(0.5) translate(26, 26)" />
    </Svg>
  );
}

/* ── Geometric Background SVG Component ───────────────────────────── */
function GeometricBackground() {
  return (
    <Svg viewBox="0 0 1000 707" style={{ position: 'absolute', top: 0, left: 0, width: W, height: H }}>
      <Defs>
        <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%"   stopColor="#b8860b" />
          <Stop offset="50%"  stopColor="#f5d76e" />
          <Stop offset="100%" stopColor="#b8860b" />
        </LinearGradient>
      </Defs>
      {/* Outer Border Frame */}
      <Rect x={0} y={0} width={1000} height={707} stroke="#d8b773" strokeWidth={24} fill="none" />
      
      {/* Top-Left Corner panels */}
      <Path d="M 12,12 L 360,12 L 170,202 L 12,44 Z" fill="#0F2D5C" />
      <Path d="M 360,12 L 420,72 L 170,322 L 12,164 L 12,104 L 170,262 Z" fill="url(#goldGrad)" />
      
      {/* Top-Right Corner panels */}
      <Path d="M 988,12 L 640,12 L 830,202 L 988,44 Z" fill="#0F2D5C" />
      <Path d="M 640,12 L 580,72 L 830,322 L 988,164 L 988,104 L 830,262 Z" fill="url(#goldGrad)" />
      
      {/* Bottom-Left Navy panels */}
      <Path d="M 12,340 L 160,488 L 12,636 Z" fill="#0F2D5C" />
      <Path d="M 12,488 L 360,695 L 12,695 Z" fill="#0f2d5c" opacity={0.04} />
      
      {/* Bottom-Right Navy panels */}
      <Path d="M 988,340 L 840,488 L 988,636 Z" fill="#0F2D5C" />
      <Path d="M 988,488 L 640,695 L 988,695 Z" fill="#0f2d5c" opacity={0.04} />
      
      {/* Mid chevrons */}
      <Path d="M 12,260 L 110,315 L 12,370 Z" fill="#0F2D5C" stroke="url(#goldGrad)" strokeWidth={4} strokeLinejoin="round" />
      <Path d="M 988,260 L 890,315 L 988,370 Z" fill="#0F2D5C" stroke="url(#goldGrad)" strokeWidth={4} strokeLinejoin="round" />
    </Svg>
  );
}

/* ── Props ───────────────────────────────────────────────────────── */
export interface CertPdfProps {
  studentName:    string;
  courseName:     string;
  supportingTop?: string;
  supportingBot?: string;
  issueDate:      string;
  certificateId:  string;
  signatureName?: string;
  signatureRole?: string;
  qrDataUrl:      string;
  logoPath?:      string;
}

/* ── Document Component ─────────────────────────────────────────── */
export function CertificatePdfDocument({
  studentName,
  courseName,
  supportingTop = 'Presented to',
  supportingBot = 'For successfully completing the Advanced Certification Program with distinction.',
  issueDate,
  certificateId,
  signatureName = 'Dr. Mukul Pandey',
  signatureRole = 'CEO & FOUNDER, SARTHI',
  qrDataUrl,
  logoPath,
}: CertPdfProps) {
  const logoSrc = logoPath ?? path.join(process.cwd(), 'public', 'logo-tt.png');
  const signatureSrc = path.join(process.cwd(), 'public', 'signature-mukul-pandey.png');

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>
        
        {/* Exact Geometric background paths as web view */}
        <GeometricBackground />

        {/* Content Centered on top of background */}
        <View style={s.content}>

          {/* Header */}
          <View style={s.header}>
            <Image src={logoSrc} style={s.logo} />
            <Text style={s.orgName}>SARTHI</Text>
          </View>

          {/* Main Info */}
          <View style={s.bodyInfo}>
            <Text style={s.certTitle}>Certificate</Text>
            <Text style={s.subText}>Of Achievement</Text>
            
            <Text style={s.certify}>{supportingTop}</Text>
            
            <View style={s.nameContainer}>
              <Text style={s.name}>{studentName}</Text>
              <View style={s.nameRuleContainer}>
                <View style={s.rule1} />
                <View style={s.rule2} />
              </View>
            </View>
            
            <Text style={s.supportText}>{supportingBot}</Text>
            <Text style={s.courseName}>{courseName}</Text>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            {/* Left Column: Date & ID */}
            <View style={s.footerColLeft}>
              <Text style={s.dateVal}>{issueDate}</Text>
              <View style={s.metaRule} />
              <Text style={s.dateLabel}>Date of Issue</Text>
              <Text style={s.idVal}>Certificate ID: {certificateId}</Text>
            </View>

            {/* Center Column: Seal */}
            <View style={s.footerColCenter}>
              <GoldSeal />
            </View>

            {/* Right Column: Signature */}
            <View style={s.footerColRight}>
              <View style={s.sigContainer}>
                <Image src={signatureSrc} style={s.sigImage} />
              </View>
              <View style={s.metaRule} />
              <Text style={s.sigName}>{signatureName}</Text>
              <Text style={s.sigRole}>{signatureRole}</Text>
            </View>
          </View>

        </View>

        {/* Verification QR Code in Bottom Right Corner */}
        <View style={s.qrContainer}>
          <Image src={qrDataUrl} style={s.qrImg} />
          <Text style={s.qrLabel}>Verify Certificate</Text>
        </View>

      </Page>
    </Document>
  );
}
