import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AnalysisResult, PropertyInputs, formatNIS } from "./calculator";

const MOTIVATION_LABELS: Record<string, string> = {
  family_pressure: "לחץ מהמשפחה",
  fomo: "פחד לפספס",
  stability: "רצון ליציבות",
  investment: "שיקול השקעה",
  status: "שיקול סטטוס",
  rent_waste: "תחושת בזבוז בשכירות",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderNumber(value: string, tone = "default") {
  return `<span class="pdf-number pdf-tone-${tone}">${escapeHtml(value)}</span>`;
}

function renderRow(label: string, value: string, tone = "default") {
  return `
    <div class="pdf-row">
      <div class="pdf-label">${escapeHtml(label)}</div>
      <div class="pdf-value">${renderNumber(value, tone)}</div>
    </div>
  `;
}

function renderBadge(text: string, tone: "safe" | "warning" | "danger") {
  return `<span class="pdf-badge pdf-badge-${tone}">${escapeHtml(text)}</span>`;
}

function waitForNextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export async function generateDealPDF(result: AnalysisResult, inputs: PropertyInputs, motivations: string[]): Promise<void> {
  const parentContribution = inputs.parentHelp && inputs.parentHelpAmount > 0 ? inputs.parentHelpAmount : 0;
  const totalEquity = inputs.downPayment + parentContribution;
  const mortgageAmount = inputs.price - totalEquity;
  const totalIncome = inputs.borrowerMode === "dual" ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  const burdenPercent = ((result.monthlyPayment / totalIncome) * 100).toFixed(0);
  const date = new Date().toLocaleDateString("he-IL");
  const selectedMotivations = motivations.map((key) => MOTIVATION_LABELS[key]).filter(Boolean);

  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.pointerEvents = "none";
  container.style.opacity = "0";
  container.style.zIndex = "-1";

  container.innerHTML = `
    <style>
      .pdf-report {
        width: 794px;
        box-sizing: border-box;
        padding: 28px;
        background: #ffffff;
        color: #111827;
        direction: rtl;
        text-align: right;
        font-family: var(--font-body), 'Heebo', Arial, sans-serif;
        line-height: 1.45;
      }
      .pdf-report * { box-sizing: border-box; }
      .pdf-header {
        padding: 24px 28px;
        border-radius: 24px;
        color: white;
        background: ${
          result.verdictLevel === "safe"
            ? "linear-gradient(135deg, hsl(142 60% 38%), hsl(142 60% 45%))"
            : result.verdictLevel === "warning"
              ? "linear-gradient(135deg, hsl(38 92% 44%), hsl(38 92% 50%))"
              : "linear-gradient(135deg, hsl(0 72% 45%), hsl(0 72% 51%))"
        };
      }
      .pdf-brand {
        font-family: 'Space Grotesk', var(--font-mono), sans-serif;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.04em;
        direction: ltr;
        text-align: center;
      }
      .pdf-subtitle {
        margin-top: 8px;
        font-size: 16px;
        text-align: center;
        font-weight: 500;
      }
      .pdf-date {
        margin-top: 12px;
        font-size: 12px;
        color: rgba(255,255,255,0.85);
        text-align: center;
      }
      .pdf-verdict {
        margin-top: 18px;
        padding: 16px 18px;
        border-radius: 18px;
        background: #f8fafc;
        border: 1px solid #e5e7eb;
      }
      .pdf-verdict-title {
        font-size: 22px;
        font-weight: 800;
        color: ${
          result.verdictLevel === "safe"
            ? "hsl(142 60% 34%)"
            : result.verdictLevel === "warning"
              ? "hsl(38 92% 38%)"
              : "hsl(0 72% 42%)"
        };
      }
      .pdf-verdict-meta {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .pdf-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
      }
      .pdf-badge-safe { background: hsl(142 60% 92%); color: hsl(142 60% 28%); }
      .pdf-badge-warning { background: hsl(38 92% 92%); color: hsl(38 92% 28%); }
      .pdf-badge-danger { background: hsl(0 72% 94%); color: hsl(0 72% 38%); }
      .pdf-section {
        margin-top: 18px;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        overflow: hidden;
      }
      .pdf-section-head {
        padding: 12px 16px;
        background: #f8fafc;
        border-bottom: 1px solid #e5e7eb;
        font-size: 15px;
        font-weight: 800;
      }
      .pdf-section-body { padding: 14px 16px 16px; }
      .pdf-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .pdf-card {
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        padding: 14px;
        background: #ffffff;
      }
      .pdf-card-soft { background: #f8fafc; }
      .pdf-card-title {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 6px;
        font-weight: 600;
      }
      .pdf-card-value {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.03em;
      }
      .pdf-card-sub {
        margin-top: 6px;
        font-size: 12px;
        color: #6b7280;
      }
      .pdf-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 8px 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .pdf-row:last-child { border-bottom: 0; }
      .pdf-label {
        color: #6b7280;
        font-size: 13px;
        font-weight: 500;
      }
      .pdf-value {
        flex-shrink: 0;
        max-width: 55%;
      }
      .pdf-number {
        display: inline-block;
        direction: ltr;
        unicode-bidi: isolate;
        text-align: left;
        font-family: 'Space Grotesk', var(--font-mono), sans-serif;
        font-size: 14px;
        font-weight: 700;
        color: #111827;
      }
      .pdf-tone-safe { color: hsl(142 60% 34%); }
      .pdf-tone-warning { color: hsl(38 92% 36%); }
      .pdf-tone-danger { color: hsl(0 72% 42%); }
      .pdf-tone-primary { color: hsl(210 60% 40%); }
      .pdf-list {
        display: grid;
        gap: 10px;
      }
      .pdf-note {
        border-radius: 14px;
        padding: 12px 14px;
        border: 1px solid #e5e7eb;
        background: #ffffff;
        font-size: 13px;
      }
      .pdf-note-safe { background: hsl(142 60% 96%); border-color: hsl(142 60% 86%); }
      .pdf-note-warning { background: hsl(38 92% 96%); border-color: hsl(38 92% 86%); }
      .pdf-note-danger { background: hsl(0 72% 97%); border-color: hsl(0 72% 90%); }
      .pdf-note-title {
        font-weight: 800;
        margin-bottom: 6px;
      }
      .pdf-note-safe .pdf-note-title { color: hsl(142 60% 34%); }
      .pdf-note-warning .pdf-note-title { color: hsl(38 92% 36%); }
      .pdf-note-danger .pdf-note-title { color: hsl(0 72% 42%); }
      .pdf-scenario-grid,
      .pdf-tracks-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .pdf-track-meta,
      .pdf-small {
        font-size: 12px;
        color: #6b7280;
      }
      .pdf-footer {
        margin-top: 18px;
        padding: 14px 16px;
        border-radius: 16px;
        background: #f8fafc;
        border: 1px solid #e5e7eb;
        font-size: 12px;
        color: #6b7280;
        text-align: center;
      }
    </style>

    <div class="pdf-report" dir="rtl" lang="he">
      <div class="pdf-header">
        <div class="pdf-brand">Deal or No Deal</div>
        <div class="pdf-subtitle">דוח הכנה לבנק — בדיקת כדאיות רכישת נכס</div>
        <div class="pdf-date">${escapeHtml(date)}</div>
      </div>

      <div class="pdf-verdict">
        <div class="pdf-verdict-title">${escapeHtml(result.verdict)}</div>
        <div class="pdf-verdict-meta">
          ${renderBadge(`סיכון: ${result.riskScore}`, result.verdictLevel)}
          ${renderBadge(`לחץ צפוי: ${result.stressLevel}`, result.verdictLevel)}
          ${renderBadge(`כרית ביטחון: ${formatNIS(result.minRequiredBuffer)}`, "warning")}
        </div>
      </div>

      <section class="pdf-section">
        <div class="pdf-section-head">🏠 פרטי העסקה</div>
        <div class="pdf-section-body">
          ${renderRow("מחיר הנכס", formatNIS(inputs.price))}
          ${renderRow("אזור", inputs.region)}
          ${renderRow("סוג נכס", inputs.propertyType === "investment" ? "להשקעה" : "למגורים")}
          ${renderRow("מטרת הרכישה", inputs.propertyType === "investment" ? "נכס להשקעה" : "דירת מגורים")}
          ${renderRow("דירה ראשונה", inputs.isFirstApartment ? "כן" : "לא")}
          ${inputs.propertyType === "investment" ? renderRow("שכ״ד חודשי", formatNIS(inputs.monthlyRent)) : ""}
        </div>
      </section>

      <section class="pdf-section">
        <div class="pdf-section-head">💰 מבנה פיננסי</div>
        <div class="pdf-section-body">
          ${renderRow("הון עצמי אישי", formatNIS(inputs.downPayment))}
          ${parentContribution > 0 ? renderRow("עזרה מההורים", formatNIS(parentContribution), "warning") : ""}
          ${parentContribution > 0 ? renderRow("סה״כ הון עצמי זמין", formatNIS(totalEquity), "primary") : ""}
          ${renderRow(parentContribution > 0 ? "אחוז מימון בפועל" : "אחוז מימון", `${inputs.financingPercent}%`)}
          ${renderRow("סכום משכנתא", formatNIS(mortgageAmount))}
          ${inputs.borrowerMode === "dual" ? renderRow("הכנסה זוגית", formatNIS(totalIncome)) : renderRow("הכנסה חודשית", formatNIS(totalIncome))}
          ${parentContribution > 0 ? `<div class="pdf-small" style="margin-top: 10px;">כולל ${renderNumber(formatNIS(parentContribution), "warning")} עזרה מההורים, שהפחיתה את אחוז המימון והקטינה את גובה המשכנתא.</div>` : ""}
        </div>
      </section>

      <section class="pdf-section">
        <div class="pdf-section-head">📊 תוצאות מרכזיות</div>
        <div class="pdf-section-body">
          <div class="pdf-grid-2">
            <div class="pdf-card pdf-card-soft">
              <div class="pdf-card-title">החזר חודשי</div>
              <div class="pdf-card-value">${renderNumber(formatNIS(result.monthlyPayment), burdenPercent > "40" ? "danger" : burdenPercent > "30" ? "warning" : "safe")}</div>
              <div class="pdf-card-sub">${escapeHtml(`${burdenPercent}% מההכנסה`)}</div>
            </div>
            <div class="pdf-card pdf-card-soft">
              <div class="pdf-card-title">עלות אמיתית כוללת</div>
              <div class="pdf-card-value">${renderNumber(formatNIS(result.totalRealCost))}</div>
              <div class="pdf-card-sub">הון עצמי + מס רכישה + עלויות נלוות</div>
            </div>
            ${inputs.propertyType === "investment" ? `
              <div class="pdf-card pdf-card-soft">
                <div class="pdf-card-title">תשואה שנתית</div>
                <div class="pdf-card-value">${renderNumber(`${result.annualYield.toFixed(1)}%`, result.annualYield >= 5 ? "safe" : result.annualYield >= 3 ? "warning" : "danger")}</div>
                <div class="pdf-card-sub">ברוטו</div>
              </div>
              <div class="pdf-card pdf-card-soft">
                <div class="pdf-card-title">תזרים חודשי</div>
                <div class="pdf-card-value">${renderNumber(formatNIS(result.netCashFlow), result.netCashFlow >= 0 ? "safe" : "danger")}</div>
                <div class="pdf-card-sub">אחרי כל ההוצאות</div>
              </div>
            ` : `
              <div class="pdf-card pdf-card-soft">
                <div class="pdf-card-title">סיכויי אישור משכנתא</div>
                <div class="pdf-card-value">${renderNumber(`${result.approvalScore.score}/100`, result.approvalScore.level)}</div>
                <div class="pdf-card-sub">${escapeHtml(result.approvalScore.label)}</div>
              </div>
              <div class="pdf-card pdf-card-soft">
                <div class="pdf-card-title">מס רכישה</div>
                <div class="pdf-card-value">${renderNumber(formatNIS(result.purchaseTax), result.purchaseTax > 50000 ? "danger" : "default")}</div>
                <div class="pdf-card-sub">כסף שנעלם ביום 1</div>
              </div>
            `}
          </div>
        </div>
      </section>

      <section class="pdf-section">
        <div class="pdf-section-head">🏦 סיכויי אישור משכנתא</div>
        <div class="pdf-section-body">
          ${renderRow("ציון", `${result.approvalScore.score}/100`, result.approvalScore.level)}
          ${renderRow("הערכת מצב", result.approvalScore.label, result.approvalScore.level)}
          <div class="pdf-note pdf-note-${result.approvalScore.level}" style="margin-top: 10px;">
            <div class="pdf-note-title">תובנה</div>
            <div>${escapeHtml(result.approvalScore.insight)}</div>
          </div>
          ${result.approvalScore.tips.length > 0 ? `
            <div class="pdf-list" style="margin-top: 10px;">
              ${result.approvalScore.tips
                .map(
                  (tip) => `
                    <div class="pdf-note pdf-note-safe">
                      <div class="pdf-note-title">איך לשפר את הסיכוי</div>
                      <div>${escapeHtml(tip.action)} — ${renderNumber(`+${tip.points} נק׳`, "safe")}</div>
                    </div>
                  `,
                )
                .join("")}
            </div>
          ` : ""}
          ${result.borrowerComparison ? `
            <div class="pdf-note pdf-note-safe" style="margin-top: 10px;">
              <div class="pdf-note-title">השפעת לווה נוסף</div>
              <div>${escapeHtml(result.borrowerComparison.insight)}</div>
            </div>
          ` : ""}
        </div>
      </section>

      <section class="pdf-section">
        <div class="pdf-section-head">💡 המצב הפיננסי שלך — מה הבנק רואה</div>
        <div class="pdf-section-body">
          ${renderRow("הכנסה חודשית כוללת", formatNIS(totalIncome))}
          ${renderRow("החזר חודשי צפוי", formatNIS(result.monthlyPayment))}
          ${renderRow("נטל החזר מההכנסה", `${burdenPercent}%`, Number(burdenPercent) > 40 ? "danger" : Number(burdenPercent) > 30 ? "warning" : "safe")}
          ${renderRow("הון עצמי זמין", formatNIS(totalEquity))}
          ${renderRow("אחוז מימון", `${inputs.financingPercent}%`, inputs.financingPercent > 70 ? "danger" : inputs.financingPercent > 60 ? "warning" : "safe")}
          ${renderRow("כרית ביטחון אחרי רכישה", formatNIS(inputs.cashBuffer), inputs.cashBuffer < result.monthlyPayment * 6 ? "danger" : "safe")}
        </div>
      </section>

      <section class="pdf-section">
        <div class="pdf-section-head">⚠️ נקודות חולשה — מה עלול להפריע לאישור</div>
        <div class="pdf-section-body pdf-list">
          ${Number(burdenPercent) > 35 ? `<div class="pdf-note pdf-note-${Number(burdenPercent) > 40 ? 'danger' : 'warning'}"><div class="pdf-note-title">נטל החזר גבוה (${burdenPercent}%)</div><div>הבנקים מעדיפים נטל עד 30%. מעל 40% מקשה מאוד על אישור.</div></div>` : ''}
          ${inputs.financingPercent > 60 ? `<div class="pdf-note pdf-note-${inputs.financingPercent > 70 ? 'danger' : 'warning'}"><div class="pdf-note-title">אחוז מימון גבוה (${inputs.financingPercent}%)</div><div>ככל שאחוז המימון גבוה יותר, הבנק דורש יותר ביטחונות ומעלה ריבית.</div></div>` : ''}
          ${inputs.cashBuffer < result.monthlyPayment * 6 ? `<div class="pdf-note pdf-note-danger"><div class="pdf-note-title">כרית ביטחון דקה</div><div>מומלץ לשמור לפחות ${formatNIS(result.monthlyPayment * 6)} (6 חודשי החזר) לאחר הרכישה.</div></div>` : ''}
          ${inputs.borrowerMode === 'single' ? `<div class="pdf-note pdf-note-warning"><div class="pdf-note-title">לווה יחיד</div><div>הוספת לווה נוסף (בן/בת זוג או ערב) יכולה לשפר את סיכויי האישור משמעותית.</div></div>` : ''}
          ${Number(burdenPercent) <= 35 && inputs.financingPercent <= 60 && inputs.cashBuffer >= result.monthlyPayment * 6 && inputs.borrowerMode === 'dual' ? `<div class="pdf-note pdf-note-safe"><div class="pdf-note-title">✓ לא זוהו חולשות משמעותיות</div><div>הפרופיל הפיננסי שלך חזק — ממשיך לבדוק תרחישים.</div></div>` : ''}
        </div>
      </section>

      <section class="pdf-section">
        <div class="pdf-section-head">📅 כמה תשלם לאורך זמן</div>
        <div class="pdf-section-body">
          ${renderRow("גובה המשכנתא", formatNIS(mortgageAmount))}
          ${renderRow("תקופה", `${result.termYears} שנים (${result.termYears * 12} תשלומים)`)}
          ${renderRow("סה״כ תשלם לבנק", formatNIS(result.monthlyPayment * result.termYears * 12), "primary")}
          ${renderRow("מתוכם ריבית", formatNIS(result.monthlyPayment * result.termYears * 12 - mortgageAmount), "warning")}
          <div class="pdf-small" style="margin-top: 10px; color: #6b7280;">
            זהו הסכום הכולל שתשלם לאורך כל חיי המשכנתא, כולל קרן וריבית. החזר חודשי × ${result.termYears * 12} חודשים.
          </div>
        </div>
      </section>

      <section class="pdf-section">
        <div class="pdf-section-head">⚡ תרחישי לחץ — אופטימי מול פסימי</div>
        <div class="pdf-section-body">
          <div class="pdf-scenario-grid">
            ${result.scenarios
              .map((scenario) => {
                const tone = !scenario.survives ? "danger" : scenario.monthlyCashFlow >= 0 ? "safe" : "warning";
                const status = scenario.survives
                  ? scenario.monthlyCashFlow >= 0
                    ? "תזרים חיובי"
                    : `שורד כ-${scenario.monthsBeforeBroke} חודשים`
                  : scenario.monthsBeforeBroke === 0
                    ? "נגמר הכסף מיד"
                    : `נשבר אחרי ${scenario.monthsBeforeBroke} חודשים`;

                return `
                  <div class="pdf-note pdf-note-${tone}">
                    <div class="pdf-note-title">${escapeHtml(scenario.name)}</div>
                    <div class="pdf-small" style="margin-bottom: 8px;">${escapeHtml(scenario.description)}</div>
                    <div class="pdf-row"><div class="pdf-label">החזר חודשי</div><div class="pdf-value">${renderNumber(formatNIS(scenario.monthlyPayment))}</div></div>
                    <div class="pdf-row"><div class="pdf-label">תזרים חודשי</div><div class="pdf-value">${renderNumber(formatNIS(scenario.monthlyCashFlow), tone)}</div></div>
                    <div class="pdf-small" style="margin-top: 8px; font-weight: 700; color: ${tone === "safe" ? "hsl(142 60% 34%)" : tone === "warning" ? "hsl(38 92% 36%)" : "hsl(0 72% 42%)"};">${escapeHtml(status)}</div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      </section>

      <section class="pdf-section">
        <div class="pdf-section-head">📋 פירוט עלויות ומסלולים</div>
        <div class="pdf-section-body">
          <div class="pdf-grid-2">
            <div class="pdf-card">
              <div class="pdf-card-title">עלות אמיתית — breakdown</div>
              ${result.costBreakdown.map((item) => renderRow(item.label.trim(), formatNIS(item.amount))).join("")}
            </div>
            <div class="pdf-card">
              <div class="pdf-card-title">מסלולי משכנתא</div>
              <div class="pdf-tracks-grid" style="grid-template-columns: 1fr; gap: 10px;">
                ${result.mortgageBreakdown
                  .map(
                    (track) => `
                      <div class="pdf-note">
                        <div class="pdf-note-title">${escapeHtml(track.label)}</div>
                        <div class="pdf-small">${escapeHtml(track.desc)}</div>
                        <div class="pdf-track-meta" style="margin-top: 8px;">${renderNumber(`${formatNIS(track.monthly)}/חודש`)} · ${renderNumber(`${track.rate}%`)} · ${renderNumber(formatNIS(track.amount))}</div>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      </section>

      ${result.warningBanners.length > 0 ? `
        <section class="pdf-section">
          <div class="pdf-section-head">🚨 אזהרות</div>
          <div class="pdf-section-body pdf-list">
            ${result.warningBanners
              .map(
                (warning) => `
                  <div class="pdf-note pdf-note-danger">
                    <div>${escapeHtml(warning)}</div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
      ` : ""}

      ${result.psychologyInsights.length > 0 || selectedMotivations.length > 0 ? `
        <section class="pdf-section">
          <div class="pdf-section-head">🧠 תובנות / המלצות</div>
          <div class="pdf-section-body pdf-list">
            ${selectedMotivations.length > 0 ? `
              <div class="pdf-note">
                <div class="pdf-note-title">מה מניע אותך</div>
                <div>${escapeHtml(selectedMotivations.join(" · "))}</div>
              </div>
            ` : ""}
            ${result.psychologyInsights
              .map(
                (insight) => `
                  <div class="pdf-note pdf-note-${insight.severity === "info" ? "safe" : insight.severity}">
                    <div class="pdf-note-title">${escapeHtml(insight.trigger)}</div>
                    <div>${escapeHtml(insight.message)}</div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
      ` : ""}

      <div class="pdf-footer">
        המידע הינו להערכה בלבד ואינו מהווה ייעוץ פיננסי · Deal or No Deal
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    if ("fonts" in document) {
      await document.fonts.ready;
    }
    await waitForNextFrame();
    await waitForNextFrame();

    const reportElement = container.firstElementChild?.nextElementSibling as HTMLElement | null;
    if (!reportElement) {
      throw new Error("PDF report element was not created");
    }

    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;
    const imageHeight = (canvas.height * printableWidth) / canvas.width;
    const imageData = canvas.toDataURL("image/png");

    let heightLeft = imageHeight;
    let position = margin;

    pdf.addImage(imageData, "PNG", margin, position, printableWidth, imageHeight, undefined, "FAST");
    heightLeft -= printableHeight;

    while (heightLeft > 0) {
      position = margin - (imageHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imageData, "PNG", margin, position, printableWidth, imageHeight, undefined, "FAST");
      heightLeft -= printableHeight;
    }

    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      pdf.setPage(page);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Deal or No Deal`, pageWidth / 2, pageHeight - 4, { align: "center" });
      pdf.text(`${page}/${pageCount}`, margin, pageHeight - 4, { align: "left" });
    }

    pdf.save(`deal-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  } finally {
    container.remove();
  }
}
