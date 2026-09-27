import { jsPDF } from 'jspdf';

export interface CityHubMetric {
  name: string;
  lat: number;
  lng: number;
  calls: string;
  status: string;
  avgLatencyMs: number;
  resolutionRate: string;
}

export interface CallCenterMetricsData {
  concurrentStreams: number;
  resolutionRate: string;
  avgLatency: string;
  monthlySavings: string;
  csat: string;
  reportDate: string;
  hubs: CityHubMetric[];
  intents: Array<{ name: string; percentage: number; volume: string }>;
}

/**
 * Exports current real-time call center metrics as a RFC-4180 formatted CSV file
 */
export function exportMetricsAsCSV(data: CallCenterMetricsData): void {
  const lines: string[] = [];

  // Title & Metadata
  lines.push(`"VOICEFLOW GEMINI 3.8 AI - REAL-TIME CALL CENTER TELEMETRY REPORT"`);
  lines.push(`"Generated At","${data.reportDate}"`);
  lines.push(`"Engine Status","Active Distributed Edge Telephony (sub-240ms)"`);
  lines.push(``);

  // Section 1: Executive KPI Overview
  lines.push(`"=== EXECUTIVE KPI OVERVIEW ==="`);
  lines.push(`"Metric Name","Current Value","Target / Benchmark"`);
  lines.push(`"Concurrent Live Streams","${data.concurrentStreams.toLocaleString()}","10,000+ Scalable Peak"`);
  lines.push(`"Global Self-Service Resolution","${data.resolutionRate}","Benchmark: >90%"`);
  lines.push(`"Average Turn Latency","${data.avgLatency}","SLA: <1.5s (sub-240ms edge)"`);
  lines.push(`"Estimated Monthly Cost Savings","${data.monthlySavings}","Target: $4.0M+"`);
  lines.push(`"First Contact CSAT","${data.csat}","Benchmark: 4.80 / 5.0"`);
  lines.push(``);

  // Section 2: Global Telephony Hubs Breakdown
  lines.push(`"=== GLOBAL TELEPHONY EDGE HUBS (PoPs) ==="`);
  lines.push(`"City Hub","Latitude","Longitude","Inbound Volume (/hr)","Resolution Rate","Edge Latency (ms)","Network Status"`);
  data.hubs.forEach(hub => {
    lines.push(
      `"${hub.name}","${hub.lat}","${hub.lng}","${hub.calls}","${hub.resolutionRate}","${hub.avgLatencyMs}ms","${hub.status}"`
    );
  });
  lines.push(``);

  // Section 3: Inbound Call Intents
  lines.push(`"=== TOP INBOUND CALL INTENTS & DISTRIBUTION ==="`);
  lines.push(`"Intent Category","Traffic Share (%)","Estimated Hourly Calls"`);
  data.intents.forEach(intent => {
    lines.push(`"${intent.name}","${intent.percentage}%","${intent.volume}"`);
  });
  lines.push(``);

  // Compliance statement
  lines.push(`"=== COMPLIANCE & GOVERNANCE ==="`);
  lines.push(`"Security","SOC2 Type II / HIPAA BAA / PCI-DSS Level 1 / ISO 27001 Certified"`);

  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const filename = `voiceflow-call-center-metrics-${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports current real-time call center metrics as a styled executive PDF document
 */
export function exportMetricsAsPDF(data: CallCenterMetricsData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Dark Header Background Banner
  doc.setFillColor(7, 10, 30); // #070A1E
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Line
  doc.setFillColor(0, 212, 255); // #00D4FF
  doc.rect(0, 42, pageWidth, 1.5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('VOICEFLOW AI - GLOBAL CALL CENTER TELEMETRY', 14, 16);

  // Subtitle & Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 212, 255);
  doc.text('REAL-TIME DISTRIBUTED EDGE METRICS REPORT', 14, 23);

  doc.setTextColor(200, 210, 230);
  doc.setFontSize(8);
  doc.text(`Generated: ${data.reportDate} | Report ID: VF-OPS-${Date.now().toString().slice(-6)}`, 14, 30);
  doc.text('Model Engine: Gemini 3.8 NLU with Streaming Audio Biometrics', 14, 36);

  let y = 52;

  // Section 1: Executive KPI Cards
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 30, 70);
  doc.text('1. EXECUTIVE KPI SUMMARY', 14, y);
  y += 6;

  const kpis = [
    { label: 'Concurrent Streams', value: data.concurrentStreams.toLocaleString(), sub: '+12% peak headroom' },
    { label: 'Global Resolution', value: data.resolutionRate, sub: 'Zero human touch' },
    { label: 'Average Turn Latency', value: data.avgLatency, sub: 'Sub-240ms voice edge' },
    { label: 'Monthly Cost Savings', value: data.monthlySavings, sub: 'Target: $4.0M+' }
  ];

  const cardWidth = (pageWidth - 28 - 9) / 4;
  kpis.forEach((kpi, index) => {
    const x = 14 + index * (cardWidth + 3);
    doc.setFillColor(245, 248, 255);
    doc.setDrawColor(210, 225, 250);
    doc.roundedRect(x, y, cardWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 115, 140);
    doc.text(kpi.label, x + 3, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(10, 25, 60);
    doc.text(kpi.value, x + 3, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 150, 190);
    doc.text(kpi.sub, x + 3, y + 19);
  });

  y += 30;

  // Section 2: Global Telephony Hubs Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 30, 70);
  doc.text('2. DISTRIBUTED EDGE TELEPHONY HUBS (8 GLOBAL PoPs)', 14, y);
  y += 6;

  // Table Header
  const colX = [14, 60, 95, 130, 160];
  doc.setFillColor(15, 25, 65);
  doc.rect(14, y, pageWidth - 28, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Hub Location', colX[0] + 2, y + 4.8);
  doc.text('Call Volume (/hr)', colX[1], y + 4.8);
  doc.text('Resolution %', colX[2], y + 4.8);
  doc.text('Edge Latency', colX[3], y + 4.8);
  doc.text('Network Health', colX[4], y + 4.8);

  y += 7;

  // Table Rows
  data.hubs.forEach((hub, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 246, isEven ? 255 : 249, isEven ? 255 : 253);
    doc.rect(14, y, pageWidth - 28, 6.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 50, 75);
    doc.text(hub.name, colX[0] + 2, y + 4.5);
    doc.text(hub.calls, colX[1], y + 4.5);
    doc.text(hub.resolutionRate, colX[2], y + 4.5);
    doc.text(`${hub.avgLatencyMs} ms`, colX[3], y + 4.5);

    doc.setTextColor(16, 149, 100);
    doc.setFont('helvetica', 'bold');
    doc.text(hub.status, colX[4], y + 4.5);

    y += 6.5;
  });

  y += 8;

  // Section 3: Call Intent Distribution
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 30, 70);
  doc.text('3. INBOUND TRAFFIC BREAKDOWN BY INTENT', 14, y);
  y += 6;

  data.intents.forEach((intent) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 60, 80);
    doc.text(intent.name, 14, y + 4);

    // Progress bar background
    doc.setFillColor(230, 235, 245);
    doc.roundedRect(80, y + 1, 80, 4, 1, 1, 'F');

    // Filled bar
    doc.setFillColor(0, 180, 220);
    doc.roundedRect(80, y + 1, (80 * intent.percentage) / 100, 4, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 25, 60);
    doc.text(`${intent.percentage}% (${intent.volume})`, 166, y + 4);

    y += 7.5;
  });

  // Footer / Compliance
  doc.setDrawColor(210, 220, 240);
  doc.line(14, 275, pageWidth - 14, 275);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(130, 140, 160);
  doc.text('Confidential - Generated for Enterprise Operations. VoiceFlow Gemini 3.8 Voice AI Platform.', 14, 281);
  doc.text('Compliance: SOC2 Type II Certified | HIPAA BAA Compliant | PCI-DSS Level 1 Gateway', 14, 286);

  const filename = `VoiceFlow-Global-Metrics-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
