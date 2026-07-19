/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { TrendingUp, Activity, Landmark, Percent } from "lucide-react";

export default function Header() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }) + " - " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header id="header-container" className="bg-white border-b border-slate-200 text-slate-900 shadow-sm">
      <div id="main-header" className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div id="header-branding" className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-100">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 id="app-title" className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 font-sans flex items-center gap-2">
              Kalkulator Saham <span className="text-indigo-600">Komprehensif</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Satu-satunya alat analisis finansial terlengkap untuk Trading, Investasi, &amp; Aksi Korporasi
            </p>
          </div>
        </div>

        <div id="header-time" className="text-center md:text-right">
          <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 text-xs py-1.5 px-3 rounded-lg font-mono font-medium">
            {currentTime || "Memuat waktu..."}
          </span>
        </div>
      </div>
    </header>
  );
}
