"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';

const calculatorStyles = `
/* ================================================
   Liquid Glass Calculator
   Palette: 4 sections only
   · Background  → deep navy  #090c18
   · Numbers     → frosted glass (neutral blue-white)
   · Operators   → indigo-tinted glass
   · Utility     → warm amber glass
   · Equals      → solid violet-indigo hero
   ================================================ */

:root {
  --bg:           #090c18;
  --bg-orb-a:     #1e2a6e;
  --bg-orb-b:     #2e1065;
  --bg-orb-c:     #0c2340;

  --card-bg:      rgba(255, 255, 255, 0.055);
  --card-border:  rgba(255, 255, 255, 0.13);
  --card-shine:   rgba(255, 255, 255, 0.07);

  --display-bg:   rgba(5, 8, 22, 0.55);
  --display-border: rgba(255, 255, 255, 0.08);

  --text:         #e8edf8;
  --text-dim:     rgba(232, 237, 248, 0.45);

  --num-bg:       rgba(190, 210, 255, 0.09);
  --num-border:   rgba(180, 200, 255, 0.14);
  --num-hover:    rgba(190, 210, 255, 0.18);
  --num-shine:    rgba(220, 235, 255, 0.12);

  --op-bg:        rgba(100, 80, 220, 0.18);
  --op-border:    rgba(140, 120, 255, 0.22);
  --op-hover:     rgba(100, 80, 220, 0.30);
  --op-color:     #c4b8ff;

  --util-bg:      rgba(230, 160, 30, 0.15);
  --util-border:  rgba(255, 190, 60, 0.20);
  --util-hover:   rgba(230, 160, 30, 0.26);
  --util-color:   #fcd97a;

  --eq-from:      #5b21b6;
  --eq-to:        #7c3aed;

  --r-card: 28px;
  --r-btn:  16px;
  --r-disp: 18px;

  --t: 160ms cubic-bezier(0.4, 0, 0.2, 1);
}

.calc-container {
  min-height: calc(100vh - 80px);
  background: linear-gradient(rgba(9, 12, 24, 0.45), rgba(9, 12, 24, 0.45)), url('https://cdn.pixabay.com/photo/2023/08/04/22/59/sunset-8170058_1280.jpg') no-repeat center center;
  background-size: cover;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
  padding-top: 140px;
  padding-bottom: 160px;
}

.bg-orbs {
  position: absolute; inset: 0;
  pointer-events: none; overflow: hidden; z-index: 0;
}
.orb {
  position: absolute; border-radius: 50%;
  filter: blur(100px); opacity: 0.35;
  animation: drift 14s ease-in-out infinite alternate;
}
.orb-1 {
  width: 560px; height: 560px;
  background: var(--bg-orb-a);
  top: -180px; left: -160px;
  animation-duration: 16s;
}
.orb-2 {
  width: 440px; height: 440px;
  background: var(--bg-orb-b);
  bottom: -140px; right: -120px;
  animation-duration: 12s;
  animation-delay: -5s;
}
.orb-3 {
  width: 300px; height: 300px;
  background: var(--bg-orb-c);
  top: 42%; left: 48%;
  opacity: 0.28;
  animation-duration: 20s;
  animation-delay: -10s;
}

@keyframes drift {
  0%   { transform: translate(0, 0) scale(1); }
  100% { transform: translate(35px, 25px) scale(1.08); }
}

.calculator-wrapper {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  width: 100%;
}

.calculator {
  width: 100%; max-width: 360px;
  padding: 22px;
  display: flex; flex-direction: column; gap: 18px;
  border-radius: var(--r-card);
  background:
    linear-gradient(180deg,
      rgba(255,255,255,0.10) 0px,
      rgba(255,255,255,0.00) 1px) top / 100% 2px no-repeat,
    rgba(255,255,255,0.06);
  backdrop-filter: blur(48px) saturate(220%) brightness(1.05);
  -webkit-backdrop-filter: blur(48px) saturate(220%) brightness(1.05);
  border: 1px solid var(--card-border);
  box-shadow:
    0 40px 90px rgba(0, 0, 0, 0.75),
    0 12px 32px rgba(0, 0, 0, 0.50),
    inset 0 1.5px 0 rgba(255, 255, 255, 0.14),
    inset 1px 0   0 rgba(255, 255, 255, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.25);
}

.display {
  background:
    linear-gradient(180deg,
      rgba(255,255,255,0.05) 0px,
      rgba(255,255,255,0.00) 1px) top / 100% 1px no-repeat,
    var(--display-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--display-border);
  border-radius: var(--r-disp);
  padding: 18px 22px 16px;
  min-height: 108px;
  display: flex; flex-direction: column;
  align-items: flex-end; justify-content: flex-end;
  gap: 5px; overflow: hidden;
  box-shadow:
    inset 0 2px 12px rgba(0, 0, 0, 0.40),
    inset 0 1px 0 rgba(255,255,255,0.06);
}

.expression {
  font-size: 0.9rem; font-weight: 400;
  color: var(--text-dim);
  min-height: 1.35em;
  letter-spacing: 0.04em;
  word-break: break-all; text-align: right;
}

.result {
  font-size: 2.8rem; font-weight: 300;
  color: var(--text);
  letter-spacing: -0.03em; line-height: 1;
  word-break: break-all; text-align: right;
  transition: color 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result.pop {
  animation: resultPop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes resultPop {
  0%   { transform: scale(0.88); opacity: 0.7; }
  65%  { transform: scale(1.07); }
  100% { transform: scale(1);    opacity: 1;   }
}

.result.glow { color: #b4a9ff; }
.result.error { font-size: 1.55rem; color: #ff8585; }

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.btn {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem; font-weight: 500;
  color: var(--text);
  border: none;
  border-radius: var(--r-btn);
  cursor: pointer;
  height: 66px;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transition: transform var(--t), box-shadow var(--t), background var(--t);
}

.btn::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.14) 0%,
    rgba(255,255,255,0.00) 100%);
  border-radius: var(--r-btn) var(--r-btn) 0 0;
  pointer-events: none;
}

.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg,
    transparent 20%,
    rgba(255,255,255,0.12) 50%,
    transparent 80%);
  opacity: 0;
  transition: opacity var(--t);
  border-radius: inherit;
}
.btn:hover::after  { opacity: 1; }
.btn:active::after { opacity: 0; }

.btn-ripple {
  position: absolute;
  width: 80px; height: 80px;
  background: rgba(255,255,255,0.18);
  border-radius: 50%;
  transform: scale(0);
  animation: rippleBurst 0.5s ease-out forwards;
  pointer-events: none;
}
@keyframes rippleBurst {
  to { transform: scale(4); opacity: 0; }
}

.btn:focus-visible {
  outline: 2px solid rgba(180, 169, 255, 0.8);
  outline-offset: 3px;
}

.btn-wide { grid-column: span 2; }

.btn-number {
  background: var(--num-bg);
  border: 1px solid var(--num-border);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.10),
    0 2px 8px rgba(0,0,0,0.28);
}
.btn-number:hover {
  background: var(--num-hover);
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.14),
    0 6px 18px rgba(0,0,0,0.38);
}
.btn-number:active {
  transform: translateY(1px) scale(0.95);
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.30);
}

.btn-operator {
  background: var(--op-bg);
  border: 1px solid var(--op-border);
  color: var(--op-color);
  font-size: 1.3rem;
  box-shadow:
    inset 0 1px 0 rgba(160,140,255,0.18),
    0 2px 10px rgba(80,60,200,0.25);
}
.btn-operator:hover {
  background: var(--op-hover);
  color: #ddd5ff;
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(160,140,255,0.22),
    0 6px 20px rgba(80,60,200,0.35);
}
.btn-operator:active {
  transform: translateY(1px) scale(0.95);
}
.btn-operator.active-op {
  background: rgba(100, 80, 220, 0.36);
  box-shadow:
    inset 0 1px 0 rgba(200,180,255,0.20),
    0 0 0 2px rgba(160,140,255,0.50),
    0 4px 16px rgba(80,60,200,0.35);
}

.btn-utility {
  background: var(--util-bg);
  border: 1px solid var(--util-border);
  color: var(--util-color);
  font-size: 1.15rem;
  box-shadow:
    inset 0 1px 0 rgba(255,220,80,0.14),
    0 2px 8px rgba(140,90,0,0.22);
}
.btn-utility:hover {
  background: var(--util-hover);
  color: #ffe49a;
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255,220,80,0.18),
    0 6px 18px rgba(140,90,0,0.32);
}
.btn-utility:active {
  transform: translateY(1px) scale(0.95);
}

.btn-utility.wiggle { animation: wiggle 0.32s ease; }
@keyframes wiggle {
  0%  { transform: rotate(0deg); }
  20% { transform: rotate(-7deg) scale(1.08); }
  45% { transform: rotate(7deg) scale(1.08); }
  70% { transform: rotate(-4deg); }
  90% { transform: rotate(3deg); }
  100%{ transform: rotate(0deg); }
}

.btn-equals {
  background: linear-gradient(145deg, var(--eq-from), var(--eq-to));
  color: #fff;
  font-size: 1.45rem; font-weight: 600;
  border: 1px solid rgba(160, 120, 255, 0.30);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.20),
    0 4px 20px rgba(90, 30, 180, 0.50),
    0 1px 4px rgba(0,0,0,0.40);
  text-shadow: 0 1px 4px rgba(0,0,0,0.35);
}
.btn-equals:hover {
  background: linear-gradient(145deg, #6d28d9, #8b5cf6);
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.25),
    0 8px 28px rgba(90, 30, 180, 0.60),
    0 2px 6px rgba(0,0,0,0.40);
}
.btn-equals:active {
  transform: translateY(1px) scale(0.96);
  box-shadow:
    inset 0 2px 10px rgba(0,0,0,0.30),
    0 2px 10px rgba(90,30,180,0.40);
}

.btn-equals.boom { animation: boom 0.28s ease; }
@keyframes boom {
  0%  { transform: scale(1); }
  35% { transform: scale(0.90); }
  70% { transform: scale(1.10); }
  100%{ transform: scale(1); }
}

.confetti-particle {
  position: fixed; top: 50%; left: 50%;
  width: 9px; height: 9px;
  pointer-events: none; z-index: 999; opacity: 1;
  animation: confettiFall 1.1s ease-out forwards;
}
@keyframes confettiFall {
  0%   { transform: translate(0,0) rotate(0deg) scale(1);           opacity: 1; }
  100% { transform: translate(var(--dx),var(--dy)) rotate(var(--rot)) scale(0.3); opacity: 0; }
}

@media (max-width: 400px) {
  .calculator { padding: 16px; gap: 13px; }
  .btn { height: 56px; font-size: 1rem; border-radius: 13px; }
  .result { font-size: 2.3rem; }
  .buttons { gap: 8px; }
}

@media (min-width: 600px) {
  .calculator { max-width: 400px; padding: 26px; }
  .btn { height: 72px; }
  .result { font-size: 3.1rem; }
}
`;

export default function PrankCalculator() {
  const [state, setState] = useState({
    current: '',
    previous: '',
    operator: null as string | null,
    justEvaluated: false,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const equalsBtnRef = useRef<HTMLButtonElement>(null);
  const clearBtnRef = useRef<HTMLButtonElement>(null);

  // Load Razorpay dynamically
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  const handlePayment = () => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummykey123";
    const options = {
      key: keyId,
      amount: "50000", // ₹500
      currency: "INR",
      name: "SARTHI AI Calculator",
      description: "Sahi Jawab Ke Liye Paisa Do (Pay for the real answer)",
      image: "https://cdn-icons-png.flaticon.com/512/2844/2844364.png",
      handler: function (response: any) {
        alert(`Paise mil gaye! (Payment ID: ${response.razorpay_payment_id})\nPar answer fir bhi galat hi milega! 😂`);
      },
      prefill: {
        name: "User",
        email: "user@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#7c3aed"
      }
    };
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      alert("Razorpay SDK Loading... Please try again in a moment.");
    }
  };

  // Prank Engine logic
  const getPrankResult = (realResult: number) => {
    const base = Math.max(1, Math.abs(Math.round(realResult)));
    const strategies = [
      () => base + Math.floor(Math.random() * 7 + 2),
      () => base + Math.floor(Math.random() * 21 + 10),
      () => base * (Math.floor(Math.random() * 3 + 2)),
      () => {
        let s = String(base);
        if (s.length < 2) return base + Math.floor(Math.random() * 5 + 3);
        const i = Math.floor(Math.random() * (s.length - 1));
        const arr = s.split('');
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        const swapped = parseInt(arr.join(''), 10);
        return (isNaN(swapped) || swapped === base) ? base + 4 : Math.abs(swapped);
      },
      () => base + (Math.floor(Math.random() * 5 + 1)) * 5,
      () => Math.max(1, base - Math.floor(Math.random() * 6 + 1)),
      () => base * 2 + 1,
      () => Math.max(1, Math.round(base / 2) + Math.floor(Math.random() * 4 + 1)),
    ];

    const fn = strategies[Math.floor(Math.random() * strategies.length)];
    let prank = Math.abs(Math.round(fn()));
    const realRounded = Math.abs(Math.round(realResult));

    if (prank === realRounded) prank = realRounded + Math.floor(Math.random() * 4 + 2);
    if (!isFinite(prank) || prank < 1) prank = base + 3;

    return prank;
  };

  const formatNumber = (val: string | null | undefined) => {
    if (val === '' || val === null || val === undefined) return '0';
    if (isNaN(Number(val))) return val;
    if (String(val).endsWith('.') || /\.\d*0$/.test(String(val))) return String(val);
    const num = parseFloat(val);
    if (String(val).includes('.')) {
      const parts = String(val).split('.');
      if (parts[1] && parts[1].length > 10) return parseFloat(num.toPrecision(12)).toString();
    }
    if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) return num.toExponential(4);
    return String(val);
  };

  const operatorSymbol = (op: string | null) => {
    return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op || ''] || op;
  };

  const launchConfetti = () => {
    const colors = ['#818cf8', '#a78bfa', '#fcd34d'];
    const count = 20;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-particle';
      const angle = (i / count) * 360;
      const dist = 70 + Math.random() * 140;
      const dx = Math.cos((angle * Math.PI) / 180) * dist;
      const dy = Math.sin((angle * Math.PI) / 180) * dist - 90;
      el.style.setProperty('--dx', `${dx}px`);
      el.style.setProperty('--dy', `${dy}px`);
      el.style.setProperty('--rot', `${Math.random() * 600 - 300}deg`);
      el.style.background = colors[i % colors.length];
      el.style.width = `${5 + Math.random() * 7}px`;
      el.style.height = `${5 + Math.random() * 7}px`;
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }
  };

  const triggerAnimation = (ref: React.RefObject<HTMLElement | null>, className: string) => {
    if (ref.current) {
      ref.current.classList.remove(className);
      void ref.current.offsetWidth;
      ref.current.classList.add(className);
      setTimeout(() => {
        if (ref.current) ref.current.classList.remove(className);
      }, 1800);
    }
  };

  const inputDigit = useCallback((digit: string) => {
    setErrorMsg(null);
    setState((prev) => {
      if (prev.justEvaluated) {
        return { current: digit, previous: '', operator: null, justEvaluated: false };
      }
      if (prev.current.replace('.', '').replace('-', '').length >= 15) return prev;
      return { ...prev, current: prev.current + digit, justEvaluated: false };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setErrorMsg(null);
    setState((prev) => {
      if (prev.justEvaluated) {
        return { current: '0.', previous: '', operator: null, justEvaluated: false };
      }
      if (prev.current.includes('.')) return prev;
      return { ...prev, current: (prev.current === '' ? '0' : prev.current) + '.', justEvaluated: false };
    });
  }, []);

  const handleOperator = useCallback((op: string) => {
    setErrorMsg(null);
    setState((prev) => {
      let { current, previous, operator } = prev;

      if (operator && current !== '') {
        const a = parseFloat(previous);
        const b = parseFloat(current);
        let realResult = 0;
        switch (operator) {
          case '+': realResult = a + b; break;
          case '-': realResult = a - b; break;
          case '*': realResult = a * b; break;
          case '/': realResult = a / b; break;
        }
        previous = String(parseFloat(realResult.toPrecision(14)));
        current = '';
      } else if (current !== '') {
        previous = current;
        current = '';
      }

      return { current, previous, operator: op, justEvaluated: false };
    });
  }, []);

  const evaluate = useCallback(() => {
    setState((prev) => {
      if (!prev.operator || prev.previous === '') return prev;

      const a = parseFloat(prev.previous);
      const b = parseFloat(prev.current !== '' ? prev.current : prev.previous);

      let realResult;
      switch (prev.operator) {
        case '+': realResult = a + b; break;
        case '-': realResult = a - b; break;
        case '*': realResult = a * b; break;
        case '/':
          if (b === 0) {
            setErrorMsg("0 se divide? Pagal hai kya 😅");
            return { current: '', previous: '', operator: null, justEvaluated: true };
          }
          realResult = a / b;
          break;
        default: return prev;
      }

      realResult = parseFloat(realResult.toPrecision(14));
      const prankResult = getPrankResult(realResult);

      triggerAnimation(resultRef, 'pop');
      if (resultRef.current) resultRef.current.classList.add('glow');
      triggerAnimation(equalsBtnRef, 'boom');
      launchConfetti();

      return {
        current: String(prankResult),
        previous: `${a} ${operatorSymbol(prev.operator)} ${b} =`,
        operator: null,
        justEvaluated: true,
      };
    });
  }, []);

  const requestPaymentAndEvaluate = useCallback(() => {
    const { current, previous, operator } = state;
    if (!operator || previous === '') return;

    const a = parseFloat(previous);
    const b = parseFloat(current !== '' ? current : previous);

    let realResult = 0;
    switch (operator) {
      case '+': realResult = a + b; break;
      case '-': realResult = a - b; break;
      case '*': realResult = a * b; break;
      case '/':
        if (b === 0) {
          setErrorMsg("0 se divide? Pagal hai kya 😅");
          setState(prev => ({ ...prev, current: '', previous: '', operator: null, justEvaluated: true }));
          return;
        }
        realResult = a / b;
        break;
      default: return;
    }

    realResult = parseFloat(realResult.toPrecision(14));
    const prankResult = getPrankResult(realResult);
    const digitCount = String(prankResult).length;

    // Dynamic pricing based on digits: 1 digit = ₹1, 2 digits = ₹2, 3 digits = ₹5, each digit above 3 adds ₹5
    let amountInRupees = 1;
    if (digitCount === 2) {
      amountInRupees = 2;
    } else if (digitCount === 3) {
      amountInRupees = 5;
    } else if (digitCount > 3) {
      amountInRupees = 5 + (digitCount - 3) * 5;
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummykey123";
    const options = {
      key: keyId,
      amount: String(amountInRupees * 100), // in paise
      currency: "INR",
      name: "SARTHI AI Calculator",
      description: `Pay ₹${amountInRupees} to see the calculated result`,
      image: "https://cdn-icons-png.flaticon.com/512/2844/2844364.png",
      handler: function (response: any) {
        setState((prev) => {
          triggerAnimation(resultRef, 'pop');
          if (resultRef.current) resultRef.current.classList.add('glow');
          triggerAnimation(equalsBtnRef, 'boom');
          launchConfetti();

          return {
            current: String(prankResult),
            previous: `${a} ${operatorSymbol(prev.operator)} ${b} =`,
            operator: null,
            justEvaluated: true,
          };
        });
      },
      prefill: {
        name: "User",
        email: "user@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#7c3aed"
      }
    };

    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      alert("Razorpay SDK is loading, please try again in a moment!");
    }
  }, [state, evaluate]);

  const clear = useCallback(() => {
    setState({ current: '', previous: '', operator: null, justEvaluated: false });
    setErrorMsg(null);
    triggerAnimation(clearBtnRef, 'wiggle');
    if (resultRef.current) resultRef.current.classList.remove('glow');
  }, []);

  const backspace = useCallback(() => {
    setState((prev) => {
      if (prev.justEvaluated) return { current: '', previous: '', operator: null, justEvaluated: false };
      return { ...prev, current: prev.current.slice(0, -1) };
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const key = e.key;

      if (key >= '0' && key <= '9') inputDigit(key);
      else if (key === '.') inputDecimal();
      else if (key === '+') handleOperator('+');
      else if (key === '-') handleOperator('-');
      else if (key === '*' || key === 'x') handleOperator('*');
      else if (key === '/') { e.preventDefault(); handleOperator('/'); }
      else if (key === 'Enter' || key === '=') requestPaymentAndEvaluate();
      else if (key === 'Backspace') backspace();
      else if (key === 'Escape' || key.toLowerCase() === 'c') clear();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, handleOperator, requestPaymentAndEvaluate, backspace, clear]);

  const Button = ({ id, className, onClick, label, ariaLabel, btnRef }: any) => {
    const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.left = `${e.clientX - rect.left - 40}px`;
      ripple.style.top = `${e.clientY - rect.top - 40}px`;
      button.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });

      if (onClick) onClick();
    };

    return (
      <button
        id={id}
        ref={btnRef}
        className={`btn ${className}`}
        aria-label={ariaLabel}
        onClick={handlePress}
        onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.93) translateY(0)'; }}
        onPointerUp={(e) => { e.currentTarget.style.transform = ''; }}
        onPointerLeave={(e) => { e.currentTarget.style.transform = ''; }}
      >
        {label}
      </button>
    );
  };

  const displayVal = errorMsg ? errorMsg : (state.current !== '' ? state.current : (state.previous && !state.previous.includes('=') ? state.previous : '0'));

  return (
    <>
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />
      <style dangerouslySetInnerHTML={{ __html: calculatorStyles }} />

      <div className="calc-container">
        <div className="bg-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <main className="calculator-wrapper" style={{ flexDirection: 'column' }}>
          <div style={{
            marginBottom: '35px',
            padding: '20px 32px',
            borderRadius: '24px',
            backgroundColor: 'rgba(5, 8, 22, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            width: '100%',
            maxWidth: '440px',
            zIndex: 10,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <img src="/sarthi-logo.png" alt="SARTHI Logo" style={{ height: '48px', width: 'auto', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: '1.2' }}>
                  SARTHI AI Calculator
                </div>
                <div style={{ color: '#fcd34d', fontSize: '1.05rem', fontWeight: '700', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  🇺🇸 "America kya kehta tha..."
                </div>
              </div>
            </div>
          </div>

          <div className="calculator" role="main" aria-label="Calculator">

            <div className="display" aria-live="polite" aria-label="Calculator display">
              <div className="expression" id="expression" aria-label="Expression">
                {errorMsg ? '' : (state.operator && state.previous && !state.previous.includes('=')
                  ? `${state.previous} ${operatorSymbol(state.operator)}`
                  : state.previous.includes('=') ? state.previous : '')}
              </div>
              <div className={`result ${errorMsg ? 'error' : ''}`} id="result" ref={resultRef} aria-label="Result">
                {errorMsg ? displayVal : formatNumber(displayVal)}
              </div>
            </div>

            <div className="buttons" role="group" aria-label="Calculator buttons">
              <Button id="btn-clear" className="btn-utility btn-wide" onClick={clear} btnRef={clearBtnRef} label="Clear (C)" />
              <Button id="btn-backspace" className="btn-utility" onClick={backspace} label="⌫" />
              <Button id="btn-divide" className={`btn-operator ${state.operator === '/' ? 'active-op' : ''}`} onClick={() => handleOperator('/')} label="÷" />

              {['7', '8', '9'].map(n => <Button key={n} id={`btn-${n}`} className="btn-number" onClick={() => inputDigit(n)} label={n} />)}
              <Button id="btn-multiply" className={`btn-operator ${state.operator === '*' ? 'active-op' : ''}`} onClick={() => handleOperator('*')} label="×" />

              {['4', '5', '6'].map(n => <Button key={n} id={`btn-${n}`} className="btn-number" onClick={() => inputDigit(n)} label={n} />)}
              <Button id="btn-subtract" className={`btn-operator ${state.operator === '-' ? 'active-op' : ''}`} onClick={() => handleOperator('-')} label="−" />

              {['1', '2', '3'].map(n => <Button key={n} id={`btn-${n}`} className="btn-number" onClick={() => inputDigit(n)} label={n} />)}
              <Button id="btn-add" className={`btn-operator ${state.operator === '+' ? 'active-op' : ''}`} onClick={() => handleOperator('+')} label="+" />

              <Button id="btn-0" className="btn-number btn-wide" onClick={() => inputDigit('0')} label="0" />
              <Button id="btn-decimal" className="btn-number" onClick={inputDecimal} label="." />
              <Button id="btn-equals" className="btn-equals" onClick={requestPaymentAndEvaluate} btnRef={equalsBtnRef} label="=" />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
