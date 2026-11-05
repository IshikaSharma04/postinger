"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

interface StepDef {
  label: string;
  sub: string;
  done: boolean;
  href?: string;
  onClick?: () => void;
}

interface FirstStepsChecklistProps {
  steps: StepDef[];
}

function StepCard({ step }: { step: StepDef }) {
  const cls = `p-4 rounded-2xl border transition-all flex items-start gap-3 ${
    step.done
      ? "border-emerald-200 bg-emerald-50/30"
      : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
  }`;
  const inner = (
    <>
      {step.done
        ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        : <Circle className="w-5 h-5 text-zinc-300 flex-shrink-0 mt-0.5" />}
      <div>
        <h4 className="font-bold text-xs text-zinc-900">{step.label}</h4>
        <p className="text-[11px] text-zinc-500 mt-0.5">{step.sub}</p>
      </div>
    </>
  );
  return step.href ? (
    <Link href={step.href} onClick={step.onClick} className={cls}>{inner}</Link>
  ) : (
    <div onClick={step.onClick} className={`${cls} cursor-pointer`}>{inner}</div>
  );
}

export function FirstStepsChecklist({ steps }: FirstStepsChecklistProps) {
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-zinc-900">First Steps</h3>
          <p className="text-xs text-zinc-500">Get up and running with your Postinger workspace</p>
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          {doneCount} / {steps.length} Completed
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((step) => <StepCard key={step.label} step={step} />)}
      </div>
    </div>
  );
}
