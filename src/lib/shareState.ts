import { PropertyInputs, MortgageStructure, CustomTrack, TrackType, BorrowerMode, MortgageMode } from "./calculator";
import { PUBLIC_BASE_URL } from "./config";

/**
 * Build a shareable URL on the production domain that encodes the full
 * calculator scenario (inputs + mortgage structure) as query params.
 */
export function buildShareUrl(inputs: PropertyInputs, mortgage: MortgageStructure): string {
  const p = new URLSearchParams();

  // ----- PropertyInputs -----
  const num = (k: string, v: number | undefined) => {
    if (v === undefined || v === null || Number.isNaN(v)) return;
    p.set(k, String(v));
  };
  const bool = (k: string, v: boolean) => p.set(k, v ? "1" : "0");
  const str = (k: string, v: string | undefined) => {
    if (v === undefined || v === null || v === "") return;
    p.set(k, v);
  };

  num("price", inputs.price);
  num("rent", inputs.monthlyRent);
  str("ptype", inputs.propertyType);
  num("dp", inputs.downPayment);
  num("fp", inputs.financingPercent);
  num("inc", inputs.monthlyIncome);
  num("exp", inputs.fixedMonthlyExpenses);
  num("buf", inputs.cashBuffer);
  str("reg", inputs.region);
  bool("first", inputs.isFirstApartment);
  bool("ph", inputs.parentHelp);
  num("pha", inputs.parentHelpAmount);
  str("bm", inputs.borrowerMode);
  num("inc2", inputs.secondBorrowerIncome);
  num("alt", inputs.altRent);
  num("brk", inputs.brokerFeePercent);
  num("law", inputs.lawyerFeePercent);
  num("lawf", inputs.lawyerFeeFixed);
  num("apr", inputs.appraiserFee);
  num("ren", inputs.renovationCost);
  num("xtra", inputs.extraCosts);
  num("hmnt", inputs.monthlyHousingMaintenance);
  num("rmnt", inputs.altRentMaintenance);

  // ----- MortgageStructure -----
  num("mpp", mortgage.primePercent);
  num("mfp", mortgage.fixedPercent);
  num("mvp", mortgage.variablePercent);
  num("mpr", mortgage.primeRate);
  num("mfr", mortgage.fixedRate);
  num("mvr", mortgage.variableRate);
  num("mt", mortgage.termYears);
  str("mmode", mortgage.mode);

  if (mortgage.mode === "advanced" && mortgage.customTracks?.length) {
    // Compact encoding: type|amount|rate|years; ...
    const compact = mortgage.customTracks
      .map((t) => `${t.type}|${t.amount}|${t.rate}|${t.termYears}`)
      .join(";");
    p.set("tracks", compact);
  }

  // Mark that a result should be auto-rendered on load
  p.set("auto", "1");

  return `${PUBLIC_BASE_URL}/?${p.toString()}`;
}

function safeNum(v: string | null, fallback: number): number {
  if (v === null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function safeOptNum(v: string | null): number | undefined {
  if (v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function safeBool(v: string | null, fallback: boolean): boolean {
  if (v === null) return fallback;
  return v === "1" || v === "true";
}

/**
 * Parse a query string and merge values onto the provided defaults.
 * Missing/invalid params fall back to defaults — never throws.
 */
export function parseShareUrl(
  search: string,
  defaults: { inputs: PropertyInputs; mortgage: MortgageStructure }
): { inputs: PropertyInputs; mortgage: MortgageStructure; auto: boolean } | null {
  try {
    const p = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    if ([...p.keys()].length === 0) return null;

    const ptype = p.get("ptype");
    const bm = p.get("bm");
    const mmode = p.get("mmode");

    const inputs: PropertyInputs = {
      ...defaults.inputs,
      price: safeNum(p.get("price"), defaults.inputs.price),
      monthlyRent: safeNum(p.get("rent"), defaults.inputs.monthlyRent),
      propertyType:
        ptype === "investment" || ptype === "primary" ? ptype : defaults.inputs.propertyType,
      downPayment: safeNum(p.get("dp"), defaults.inputs.downPayment),
      financingPercent: safeNum(p.get("fp"), defaults.inputs.financingPercent),
      monthlyIncome: safeNum(p.get("inc"), defaults.inputs.monthlyIncome),
      fixedMonthlyExpenses: safeNum(p.get("exp"), defaults.inputs.fixedMonthlyExpenses),
      cashBuffer: safeNum(p.get("buf"), defaults.inputs.cashBuffer),
      region: p.get("reg") ?? defaults.inputs.region,
      isFirstApartment: safeBool(p.get("first"), defaults.inputs.isFirstApartment),
      parentHelp: safeBool(p.get("ph"), defaults.inputs.parentHelp),
      parentHelpAmount: safeNum(p.get("pha"), defaults.inputs.parentHelpAmount),
      borrowerMode: (bm === "single" || bm === "dual" ? bm : defaults.inputs.borrowerMode) as BorrowerMode,
      secondBorrowerIncome: safeNum(p.get("inc2"), defaults.inputs.secondBorrowerIncome),
      altRent: safeOptNum(p.get("alt")) ?? defaults.inputs.altRent,
      brokerFeePercent: safeOptNum(p.get("brk")) ?? defaults.inputs.brokerFeePercent,
      lawyerFeePercent: safeOptNum(p.get("law")) ?? defaults.inputs.lawyerFeePercent,
      lawyerFeeFixed: safeOptNum(p.get("lawf")) ?? defaults.inputs.lawyerFeeFixed,
      appraiserFee: safeOptNum(p.get("apr")) ?? defaults.inputs.appraiserFee,
      renovationCost: safeOptNum(p.get("ren")) ?? defaults.inputs.renovationCost,
      extraCosts: safeOptNum(p.get("xtra")) ?? defaults.inputs.extraCosts,
      monthlyHousingMaintenance:
        safeOptNum(p.get("hmnt")) ?? defaults.inputs.monthlyHousingMaintenance,
      altRentMaintenance: safeOptNum(p.get("rmnt")) ?? defaults.inputs.altRentMaintenance,
    };

    let customTracks: CustomTrack[] | undefined = defaults.mortgage.customTracks;
    const tracksRaw = p.get("tracks");
    if (tracksRaw) {
      const parsed: CustomTrack[] = [];
      tracksRaw.split(";").forEach((seg, i) => {
        const [type, amount, rate, years] = seg.split("|");
        if (type === "prime" || type === "fixed" || type === "variable") {
          const a = Number(amount), r = Number(rate), y = Number(years);
          if ([a, r, y].every(Number.isFinite)) {
            parsed.push({
              id: `t${i}_${Date.now()}`,
              type: type as TrackType,
              amount: a,
              rate: r,
              termYears: y,
            });
          }
        }
      });
      if (parsed.length) customTracks = parsed;
    }

    const mortgage: MortgageStructure = {
      ...defaults.mortgage,
      primePercent: safeNum(p.get("mpp"), defaults.mortgage.primePercent),
      fixedPercent: safeNum(p.get("mfp"), defaults.mortgage.fixedPercent),
      variablePercent: safeNum(p.get("mvp"), defaults.mortgage.variablePercent),
      primeRate: safeNum(p.get("mpr"), defaults.mortgage.primeRate),
      fixedRate: safeNum(p.get("mfr"), defaults.mortgage.fixedRate),
      variableRate: safeNum(p.get("mvr"), defaults.mortgage.variableRate),
      termYears: safeNum(p.get("mt"), defaults.mortgage.termYears),
      mode: (mmode === "simple" || mmode === "advanced" ? mmode : defaults.mortgage.mode) as
        | MortgageMode
        | undefined,
      customTracks,
    };

    const auto = p.get("auto") === "1" || [...p.keys()].some((k) => k !== "auto");
    return { inputs, mortgage, auto };
  } catch {
    return null;
  }
}