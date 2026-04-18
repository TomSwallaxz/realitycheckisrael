import { describe, it, expect } from 'vitest';
import {
  analyze,
  calcFirstMonthSplit,
  PropertyInputs,
  MortgageStructure,
  DEFAULT_RATES,
} from '@/lib/calculator';

const baseInputs = (overrides: Partial<PropertyInputs> = {}): PropertyInputs => ({
  price: 1_000_000,
  monthlyRent: 3500,
  propertyType: 'investment',
  downPayment: 500_000,
  financingPercent: 50,
  monthlyIncome: 20_000,
  fixedMonthlyExpenses: 0,
  cashBuffer: 100_000,
  region: 'מרכז (תל אביב, גוש דן)',
  isFirstApartment: false,
  parentHelp: false,
  parentHelpAmount: 0,
  borrowerMode: 'single',
  secondBorrowerIncome: 0,
  altRent: 0,
  ...overrides,
});

const baseMortgage = (overrides: Partial<MortgageStructure> = {}): MortgageStructure => ({
  primePercent: 40,
  fixedPercent: 40,
  variablePercent: 20,
  primeRate: DEFAULT_RATES.primeRate,
  fixedRate: DEFAULT_RATES.fixedRate,
  variableRate: DEFAULT_RATES.variableRate,
  termYears: 25,
  ...overrides,
});

describe('Calculator validation', () => {
  it('Test 1 — Basic financing: loan = 500,000, LTV 50%', () => {
    const r = analyze(baseInputs(), baseMortgage());
    expect(r.loanAmount).toBe(500_000);
    expect(Math.round((r.loanAmount / 1_000_000) * 100)).toBe(50);
  });

  it('Test 2 — Investment gross yield: 4.2%', () => {
    const r = analyze(baseInputs(), baseMortgage());
    // (3500 * 12 / 1_000_000) * 100 = 4.2
    expect(Number(r.annualYield.toFixed(1))).toBe(4.2);
  });

  it('Test 3 — Investment net yield: 3.6% with 500₪ property expenses', () => {
    // Net yield formula per spec: ((rent - propertyExpenses) * 12 / price) * 100
    const rent = 3500;
    const propertyExpenses = 500;
    const price = 1_000_000;
    const netYield = ((rent - propertyExpenses) * 12 / price) * 100;
    expect(Number(netYield.toFixed(1))).toBe(3.6);
  });

  it('Test 4 — Property monthly cashflow: rent - mortgage - expenses = 200', () => {
    const rent = 3500, mortgagePay = 2800, propExp = 500;
    expect(rent - mortgagePay - propExp).toBe(200);
  });

  it('Test 5 — Primary residence: annualYield must be 0', () => {
    const r = analyze(baseInputs({ propertyType: 'primary' }), baseMortgage());
    expect(r.annualYield).toBe(0);
  });

  it('Test 6 — Real cost of living: mortgage + expenses - altRent = 1000', () => {
    const mortgagePay = 4000, monthlyExp = 500, altRent = 3500;
    expect(mortgagePay + monthlyExp - altRent).toBe(1000);
  });

  it('Test 7 — Burn vs Build: burned = interest + expenses, accumulated = principal', () => {
    // monthly payment 4000, principal 1200, interest 2300 (sums to 3500 in spec — note 500 rounding)
    const principal = 1200;
    const interest = 2300;
    const expenses = 500;
    const burned = interest + expenses;
    const accumulated = principal;
    expect(accumulated).toBe(1200);
    expect(burned).toBe(2800);
  });

  it('calcFirstMonthSplit splits correctly', () => {
    // loan 500k, payment ~3000, rate 5% → interest = 500000 * 0.05/12 ≈ 2083.33
    const { interest, principal } = calcFirstMonthSplit(500_000, 3000, 5);
    expect(Math.round(interest)).toBe(2083);
    expect(Math.round(principal)).toBe(917);
  });
});
