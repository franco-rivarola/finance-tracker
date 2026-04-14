"use client";

import { useState } from "react";

type Props = {
  onChange: (
    month: string,
    range: { start: string; end: string } | null
  ) => void;
};

export default function DateFilter({ onChange }: Props) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [mode, setMode] = useState<"month" | "range">("month");
  const [month, setMonth] = useState(currentMonth);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <div className="space-y-4">

      {/* TABS */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setMode("month");
            onChange(currentMonth, null);
          }}
          className={`px-4 py-1 rounded-full text-sm ${
            mode === "month"
              ? "bg-[#FACC15] text-black"
              : "bg-zinc-800 text-[#FACC15] opacity-45"
          }`}
        >
          Mes
        </button>

        <button
          onClick={() => setMode("range")}
          className={`px-4 py-1 rounded-full text-sm ${
            mode === "range"
              ? "bg-[#FACC15] text-black"
              : "bg-zinc-800 text-[#FACC15] opacity-45"
          }`}
        >
          Rango
        </button>
      </div>

      {/* INPUTS */}
      {mode === "month" ? (
        <input
          type="month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            onChange(e.target.value, null);
          }}
          className="bg-zinc-800  text-white px-3 py-2 rounded-xl"
        />
      ) : (
        <div className="flex gap-3 flex-wrap">
          <input
            type="date"
            onChange={(e) => setStart(e.target.value)}
            className="bg-zinc-800 px-3 py-2 text-white rounded-xl"
          />

          <input
            type="date"
            onChange={(e) => setEnd(e.target.value)}
            className="bg-zinc-800 text-white px-3 py-2 rounded-xl"
          />

          <button
            onClick={() => start && end && onChange("", { start, end })}
            className="rounded-xl bg-[#FACC15] px-4 font-semibold text-black"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
