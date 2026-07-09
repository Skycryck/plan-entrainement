/* ===== Dashboard plan vélo — parse suivi/*.md côté navigateur =====
 * Source de vérité : suivi/journal.md (+ tests.md, indicateurs.md, plan/02-zones.md).
 * Format attendu des séances : "- [x] **S{n}-{A|B|C}** (date) — note"
 */

"use strict";

const YEAR = 2026;
const PLAN_START = new Date(YEAR, 5, 8); // lundi de S1
const TOTAL_WEEKS = 24;
const WEIGHT_KG = 62;
const VOLT = "#c3f53c";
const VOLT_DIM = "#86b32f";
const MUTED = "#8494a6";
const FAINT = "#55657a";
const RED = "#ff6b6b";
const AMBER = "#ffd166";
const GRID = "rgba(132, 148, 166, 0.12)";

const DAYS_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

/* ---------- utilitaires ---------- */

const $ = (id) => document.getElementById(id);

function fmtNum(n, dec = 0) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: dec });
}

function fmtDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${DAYS_FR[d.getDay()]} ${dd}/${mm}`;
}

function parseDayMonth(str) {
  if (!str) return null;
  const m = str.match(/(\d{1,2})\/(\d{1,2})/);
  if (!m) return null;
  return new Date(YEAR, +m[2] - 1, +m[1]);
}

function parseFrFloat(s) {
  return parseFloat(String(s).replace(/\s/g, "").replace(",", "."));
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mdInline(s) {
  return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function stripMd(s) {
  return s.replace(/\*\*/g, "");
}

async function fetchText(path) {
  const res = await fetch(`${path}?v=${Date.now()}`);
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.text();
}

/* ---------- parsers ---------- */

function parseJournal(md) {
  const rides = [];
  const runs = [];
  const weeks = {}; // n → { phase, phaseName, recup, range }
  let section = "velo";
  let phase = null;
  let phaseName = "";

  for (const line of md.split(/\r?\n/)) {
    let m;
    if (/^## Course à pied/.test(line)) { section = "run"; continue; }
    if ((m = line.match(/^## Phase (\d)\s*—\s*(.+)$/))) { phase = +m[1]; phaseName = m[2].trim(); continue; }
    if (/^## Coupure/.test(line)) { phase = 0; phaseName = "Coupure"; continue; }
    if ((m = line.match(/^### Semaine (\d+) \(([^)]+)\)(.*)$/))) {
      weeks[+m[1]] = { phase, phaseName, range: m[2], recup: m[3].includes("🌿") };
      continue;
    }
    m = line.match(/^- \[( |x)\] \*\*S(\d+)(?:-([A-Z]))?\*\*\s*(?:\(([^)]*)\))?\s*—\s*(.*)$/);
    if (!m) continue;
    const item = {
      done: m[1] === "x",
      week: +m[2],
      slot: m[3] || null,
      date: parseDayMonth(m[4]),
      text: m[5].trim(),
      kind: section === "run" ? "run" : (m[3] ? "ride" : "coupure"),
    };
    (section === "run" ? runs : rides).push(item);
  }
  return { rides, runs, weeks };
}

function tableRows(md, sectionTitle) {
  // Retourne les lignes "| a | b |..." (hors en-tête/séparateur) de la 1re table après le titre.
  const idx = sectionTitle ? md.indexOf(sectionTitle) : 0;
  if (idx < 0) return [];
  const lines = md.slice(idx).split(/\r?\n/);
  const rows = [];
  let inTable = false;
  for (const line of lines) {
    if (/^\|/.test(line)) {
      inTable = true;
      if (/^\|[\s:-]+\|/.test(line.replace(/-/g, "-"))) {
        if (/^[\|\s:-]+$/.test(line)) continue; // séparateur
      }
      rows.push(line.split("|").slice(1, -1).map((c) => c.trim()));
    } else if (inTable) break;
  }
  return rows.filter((r) => !/^-+$/.test(r[0] || "-") && r.some((c) => /-{3,}/.test(c)) === false);
}

function parseTests(md) {
  const ftpTests = [];
  for (const r of tableRows(md, "## Tests FTP")) {
    const date = r[0] && r[0].match(/\d{2}\/\d{2}\/\d{4}/);
    if (!date) continue;
    const ftp = (r[3] || "").match(/(\d+)\s*W/);
    const wkg = parseFrFloat(r[4] || "");
    ftpTests.push({
      date: date[0],
      week: r[1],
      ftp: ftp ? +ftp[1] : null,
      wkg: isNaN(wkg) ? null : wkg,
    });
  }
  const chronos = [];
  let chronoTarget = null;
  for (const r of tableRows(md, "## Chronos boucle")) {
    if (r[0] === "Date") continue;
    const hasDate = /\d{2}\/\d{2}\/\d{4}/.test(r[0] || "");
    if (r[2]) chronos.push({ date: r[0], week: r[1], time: r[2], speed: r[3] });
    else if (hasDate && !chronoTarget) chronoTarget = r[0].match(/(\d{2}\/\d{2})/)[1]; // date cible planifiée
  }
  return { ftpTests, chronos, chronoTarget };
}

function parseIndicateurs(md) {
  const speeds = [];
  for (const r of tableRows(md, "## 1. Vitesse")) {
    const date = (r[0] || "").match(/\d{2}\/\d{2}\/\d{4}/);
    const sp = (r[2] || "").match(/([\d,.]+)\s*km\/h/);
    if (!date || !sp) continue;
    speeds.push({ date: date[0], value: parseFrFloat(sp[1]), notes: stripMd(r[3] || "") });
  }
  const drifts = [];
  for (const r of tableRows(md, "## 2. Dérive")) {
    const date = (r[0] || "").match(/\d{2}\/\d{2}\/\d{4}/);
    const dm = (r[4] || "").match(/(\d+(?:[.,]\d+)?)(?:\s*-\s*(\d+(?:[.,]\d+)?))?\s*%/);
    if (!date || !dm) continue;
    const v1 = parseFrFloat(dm[1]);
    const v2 = dm[2] ? parseFrFloat(dm[2]) : v1;
    drifts.push({ date: date[0], value: (v1 + v2) / 2, label: dm[0], notes: stripMd(r[5] || "") });
  }
  const paliers = [];
  for (const r of tableRows(md, "## 3. Progression distance")) {
    const km = (r[0] || "").match(/(\d+)\s*km/);
    if (!km) continue;
    paliers.push({ km: +km[1], validated: /\d{2}\/\d{2}\/\d{4}/.test(r[1] || "") });
  }
  return { speeds, drifts, paliers };
}

function parseZones(md) {
  const ftpMatch = md.match(/FTP (\d+)\s*W/);
  const zones = [];
  for (const r of tableRows(md, "| Zone |")) {
    if (!r[0] || r[0] === "Zone") continue;
    zones.push({ name: r[0], pct: r[1], watts: r[2], fc: r[3], feel: r[4] });
  }
  return { ftp: ftpMatch ? +ftpMatch[1] : null, zones };
}

/* ---------- statuts & stats ---------- */

function statusOf(item, today) {
  if (item.done) return "done";
  if (item.kind === "coupure") return "coupure";
  if (item.date && item.date < today) return item.kind === "run" ? "skipped" : "missed";
  return "upcoming";
}

function rideMetrics(text) {
  const km = text.match(/(\d+(?:[.,]\d+)?)\s*km\b/i);
  const dplus = text.match(/(\d[\d\s]*)\s*m D\+/);
  const fc = text.match(/FC\s*moy\s*\**(\d+)/i);
  const dur = text.match(/(\d+)h(\d{1,2})?/);
  return {
    km: km ? parseFrFloat(km[1]) : null,
    dplus: dplus ? parseInt(dplus[1].replace(/\s/g, ""), 10) : null,
    fc: fc ? +fc[1] : null,
    hours: dur ? +dur[1] + (dur[2] ? +dur[2] / 60 : 0) : null,
  };
}

function computeStats(journal, today) {
  const rides = journal.rides.filter((s) => s.kind === "ride");
  for (const s of rides) {
    s.status = statusOf(s, today);
    s.metrics = s.done ? rideMetrics(s.text) : {};
  }
  for (const s of journal.runs) s.status = statusOf(s, today);

  const sorted = [...rides].sort((a, b) => a.date - b.date);
  const past = sorted.filter((s) => s.status === "done" || s.status === "missed");
  const done = past.filter((s) => s.status === "done");

  // séries (consécutives, vélo uniquement)
  let cur = 0, best = 0, run = 0;
  for (const s of past) {
    run = s.status === "done" ? run + 1 : 0;
    best = Math.max(best, run);
  }
  cur = run;

  // par phase
  const byPhase = {};
  for (const s of rides) {
    const ph = (journal.weeks[s.week] || {}).phase;
    if (!ph) continue; // coupure exclue
    byPhase[ph] ??= { done: 0, due: 0, total: 0 };
    byPhase[ph].total++;
    if (s.status === "done") { byPhase[ph].done++; byPhase[ph].due++; }
    else if (s.status === "missed") byPhase[ph].due++;
  }

  const doneAll = [...done, ...journal.runs.filter((s) => s.status === "done")];

  return {
    rides, sorted, past, done, byPhase,
    total: rides.length,
    regularity: past.length ? done.length / past.length : 1,
    streak: cur,
    bestStreak: best,
    totalKm: done.reduce((a, s) => a + (s.metrics.km || 0), 0),
    totalDplus: done.reduce((a, s) => a + (s.metrics.dplus || 0), 0),
    totalHours: done.reduce((a, s) => a + (s.metrics.hours || 0), 0),
    maxKm: done.reduce((a, s) => Math.max(a, s.metrics.km || 0), 0),
    maxDplus: done.reduce((a, s) => Math.max(a, s.metrics.dplus || 0), 0),
    feed: doneAll.sort((a, b) => b.date - a.date).slice(0, 5),
    nextSession: sorted.find((s) => s.status === "upcoming"),
  };
}

function currentWeekNum(today) {
  const w = Math.floor((today - PLAN_START) / (7 * 864e5)) + 1;
  return Math.min(Math.max(w, 1), TOTAL_WEEKS);
}

function coachMessage(ctx) {
  const d = ctx.lastDrift;
  if (ctx.weekInfo?.phase === 0)
    return "Coupure assumée : la rando, c'est de la charge aussi. Le vélo t'attend, et il te retrouvera plus fort.";
  if (ctx.weekInfo?.recup)
    return "Semaine de récup : c'est au repos que le corps encaisse les watts. Lever le pied fait partie du plan.";
  if (d != null && d < 5)
    return `Dérive cardiaque ~${fmtNum(d, 1)} % sur ta dernière longue : le foncier s'installe, sortie après sortie.`;
  if (ctx.regularity >= 0.9)
    return "La régularité est là — exactement le muscle que tu voulais construire. Continue de cocher.";
  return "Chaque séance cochée est une brique. Le plan fait le reste.";
}

/* ---------- rendu ---------- */

function renderHero(stats, journal, today, tests, indic) {
  const week = currentWeekNum(today);
  const weekInfo = journal.weeks[week] || {};
  $("hero-week").textContent = week;
  $("hero-phase").textContent = weekInfo.phase === 0
    ? "🥾 Coupure — rando itinérante"
    : `Phase ${weekInfo.phase || "?"} — ${weekInfo.phaseName || ""}${weekInfo.recup ? " · 🌿 récup" : ""}`;

  const lastCleanDrift = [...indic.drifts].reverse().find((x) => !/surévaluée|chaleur/i.test(x.notes));
  $("coach-msg").textContent = coachMessage({
    weekInfo,
    regularity: stats.regularity,
    lastDrift: lastCleanDrift ? lastCleanDrift.value : null,
  });

  const next = stats.nextSession;
  if (next) {
    const label = stripMd(next.text.split(" — ")[0]).slice(0, 90);
    $("next-session").innerHTML =
      `Prochaine séance : <strong>S${next.week}-${next.slot}</strong> · ${fmtDate(next.date)} — ${escapeHtml(label)}`;
  }

  // anneau = séances vélo faites / total plan
  const pct = stats.done.length / stats.total;
  $("ring-pct").textContent = `${Math.round(pct * 100)}%`;
  $("ring-sub").textContent = `${stats.done.length}/${stats.total} séances vélo`;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      $("ring-fill").style.strokeDashoffset = (527.8 * (1 - pct)).toFixed(1);
    })
  );

  const ftp = tests.ftpTests.filter((t) => t.ftp).at(-1);
  const streakHtml = stats.streak > 0
    ? `${stats.streak} <span class="unit">🔥</span>`
    : `${stats.bestStreak} <span class="unit">record</span>`;
  const cards = [
    { v: streakHtml, l: stats.streak > 0 ? "série en cours" : "série — à relancer !", sub: stats.streak > 0 ? `record : ${stats.bestStreak}` : "meilleure série de séances d'affilée" },
    { v: `${Math.round(stats.regularity * 100)} <span class="unit">%</span>`, l: "régularité", sub: `${stats.done.length}/${stats.past.length} séances passées` },
    { v: `${fmtNum(stats.totalKm, 0)} <span class="unit">km</span>`, l: "depuis le 8 juin", sub: `${fmtNum(stats.totalDplus)} m D+ · ${fmtNum(stats.totalHours, 0)} h` },
    { v: ftp ? `${ftp.ftp} <span class="unit">W</span>` : "–", l: "FTP", sub: ftp ? `${fmtNum(ftp.ftp / WEIGHT_KG, 2)} W/kg · réelle probable 165-175` : "" },
  ];
  $("hero-stats").innerHTML = cards.map((c) =>
    `<div class="stat"><div class="stat-value">${c.v}</div><div class="stat-label">${c.l}</div><div class="stat-sub">${c.sub}</div></div>`
  ).join("");
}

function renderRegularite(stats, journal, today) {
  const week = currentWeekNum(today);
  const pills = [1, 2, 3, 4].map((ph) => {
    const p = stats.byPhase[ph];
    if (!p || !p.due) return `<span class="phase-pill">Phase ${ph} · <strong>à venir</strong></span>`;
    const pct = Math.round((p.done / p.due) * 100);
    return `<span class="phase-pill ${pct >= 90 ? "ok" : ""}">Phase ${ph} · <strong>${p.done}/${p.due} · ${pct} %</strong></span>`;
  });
  $("reg-top").innerHTML =
    `<div class="reg-main volt">${Math.round(stats.regularity * 100)}<span class="unit"> %</span></div>` +
    `<div class="reg-objective">objectif ≥ 90 % — séance ratée = pas de rattrapage, on avance</div>` +
    pills.join("");

  // heatmap : lignes A / B / C (+ bonus D, E… si présents) / footing, colonnes S1..S24
  const bySlot = {};
  for (const s of stats.rides) bySlot[`${s.week}-${s.slot}`] = s;
  const runByWeek = {};
  for (const r of journal.runs) runByWeek[r.week] = r;

  const extraSlots = [...new Set(stats.rides.map((s) => s.slot).filter((sl) => sl > "C"))].sort();
  const slots = ["A", "B", "C", ...extraSlots];
  $("heatmap").style.setProperty("--hm-rows", slots.length + 1);

  const baseLabels = ["A · HT", "B · qualité", "C · longue", ...extraSlots.map((sl) => `${sl} · bonus`), "🏃 option"];
  let html = `<div class="hm-labels"><span></span>${baseLabels.map((l) => `<span>${l}</span>`).join("")}</div>`;
  let prevPhase = null;
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const info = journal.weeks[w] || {};
    const phaseStart = prevPhase !== null && info.phase !== prevPhase;
    prevPhase = info.phase;
    const head = `${info.recup ? "🌿" : ""}S${w}`;
    let cells = "";
    for (const slot of slots) {
      if (info.phase === 0) {
        cells += slot <= "C"
          ? `<div class="cell coupure" title="S${w} — coupure vélo (vacances + rando)"></div>`
          : `<div class="cell none"></div>`;
        continue;
      }
      const s = bySlot[`${w}-${slot}`];
      if (!s) { cells += `<div class="cell none"></div>`; continue; }
      const tip = `S${w}-${slot}${s.date ? " · " + fmtDate(s.date) : ""} — ${stripMd(s.text).slice(0, 110)}`;
      cells += `<div class="cell ${s.status}" title="${escapeHtml(tip)}"></div>`;
    }
    const r = runByWeek[w];
    if (r) {
      const cls = r.status === "done" ? "run-done" : r.status === "skipped" ? "run-skipped" : "upcoming";
      cells += `<div class="cell ${cls}" title="${escapeHtml(`Footing S${w}${r.date ? " · " + fmtDate(r.date) : ""} — ${stripMd(r.text).slice(0, 90)}`)}"></div>`;
    } else {
      cells += `<div class="cell none"></div>`;
    }
    html += `<div class="hm-col ${w === week ? "current" : ""} ${phaseStart ? "phase-start" : ""}"><div class="hm-head">${head}</div>${cells}</div>`;
  }
  $("heatmap").innerHTML = html;

  $("heatmap-legend").innerHTML = [
    `<span><span class="cell done"></span> faite</span>`,
    `<span><span class="cell missed"></span> ratée</span>`,
    `<span><span class="cell upcoming"></span> à venir</span>`,
    `<span><span class="cell coupure"></span> coupure 🥾</span>`,
    `<span><span class="cell run-done"></span> footing fait</span>`,
    `<span><span class="cell run-skipped"></span> footing zappé (optionnel)</span>`,
  ].join("");

  // scroll jusqu'à la semaine courante sur mobile
  const col = document.querySelector(".hm-col.current");
  if (col) col.scrollIntoView({ block: "nearest", inline: "center" });
  window.scrollTo(0, 0);
}

function isoWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = date.getTime();
  date.setUTCMonth(0, 1);
  if (date.getUTCDay() !== 4) date.setUTCMonth(0, 1 + ((4 - date.getUTCDay()) + 7) % 7);
  return 1 + Math.round((firstThursday - date.getTime()) / 604800000);
}

const YEAR_COLORS = { 2022: "#7c86ff", 2023: "#f1607e", 2024: "#e8c94a", 2025: "#3fbfae" };

function renderYearsChart(history, stats, today) {
  if (!history) { $("years-card").classList.add("hidden"); return; }
  const labels = Array.from({ length: 53 }, (_, i) => i + 1);
  const snapshotDate = new Date(history.snapshot + "T00:00:00");
  const curWeek = isoWeek(today);
  const datasets = [];

  for (const [year, weekly] of Object.entries(history.years)) {
    const isCurrent = +year === today.getFullYear();
    // année en cours : le snapshot Strava est prolongé en direct par le journal
    const merged = { ...weekly };
    if (isCurrent) {
      for (const s of stats.done) {
        if (s.date > snapshotDate && s.metrics.km) {
          const w = isoWeek(s.date);
          merged[w] = (merged[w] || 0) + s.metrics.km;
        }
      }
    }
    let cum = 0;
    const data = labels.map((w) => {
      cum += merged[w] || 0;
      return (isCurrent && w > curWeek) ? null : Math.round(cum);
    });
    datasets.push({
      label: year,
      data,
      borderColor: isCurrent ? VOLT : YEAR_COLORS[year] || FAINT,
      backgroundColor: isCurrent ? VOLT : YEAR_COLORS[year] || FAINT,
      borderWidth: isCurrent ? 3 : 1.5,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.2,
      ...(isCurrent ? {} : { borderColor: (YEAR_COLORS[year] || FAINT) + "99" }),
    });
    // ligne de niveau : où en est l'année en cours vs les autres années
    if (isCurrent) {
      const level = data[Math.min(curWeek, 53) - 1];
      datasets.push({
        label: "",
        data: labels.map(() => level),
        borderColor: VOLT + "55",
        borderDash: [6, 6],
        borderWidth: 1.2,
        pointRadius: 0,
        pointHoverRadius: 0,
      });
    }
  }

  new Chart($("yearsChart"), {
    type: "line",
    data: { labels, datasets },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: { min: 0, ticks: { callback: (v) => fmtNum(v) + " km" } },
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 14, maxRotation: 0, callback: (v, i) => "S" + labels[i] },
        },
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            usePointStyle: true, pointStyle: "circle", boxHeight: 6,
            filter: (item) => item.text !== "",
          },
        },
        tooltip: {
          filter: (i) => i.dataset.label !== "",
          itemSort: (a, b) => b.parsed.y - a.parsed.y,
          callbacks: {
            title: (items) => items.length ? `Semaine ${items[0].label}` : "",
            label: (i) => ` ${i.dataset.label} : ${fmtNum(i.parsed.y)} km`,
          },
        },
      },
    },
  });
}

function chartDefaults() {
  Chart.defaults.font.family = "Inter, sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = MUTED;
  Chart.defaults.borderColor = GRID;
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.plugins.tooltip.backgroundColor = "#141c25";
  Chart.defaults.plugins.tooltip.borderColor = "#1d2733";
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleColor = "#e8eef4";
  Chart.defaults.plugins.tooltip.bodyColor = MUTED;
  Chart.defaults.plugins.tooltip.padding = 10;
}

function bandDatasets(labels, low, high) {
  return [
    { data: labels.map(() => high), pointRadius: 0, borderWidth: 0, fill: false },
    {
      data: labels.map(() => low), pointRadius: 0, borderWidth: 0,
      fill: "-1", backgroundColor: "rgba(195, 245, 60, 0.07)",
    },
  ];
}

function renderCharts(stats, journal, tests, indic) {
  chartDefaults();

  // --- FTP ---
  const ftpSlots = [
    { label: "S1 · 11/06", key: "S1" },
    { label: "S8 · 28/07", key: "S8" },
    { label: "S16 · 22/09", key: "S16" },
  ];
  const ftpData = ftpSlots.map((slot) => {
    const t = tests.ftpTests.find((x) => x.ftp && (x.week || "").startsWith(slot.key));
    return t ? t.ftp : null;
  });
  const ftpLabels = ftpSlots.map((s) => s.label);
  new Chart($("ftpChart"), {
    type: "line",
    data: {
      labels: ftpLabels,
      datasets: [
        ...bandDatasets(ftpLabels, 165, 175),
        {
          data: ftpData, borderColor: VOLT, backgroundColor: VOLT,
          pointRadius: 6, pointHoverRadius: 8, borderWidth: 2.5, spanGaps: true,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: { min: 140, max: 190, ticks: { callback: (v) => v + " W" } },
        x: { grid: { display: false } },
      },
      plugins: {
        tooltip: {
          filter: (i) => i.datasetIndex === 2,
          callbacks: { label: (i) => ` ${i.parsed.y} W · ${fmtNum(i.parsed.y / WEIGHT_KG, 2)} W/kg` },
        },
      },
    },
  });

  // --- Vitesse @135 bpm ---
  const spLabels = indic.speeds.map((s) => s.date.slice(0, 5));
  new Chart($("speedChart"), {
    type: "line",
    data: {
      labels: spLabels,
      datasets: [
        ...bandDatasets(spLabels, 27, 29),
        {
          data: indic.speeds.map((s) => s.value),
          borderColor: VOLT, backgroundColor: VOLT, tension: 0.35,
          pointRadius: 5, pointHoverRadius: 7, borderWidth: 2.5,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: { min: 20, max: 30, ticks: { callback: (v) => v + " km/h" } },
        x: { grid: { display: false } },
      },
      plugins: {
        tooltip: {
          filter: (i) => i.datasetIndex === 2,
          callbacks: {
            label: (i) => ` ${fmtNum(i.parsed.y, 1)} km/h`,
            afterLabel: (i) => (indic.speeds[i.dataIndex].notes || "").slice(0, 70),
          },
        },
      },
    },
  });

  // --- Dérive cardiaque ---
  new Chart($("driftChart"), {
    type: "bar",
    data: {
      labels: indic.drifts.map((d) => d.date.slice(0, 5)),
      datasets: [
        {
          type: "line",
          data: indic.drifts.map(() => 5),
          borderColor: FAINT, borderDash: [5, 5], borderWidth: 1.5, pointRadius: 0,
        },
        {
          data: indic.drifts.map((d) => d.value),
          backgroundColor: indic.drifts.map((d) => (d.value < 5 ? VOLT : d.value <= 8 ? AMBER : RED)),
          borderRadius: 6, maxBarThickness: 46,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, suggestedMax: 15, ticks: { callback: (v) => v + " %" } },
        x: { grid: { display: false } },
      },
      plugins: {
        tooltip: {
          filter: (i) => i.datasetIndex === 1,
          callbacks: {
            label: (i) => ` dérive ${indic.drifts[i.dataIndex].label}`,
            afterLabel: (i) => (indic.drifts[i.dataIndex].notes || "").slice(0, 90),
          },
        },
      },
    },
  });

  // --- Sorties longues : plan vs réalisé ---
  const labels = [], planned = [], realized = [];
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    labels.push("S" + w);
    const c = stats.rides.find((s) => s.week === w && s.slot === "C");
    let p = null, r = null;
    if (c) {
      const km = c.text.match(/~?(\d+)(?:-(\d+))?\s*km/i);
      if (c.done) r = c.metrics.km;
      else if (km) p = km[2] ? (+km[1] + +km[2]) / 2 : +km[1];
    }
    planned.push(p);
    realized.push(r);
  }
  new Chart($("longChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          type: "line", data: planned, borderColor: FAINT, borderDash: [5, 4],
          borderWidth: 1.5, pointRadius: 2, pointBackgroundColor: FAINT, spanGaps: true,
        },
        { data: realized, backgroundColor: VOLT, borderRadius: 4, maxBarThickness: 22 },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, suggestedMax: 160, ticks: { callback: (v) => v + " km" } },
        x: { grid: { display: false }, ticks: { autoSkip: true, maxRotation: 0 } },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (i) => i.datasetIndex === 1
              ? ` réalisé : ${fmtNum(i.parsed.y, 1)} km`
              : ` objectif : ~${fmtNum(i.parsed.y, 0)} km`,
          },
        },
      },
    },
  });

  // --- barre objectif vitesse ---
  const last = indic.speeds.at(-1);
  const first = indic.speeds[0];
  const MIN = 22, MAX = 30;
  const pos = last ? ((last.value - MIN) / (MAX - MIN)) * 100 : 0;
  $("objective-bar").innerHTML = `
    <div class="obj-track">
      <div class="obj-marker" style="left:${pos.toFixed(1)}%">
        <span class="obj-marker-label">${last ? fmtNum(last.value, 1) : "–"} km/h</span>
      </div>
    </div>
    <div class="obj-scale"><span>${MIN}</span><span>départ 24-25</span><span class="volt">cible 27-29</span><span>${MAX}</span></div>
    <p class="obj-note">Vitesse à ~135 bpm (effort constant) — départ ${first ? fmtNum(first.value, 1) : "?"} km/h le ${first ? first.date.slice(0, 5) : ""}, dernier relevé ${last ? fmtNum(last.value, 1) : "?"} km/h. Le vrai juge de paix : la même FC, plus vite.</p>`;
}

function renderMilestones(tests, today) {
  const items = [
    {
      icon: "⏱️", label: "Chrono initial — boucle de réf. (42,9 km)",
      date: tests.chronoTarget,
      sub: tests.chronoTarget ? "à l'aube, GPX figé — décalé ≠ raté" : "dès un matin frais + sommeil récupéré",
      hide: tests.chronos.length > 0,
      pending: !tests.chronoTarget,
    },
    { icon: "📈", label: "Retest FTP (S8)", date: "28/07", sub: "partir à ~165 W, régulier" },
    { icon: "🥾", label: "Coupure — vacances & rando itinérante", date: "24/08", sub: "129 km · 3 500 m D+ à pied" },
    { icon: "🚴", label: "Reprise vélo (S15)", date: "15/09", sub: "en douceur, jambes post-rando" },
    { icon: "📈", label: "Retest FTP post-coupure (S16)", date: "22/09", sub: "recalibrage des zones" },
    { icon: "⭐", label: "Première 130 km (S19)", date: "18/10", sub: "la plus longue du plan… avant la suivante" },
    { icon: "⭐", label: "Objectif 150 km+ (S21)", date: "01/11", sub: "60-90 g de glucides / h" },
    { icon: "⏱️", label: "Test final — boucle de réf. (S23)", date: "13/11", sub: "le verdict du chrono" },
    { icon: "🏆", label: "Sortie objectif 150 km+ (S24)", date: "22/11", sub: "la ligne d'arrivée du plan" },
  ];
  let firstDated = true;
  const html = items.map((it) => {
    if (it.hide) return ""; // chrono déjà fait → masqué
    let count = "";
    let cls = "";
    if (it.date) {
      const d = parseDayMonth(it.date);
      const days = Math.ceil((d - today) / 864e5);
      if (days < 0) return "";
      count = days === 0 ? "aujourd'hui" : `J-${days}`;
      if (firstDated) { cls = "next"; firstDated = false; }
    } else if (it.pending) {
      count = "météo 🎲";
    }
    return `<li class="${cls}"><span class="ms-icon">${it.icon}</span><span class="ms-label">${it.label}<span class="ms-sub">${it.sub}</span></span><span class="ms-count">${count}</span></li>`;
  }).join("");
  $("milestones").innerHTML = html;
}

function renderBadges(stats, tests, indic) {
  const ftp = tests.ftpTests.filter((t) => t.ftp).at(-1);
  const bestSpeed = indic.speeds.reduce((a, s) => Math.max(a, s.value), 0);
  const bestDrift = indic.drifts.reduce((a, d) => Math.min(a, d.value), Infinity);
  const badges = [
    { icon: "🛣️", title: `${fmtNum(stats.maxKm, 1)} km`, sub: "plus longue sortie", ok: stats.maxKm > 0 },
    { icon: "⛰️", title: `${fmtNum(stats.maxDplus)} m D+`, sub: "plus gros dénivelé", ok: stats.maxDplus > 0 },
    { icon: "⚡", title: ftp ? `FTP ${ftp.ftp} W` : "FTP", sub: "test du 11/06", ok: !!ftp },
    { icon: "🎯", title: "Dérive < 5 %", sub: bestDrift < 5 ? `${fmtNum(bestDrift, 1)} % le 28/06 — foncier solide` : "sur une longue propre", ok: bestDrift < 5 },
    { icon: "💨", title: `${fmtNum(bestSpeed, 1)} km/h @ Z2`, sub: "record vitesse à ~135 bpm", ok: bestSpeed > 0 },
    { icon: "🔥", title: `Série de ${stats.bestStreak}`, sub: "séances d'affilée sans trou", ok: stats.bestStreak >= 5 },
    { icon: "💯", title: "Premier 100 km", sub: "à débloquer", ok: stats.maxKm >= 100 },
    { icon: "🏔️", title: "130 km", sub: "prévu S19 · 18/10", ok: stats.maxKm >= 130 },
    { icon: "👑", title: "150 km", sub: "prévu S21 · 01/11", ok: stats.maxKm >= 150 },
    { icon: "🚀", title: "FTP ≥ 165 W", sub: "retest S8 ou S16", ok: !!ftp && ftp.ftp >= 165 },
    { icon: "⏱️", title: "Boucle chronométrée", sub: "chrono initial à poser", ok: tests.chronos.length > 0 },
    { icon: "🎖️", title: "27 km/h @ Z2", sub: "l'objectif final", ok: bestSpeed >= 27 },
  ];
  $("badges").innerHTML = badges.map((b) =>
    `<div class="badge ${b.ok ? "unlocked" : "locked"}"><div class="b-icon">${b.ok ? b.icon : "🔒"}</div><div class="b-title">${b.title}</div><div class="b-sub">${b.sub}</div></div>`
  ).join("");
}

const ZONE_COLORS = ["#4aa8ff", "#3ddc97", "#c3f53c", "#ffd166", "#ff9f43", "#ff6b6b"];

function renderZones(zonesData) {
  if (zonesData.ftp) $("zones-title").textContent = `Zones d'entraînement — FTP ${zonesData.ftp} W`;
  $("zones").innerHTML = zonesData.zones.map((z, i) =>
    `<div class="zone-row">
      <div class="zone-bar" style="background:${ZONE_COLORS[i % ZONE_COLORS.length]}"></div>
      <span class="zone-name">${escapeHtml(z.name)}</span>
      <span class="zone-watts">${escapeHtml(z.watts)}</span>
      <span class="zone-fc">${escapeHtml(z.fc)}</span>
      <span class="zone-feel">${escapeHtml(z.feel)}</span>
    </div>`
  ).join("") +
  `<p class="zones-ftp-note">HT en watts · extérieur en FC. Règle : 2 séances sweet spot faciles d'affilée (RPE ≤ 6) → cibles +5 %.</p>`;
}

function renderFeed(stats) {
  $("feed").innerHTML = stats.feed.map((s) => {
    const id = s.slot ? `S${s.week}-${s.slot}` : `🏃 S${s.week}`;
    return `<div class="feed-item" title="cliquer pour déplier">
      <div class="feed-head"><span class="feed-id">${id}</span><span class="feed-date">${s.date ? fmtDate(s.date) : ""}</span></div>
      <div class="feed-note">${mdInline(s.text)}</div>
    </div>`;
  }).join("");
  for (const el of document.querySelectorAll(".feed-item"))
    el.addEventListener("click", () => el.classList.toggle("open"));
}

/* ---------- main ---------- */

async function main() {
  const [journalMd, testsMd, indicMd, zonesMd, history] = await Promise.all([
    fetchText("suivi/journal.md"),
    fetchText("suivi/tests.md"),
    fetchText("suivi/indicateurs.md"),
    fetchText("plan/02-zones.md"),
    // historique optionnel : snapshot Strava des années passées
    fetchText("suivi/historique-hebdo.json").then(JSON.parse).catch(() => null),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const journal = parseJournal(journalMd);
  const tests = parseTests(testsMd);
  const indic = parseIndicateurs(indicMd);
  const zonesData = parseZones(zonesMd);
  const stats = computeStats(journal, today);

  $("app").classList.remove("hidden");
  renderHero(stats, journal, today, tests, indic);
  renderRegularite(stats, journal, today);
  renderCharts(stats, journal, tests, indic);
  renderYearsChart(history, stats, today);
  renderMilestones(tests, today);
  renderBadges(stats, tests, indic);
  renderZones(zonesData);
  renderFeed(stats);
}

main().catch((err) => {
  $("error").classList.remove("hidden");
  $("error-detail").textContent = String(err);
  console.error(err);
});
