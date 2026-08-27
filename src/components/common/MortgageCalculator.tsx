import React, { useState } from 'react';
import { Calculator, DollarSign, Percent, Calendar, Shield, Info } from 'lucide-react';
import { formatPrice } from '../../lib/seo';

interface MortgageCalculatorProps {
  initialPrice?: number;
  currencySymbol?: string;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  initialPrice = 1500000,
  currencySymbol = '$',
}) => {
  const [homePrice, setHomePrice] = useState(initialPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2); // % per year
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState(2400); // per year
  const [hoaMonthly, setHoaMonthly] = useState(350);

  const downPaymentAmount = (homePrice * downPaymentPercent) / 100;
  const principalLoan = Math.max(0, homePrice - downPaymentAmount);

  // Monthly mortgage calculation formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  let monthlyPrincipalAndInterest = 0;
  if (monthlyInterestRate > 0 && numberOfPayments > 0 && principalLoan > 0) {
    monthlyPrincipalAndInterest =
      (principalLoan *
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  }

  const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12;
  const monthlyHomeInsurance = homeInsuranceAnnual / 12;
  const totalMonthlyPayment =
    monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyHomeInsurance + hoaMonthly;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Estimated Monthly Investment & Mortgage</h3>
          <p className="text-xs text-slate-500">Calculate estimated monthly principal, interest, taxes & HOA</p>
        </div>
      </div>

      {/* Result Card */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
              Total Monthly Estimated Payment
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-white mt-1">
              {formatPrice(Math.round(totalMonthlyPayment), 'USD', currencySymbol)}
              <span className="text-xs font-normal text-indigo-200 ml-1">/ month</span>
            </div>
          </div>
          <div className="text-xs text-indigo-200 sm:text-right">
            Loan Amount: <strong className="text-white">{formatPrice(Math.round(principalLoan), 'USD', currencySymbol)}</strong>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-slate-400 text-[10px]">Principal & Interest</div>
            <div className="font-semibold text-white mt-0.5">
              {formatPrice(Math.round(monthlyPrincipalAndInterest), 'USD', currencySymbol)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">Property Tax</div>
            <div className="font-semibold text-white mt-0.5">
              {formatPrice(Math.round(monthlyPropertyTax), 'USD', currencySymbol)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">Home Insurance</div>
            <div className="font-semibold text-white mt-0.5">
              {formatPrice(Math.round(monthlyHomeInsurance), 'USD', currencySymbol)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">HOA Dues</div>
            <div className="font-semibold text-white mt-0.5">
              {formatPrice(Math.round(hoaMonthly), 'USD', currencySymbol)}
            </div>
          </div>
        </div>
      </div>

      {/* Sliders and Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
        {/* Home Price */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>Property Price</span>
            <span className="font-bold text-slate-900">{formatPrice(homePrice, 'USD', currencySymbol)}</span>
          </div>
          <input
            type="range"
            min={100000}
            max={20000000}
            step={25000}
            value={homePrice}
            onChange={(e) => setHomePrice(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Down Payment */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>Down Payment ({downPaymentPercent}%)</span>
            <span className="font-bold text-slate-900">{formatPrice(Math.round(downPaymentAmount), 'USD', currencySymbol)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Interest Rate */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>Interest Rate (APR)</span>
            <span className="font-bold text-slate-900">{interestRate}%</span>
          </div>
          <input
            type="range"
            min={2.0}
            max={12.0}
            step={0.1}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Loan Term */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>Loan Term</span>
            <span className="font-bold text-slate-900">{loanTermYears} Years</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[15, 20, 30].map((years) => (
              <button
                key={years}
                type="button"
                onClick={() => setLoanTermYears(years)}
                className={`py-1.5 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                  loanTermYears === years
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {years} Yrs
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500">
        <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
        <span>
          Estimations are for guidance purposes only. Final loan payments depend on credit score, exact property tax jurisdiction, lender fees, and underwriting.
        </span>
      </div>
    </div>
  );
};
