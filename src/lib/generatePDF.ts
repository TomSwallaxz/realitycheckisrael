import jsPDF from 'jspdf';
import { AnalysisResult, PropertyInputs, formatNIS } from './calculator';

// Load Heebo font (embedded base64 would be ideal, but for now we use the built-in helvetica with manual RTL)
// jsPDF doesn't support RTL natively, so we reverse text for display

function reverseText(text: string): string {
  // Reverse the string for RTL display in jsPDF
  // Keep numbers and symbols in correct order
  const parts: string[] = [];
  let current = '';
  let isLTR = false;

  for (const char of text) {
    const charIsLTR = /[0-9a-zA-Z₪%.,+\-\\/():]/.test(char);
    if (charIsLTR !== isLTR && current) {
      parts.push(isLTR ? current : [...current].reverse().join(''));
      current = '';
    }
    isLTR = charIsLTR;
    current += char;
  }
  if (current) {
    parts.push(isLTR ? current : [...current].reverse().join(''));
  }

  return parts.reverse().join('');
}

function rtl(text: string): string {
  return reverseText(text);
}

export function generateDealPDF(result: AnalysisResult, inputs: PropertyInputs, motivations: string[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const colorMap = {
    safe: [34, 197, 94] as [number, number, number],
    warning: [245, 158, 11] as [number, number, number],
    danger: [239, 68, 68] as [number, number, number],
  };

  const addPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkSpace = (needed: number) => {
    if (y + needed > 275) addPage();
  };

  // === HEADER ===
  const levelColor = colorMap[result.verdictLevel];
  doc.setFillColor(levelColor[0], levelColor[1], levelColor[2]);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Deal or No Deal', pageWidth / 2, y + 12, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(rtl('בדיקת כדאיות רכישת נכס'), pageWidth / 2, y + 20, { align: 'center' });

  y += 35;

  // Date
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString('he-IL');
  doc.text(dateStr, pageWidth - margin, y, { align: 'right' });
  y += 8;

  // === VERDICT ===
  doc.setFillColor(levelColor[0], levelColor[1], levelColor[2]);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(rtl(result.verdict), pageWidth / 2, y + 8, { align: 'center' });
  y += 18;

  // === Helper to draw section ===
  const drawSectionTitle = (title: string, emoji: string) => {
    checkSpace(12);
    doc.setFillColor(245, 245, 248);
    doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
    doc.setTextColor(50, 50, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${emoji}  ${rtl(title)}`, pageWidth - margin - 4, y + 6.5, { align: 'right' });
    y += 13;
  };

  const drawRow = (label: string, value: string, color?: [number, number, number]) => {
    checkSpace(7);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 110);
    doc.text(rtl(label), pageWidth - margin - 4, y, { align: 'right' });

    if (color) {
      doc.setTextColor(color[0], color[1], color[2]);
    } else {
      doc.setTextColor(30, 30, 40);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(value, margin + 4, y, { align: 'left' });
    y += 6.5;
  };

  const drawDivider = () => {
    checkSpace(4);
    doc.setDrawColor(220, 220, 225);
    doc.setLineWidth(0.3);
    doc.line(margin + 10, y, pageWidth - margin - 10, y);
    y += 4;
  };

  // === PROPERTY DETAILS ===
  drawSectionTitle('פרטי העסקה', '🏠');
  drawRow('מחיר הנכס', formatNIS(inputs.price));
  drawRow('אזור', rtl(inputs.region));
  drawRow('סוג נכס', rtl(inputs.propertyType === 'investment' ? 'להשקעה' : 'למגורים'));
  drawRow('דירה ראשונה', rtl(inputs.isFirstApartment ? 'כן' : 'לא'));
  if (inputs.propertyType === 'investment') {
    drawRow('שכ״ד חודשי', formatNIS(inputs.monthlyRent));
  }
  y += 3;

  // === FINANCIAL STRUCTURE ===
  drawSectionTitle('מבנה פיננסי', '💰');
  const parentCont = (inputs.parentHelp && inputs.parentHelpAmount > 0) ? inputs.parentHelpAmount : 0;
  const totalEquity = inputs.downPayment + parentCont;

  drawRow('הון עצמי אישי', formatNIS(inputs.downPayment));
  if (parentCont > 0) {
    drawRow('עזרה מההורים', formatNIS(parentCont), colorMap.warning);
    drawRow('סה״כ הון עצמי זמין', formatNIS(totalEquity), [0, 100, 200]);
  }
  drawRow('אחוז מימון', `${inputs.financingPercent}%`);
  drawRow('סכום משכנתא', formatNIS(inputs.price - totalEquity));
  drawRow('תקופה', rtl('שנים') + ` 25`);
  y += 3;

  // === KEY RESULTS ===
  drawSectionTitle('תוצאות מרכזיות', '📊');

  const totalIncome = inputs.borrowerMode === 'dual' ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  const burdenPct = ((result.monthlyPayment / totalIncome) * 100).toFixed(0);

  drawRow('החזר חודשי', formatNIS(result.monthlyPayment));
  drawRow('נטל החזר מההכנסה', `${burdenPct}%`, 
    Number(burdenPct) > 40 ? colorMap.danger : Number(burdenPct) > 30 ? colorMap.warning : colorMap.safe);
  drawRow('עלות אמיתית כוללת', formatNIS(result.totalRealCost));

  if (inputs.propertyType === 'investment') {
    drawRow('תשואה שנתית', `${result.annualYield.toFixed(1)}%`,
      result.annualYield >= 5 ? colorMap.safe : result.annualYield >= 3 ? colorMap.warning : colorMap.danger);
    drawRow('תזרים חודשי', formatNIS(result.netCashFlow),
      result.netCashFlow >= 0 ? colorMap.safe : colorMap.danger);
  }
  drawRow('מס רכישה', formatNIS(result.purchaseTax));
  y += 3;

  // === APPROVAL SCORE ===
  drawSectionTitle('סיכויי אישור משכנתא', '🏦');
  const approvalColor = colorMap[result.approvalScore.level];
  drawRow('ציון', `${result.approvalScore.score}/100`, approvalColor);
  drawRow('הערכה', rtl(result.approvalScore.label), approvalColor);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 90);

  checkSpace(12);
  const insightLines = doc.splitTextToSize(rtl(result.approvalScore.insight), contentWidth - 8);
  insightLines.forEach((line: string) => {
    checkSpace(5);
    doc.text(line, pageWidth - margin - 4, y, { align: 'right' });
    y += 5;
  });
  y += 3;

  // === SCENARIOS ===
  drawSectionTitle('תרחישי לחץ', '⚡');
  result.scenarios.forEach((s) => {
    checkSpace(16);
    const sLevel = s.survives ? (s.monthlyCashFlow >= 0 ? 'safe' : 'warning') : 'danger';
    const sColor = colorMap[sLevel];
    const statusText = s.survives
      ? (s.monthlyCashFlow >= 0 ? rtl('תזרים חיובי ✓') : rtl(`שורד ~${s.monthsBeforeBroke} חודשים ⚠`))
      : (s.monthsBeforeBroke === 0 ? rtl('נגמר הכסף מיד ✗') : rtl(`נשבר אחרי ${s.monthsBeforeBroke} חודשים ✗`));

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 40);
    doc.text(rtl(s.name), pageWidth - margin - 4, y, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(sColor[0], sColor[1], sColor[2]);
    doc.text(statusText, margin + 4, y, { align: 'left' });
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 130);
    doc.text(`${rtl('החזר:')} ${formatNIS(s.monthlyPayment)}   ${rtl('תזרים:')} ${formatNIS(s.monthlyCashFlow)}`, pageWidth - margin - 4, y, { align: 'right' });
    y += 7;
  });
  y += 2;

  // === COST BREAKDOWN ===
  drawSectionTitle('פירוט עלויות', '📋');
  result.costBreakdown.forEach((item) => {
    const isIndented = item.label.startsWith('  ');
    drawRow(isIndented ? item.label.trim() : item.label, formatNIS(item.amount));
  });
  y += 3;

  // === MORTGAGE BREAKDOWN ===
  checkSpace(25);
  drawSectionTitle('פירוט מסלולי משכנתא', '🏛️');
  result.mortgageBreakdown.forEach((track) => {
    checkSpace(12);
    drawRow(track.label, `${formatNIS(track.monthly)}/month  |  ${track.rate}%  |  ${formatNIS(track.amount)}`);
  });
  y += 3;

  // === RECOMMENDATIONS ===
  if (result.approvalScore.tips.length > 0) {
    checkSpace(20);
    drawSectionTitle('המלצות לשיפור', '🎯');
    result.approvalScore.tips.forEach((tip) => {
      checkSpace(7);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 60);
      doc.text(`+${tip.points} ${rtl('נק׳')}`, margin + 4, y, { align: 'left' });
      doc.text(rtl(tip.action), pageWidth - margin - 4, y, { align: 'right' });
      y += 6.5;
    });
    y += 3;
  }

  // === WARNINGS ===
  if (result.warningBanners.length > 0) {
    checkSpace(15);
    drawSectionTitle('אזהרות', '🚨');
    result.warningBanners.forEach((banner) => {
      checkSpace(10);
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(margin, y - 3, contentWidth, 8, 1.5, 1.5, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorMap.danger[0], colorMap.danger[1], colorMap.danger[2]);
      const cleanBanner = banner.replace(/^[🚨⚠️💸🔴\s]+/, '');
      doc.text(rtl(cleanBanner), pageWidth - margin - 4, y + 2.5, { align: 'right' });
      y += 10;
    });
    y += 2;
  }

  // === DISCLAIMER ===
  checkSpace(25);
  drawDivider();
  doc.setFillColor(248, 248, 250);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 140, 150);
  doc.text(rtl('המידע המוצג כאן הוא להערכה בלבד, ומבוסס על נתונים והנחות כלליות.'), pageWidth / 2, y + 5, { align: 'center' });
  doc.text(rtl('החישובים אינם מהווים ייעוץ פיננסי, המלצה או התחייבות לקבלת משכנתא.'), pageWidth / 2, y + 10, { align: 'center' });
  doc.text(rtl('לפני קבלת החלטה, מומלץ להתייעץ עם גורם מקצועי.'), pageWidth / 2, y + 15, { align: 'center' });

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 190);
    doc.text('Deal or No Deal — realitycheckisrael.lovable.app', pageWidth / 2, 290, { align: 'center' });
    doc.text(`${i}/${pageCount}`, margin, 290, { align: 'left' });
  }

  // Save
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`deal-report-${timestamp}.pdf`);
}
