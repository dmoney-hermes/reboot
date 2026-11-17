import { useState, useEffect, useRef, useMemo } from "react";

/* ── Google Fonts injected once into the document head ── */
if (typeof document !== "undefined" && !document.getElementById("vp-fonts")) {
  const link = document.createElement("link");
  link.id = "vp-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka+One&display=swap";
  document.head.appendChild(link);
}

/* ── Fonts ── */
const FONT_BODY = "'Nunito', sans-serif";
const FONT_DISPLAY = "'Fredoka One', cursive";

/* ── Palette: teal, blue, purple, coral, amber for Hours 1-5 ── */
const HOUR_COLORS = ["#1D9E75", "#378ADD", "#7F77DD", "#D85A30", "#BA7517"];
const HOUR_BGS = ["#E1F5EE", "#E6F1FB", "#EEEDFE", "#FAECE7", "#FAEEDA"];
const INK = "#1a1a1a";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";

const STORAGE_KEY = "violin-practice-v1";
const ORCHESTRA_HOURS = [1, 3, 4];
const BREAK_MINS = 10;

/* ── Schedule data: each hour is 50 practice minutes + a 10 minute break ── */
const HOURS = [
  {
    n: 1,
    name: "Hour 1 · The Galamian Hour",
    short: "Basic technique",
    segments: [
      { title: "Left hand: finger action", mins: 10, detail: "Left hand / raising and dropping fingers for clean articulation, slow and high, then fast and light.", tip: "Lift fingers only as far as needed and keep the thumb relaxed." },
      { title: "Shifting and distances", mins: 10, detail: "Left hand / shifting, gauging distances accurately on the fingerboard, silent guide-finger slides.", tip: "Move with the arm, not the hand, and aim for the target note before you arrive." },
      { title: "Vibrato", mins: 10, detail: "Left hand / vibrato on open strings, single notes, then across shifts, slow to fast.", tip: "Keep vibrato continuous. Stay loose in the wrist and arm." },
      { title: "Bow: changes, pressure, speed", mins: 10, detail: "Bow / smooth bow changes, varied pressure and speed, purity and variety of tone, firm and bounced bowing styles.", tip: "Listen for the sound at every bow change. Stay in the sounding point." },
      { title: "Round turns", mins: 10, detail: "Bow / sounding point, speed, pressure and hair. Build from 1 round turn per bow up to 64 for sounding point and 16 for speed.", tip: "Keep vibrato going the whole time, even when the bow is busy." },
    ],
  },
  {
    n: 2,
    name: "Hour 2 · Scales and double stops",
    short: "Scales, arpeggios, double stops",
    segments: [
      { title: "Scales", mins: 20, detail: "Flesch / Galamian scale systems, three octaves, major and minor, varied bowings (slurred in 4, 8, 12, then separate).", tip: "Use a metronome, and change key each day." },
      { title: "Arpeggios", mins: 15, detail: "Three-octave arpeggios, major, minor and dominant sevenths, slurred and detaché.", tip: "Keep shifts smooth and in tune. Move the elbow across strings early." },
      { title: "Double stops", mins: 15, detail: "Thirds, sixths, octaves and tenths, bowed slowly with intonation check against open strings.", tip: "Play each interval until it rings. Hold the sound before adding speed." },
    ],
  },
  {
    n: 3,
    name: "Hour 3 · Études",
    short: "Étude sequence",
    segments: [
      { title: "Foundations", mins: 10, detail: "Wohlfahrt Op. 45 → Schradieck → Whistler. Finger patterns, even bowing, steady rhythm.", tip: "Play slowly, keep fingers close to the strings." },
      { title: "Classic études", mins: 15, detail: "Kreutzer → Dont → Fiorillo. One étude, one technical problem: choose the bowing and keep it clean.", tip: "Fix the hardest bar, then play the whole étude through." },
      { title: "Advanced études", mins: 15, detail: "Rode → Gaviniès → Paganini Caprices. Stamina, bow control, left-hand agility.", tip: "Do not rush. Speed should come from clean slow work." },
      { title: "Virtuoso études", mins: 10, detail: "Dounis → Wieniawski L'École moderne → Ernst. Pick one and work it in short loops.", tip: "Take it in small units and add the next one only when the last is secure." },
    ],
  },
  {
    n: 4,
    name: "Hour 4 · Concerto",
    short: "Concerto work",
    segments: [
      { title: "Detailed technique work", mins: 10, detail: "Pick the hardest passages of the concerto and drill intonation and fingerings.", tip: "Sequence note: Paganini first. Tchaikovsky and Sibelius next. Brahms last." },
      { title: "Segment by segment", mins: 15, detail: "Work in small segments with varied rhythms, slow practice, and bowing options.", tip: "If you can play the Paganini, you can play Tchaikovsky and Sibelius." },
      { title: "Performance run-throughs", mins: 15, detail: "Play the piece through several times as in a performance, without stopping.", tip: "Pretend there is an audience. Do not stop for mistakes." },
      { title: "Review and reset", mins: 10, detail: "Note what went wrong, replay the trouble spots slowly, then finish with one confident pass.", tip: "Write down one thing to fix tomorrow." },
    ],
  },
  {
    n: 5,
    name: "Hour 5 · Repertoire",
    short: "Auer, Bach, Paganini, recital",
    segments: [
      { title: "Auer scales and arpeggios", mins: 10, detail: "Auer scales and arpeggios as a warm up for the repertoire work.", tip: "Play with a beautiful sound, not just in tune." },
      { title: "Concerto repertoire", mins: 15, detail: "Concerto movements, focusing on phrasing, character and musical shape.", tip: "Know the orchestra part and sing the phrases." },
      { title: "Solo Bach", mins: 10, detail: "Sonatas and partitas: voicing, chords, and clear bow strokes.", tip: "Keep the line moving and bring out the bass." },
      { title: "Paganini Caprices", mins: 10, detail: "One Caprice, in sections: clean left hand with relaxed bow.", tip: "Slow practice first, then half speed, then tempo." },
      { title: "Recital repertoire", mins: 5, detail: "A short run of upcoming recital pieces.", tip: "Finish with the piece that makes you happiest." },
    ],
  },
];

/* ── Flatten into practice + break segments ── */
function buildSegments(hourNumbers) {
  const out = [];
  HOURS.filter((h) => hourNumbers.includes(h.n)).forEach((h) => {
    h.segments.forEach((s, i) => {
      out.push({ ...s, id: `h${h.n}-s${i}`, hour: h.n, isBreak: false });
    });
    out.push({
      id: `h${h.n}-break`,
      hour: h.n,
      isBreak: true,
      title: "10-minute break",
      mins: BREAK_MINS,
      detail: "Rest / put the violin down, stretch hands and shoulders, drink some water.",
      tip: "Look away from the music and let your hands relax.",
    });
  });
  return out;
}

const ALL_HOURS = [1, 2, 3, 4, 5];

/* ── Helpers ── */
function fmt(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function fmtMins(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return { orchestra: !!p.orchestra, segId: typeof p.segId === "string" ? p.segId : null };
    }
  } catch {
    /* ignore */
  }
  return { orchestra: false, segId: null };
}

function initialState() {
  const saved = loadSaved();
  const list = buildSegments(saved.orchestra ? ORCHESTRA_HOURS : ALL_HOURS);
  let idx = list.findIndex((s) => s.id === saved.segId);
  if (idx < 0) idx = 0;
  return {
    orchestra: saved.orchestra,
    idx,
    running: false,
    endAt: 0,
    pausedLeft: list[idx].mins * 60000,
    finished: false,
  };
}

/* ── Sound ── */
function beep(ctxRef, times = 2) {
  try {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctxRef.current = new AC();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    for (let i = 0; i < times; i++) {
      const t = ctx.currentTime + i * 0.3;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = i % 2 ? 660 : 880;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  } catch {
    /* audio not available */
  }
}

/* ── Small button ── */
function Btn({ onClick, children, bg = INK, color = "white", outline = false, disabled = false, grow = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 18,
        padding: "10px 22px",
        borderRadius: 99,
        border: `2px solid ${outline ? "#d1d5db" : bg}`,
        background: outline ? "white" : bg,
        color: outline ? INK : color,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        flex: grow ? "1 1 110px" : "0 1 auto",
        minWidth: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ── Main component ── */
export default function ViolinPractice() {
  const [st, setSt] = useState(initialState);
  const [now, setNow] = useState(() => Date.now());
  const [banner, setBanner] = useState(null);
  const stRef = useRef(st);
  const audioRef = useRef(null);

  const segments = useMemo(
    () => buildSegments(st.orchestra ? ORCHESTRA_HOURS : ALL_HOURS),
    [st.orchestra]
  );
  const segRef = useRef(segments);
  useEffect(() => {
    segRef.current = segments;
  }, [segments]);

  const update = (fn) => {
    stRef.current = fn(stRef.current);
    setSt(stRef.current);
  };

  /* Interval is timestamp based: remaining time comes from Date.now() */
  useEffect(() => {
    if (!st.running) return undefined;
    const id = setInterval(() => {
      const cur = stRef.current;
      const t = Date.now();
      setNow(t);
      if (!cur.running || t < cur.endAt) return;
      const list = segRef.current;
      /* advance, carrying overflow so a background tab does not lose time */
      let idx = cur.idx;
      let endAt = cur.endAt;
      while (t >= endAt && idx < list.length - 1) {
        idx += 1;
        endAt += list[idx].mins * 60000;
      }
      if (t >= endAt) {
        update((s) => ({ ...s, running: false, finished: true, pausedLeft: 0, idx: list.length - 1 }));
        setBanner({ text: "Practice day complete. Great work!", hour: list[list.length - 1].hour });
        beep(audioRef, 3);
        return;
      }
      update((s) => ({ ...s, idx, endAt }));
      const next = list[idx];
      setBanner({
        text: `Up next: ${next.isBreak ? "Break" : next.title} (${next.mins} min)`,
        hour: next.hour,
      });
      beep(audioRef, 2);
    }, 250);
    return () => clearInterval(id);
  }, [st.running]);

  /* Clean up audio context on unmount */
  useEffect(
    () => () => {
      try {
        if (audioRef.current) audioRef.current.close();
      } catch {
        /* ignore */
      }
    },
    []
  );

  /* Auto-hide banner */
  useEffect(() => {
    if (!banner) return undefined;
    const id = setTimeout(() => setBanner(null), 8000);
    return () => clearTimeout(id);
  }, [banner]);

  /* Persist mode and position */
  const curSeg = segments[st.idx];
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ orchestra: st.orchestra, segId: curSeg.id }));
    } catch {
      /* ignore */
    }
  }, [st.orchestra, curSeg.id]);

  /* ── Derived values ── */
  const curMs = curSeg.mins * 60000;
  const leftMs = st.running ? Math.min(curMs, Math.max(0, st.endAt - now)) : st.pausedLeft;
  const totalMins = segments.reduce((a, s) => a + s.mins, 0);
  const doneMins = segments.slice(0, st.idx).reduce((a, s) => a + s.mins, 0);
  const elapsedMins = doneMins + (curMs - leftMs) / 60000;
  const pct = Math.min(100, (elapsedMins / totalMins) * 100);
  const color = HOUR_COLORS[curSeg.hour - 1];
  const bg = HOUR_BGS[curSeg.hour - 1];
  const segPct = ((curMs - leftMs) / curMs) * 100;

  /* ── Actions ── */
  const jumpTo = (idx, run) => {
    const seg = segments[idx];
    const t = Date.now();
    setNow(t);
    update((s) => ({
      ...s,
      idx,
      finished: false,
      running: run,
      endAt: t + seg.mins * 60000,
      pausedLeft: seg.mins * 60000,
    }));
  };

  const toggle = () => {
    /* create/resume audio on a user gesture so later beeps are allowed */
    try {
      if (!audioRef.current) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioRef.current = new AC();
      }
      if (audioRef.current && audioRef.current.state === "suspended") audioRef.current.resume();
    } catch {
      /* ignore */
    }
    if (st.finished) {
      jumpTo(0, true);
      setBanner(null);
      return;
    }
    const t = Date.now();
    setNow(t);
    if (st.running) {
      update((s) => ({ ...s, running: false, pausedLeft: Math.max(0, s.endAt - t) }));
    } else {
      update((s) => ({ ...s, running: true, endAt: t + s.pausedLeft }));
    }
  };

  const skip = () => {
    if (st.idx >= segments.length - 1) return;
    const next = segments[st.idx + 1];
    jumpTo(st.idx + 1, st.running);
    setBanner({ text: `Up next: ${next.isBreak ? "Break" : next.title} (${next.mins} min)`, hour: next.hour });
  };

  const reset = () => jumpTo(st.idx, false);

  const jumpHour = (n) => {
    const i = segments.findIndex((s) => s.hour === n);
    if (i >= 0) jumpTo(i, st.running);
  };

  const toggleOrchestra = () => {
    const nextOrch = !st.orchestra;
    const list = buildSegments(nextOrch ? ORCHESTRA_HOURS : ALL_HOURS);
    let idx = list.findIndex((s) => s.id === curSeg.id);
    if (idx < 0) {
      idx = list.findIndex((s) => s.hour >= curSeg.hour);
      if (idx < 0) idx = list.length - 1;
    }
    const keep = list[idx].id === curSeg.id;
    const t = Date.now();
    setNow(t);
    stRef.current = {
      ...stRef.current,
      orchestra: nextOrch,
      idx,
      finished: false,
      running: keep ? stRef.current.running : false,
      endAt: keep ? stRef.current.endAt : t,
      pausedLeft: keep ? stRef.current.pausedLeft : list[idx].mins * 60000,
    };
    segRef.current = list;
    setSt(stRef.current);
  };

  const activeHours = st.orchestra ? ORCHESTRA_HOURS : ALL_HOURS;
  const hourInfo = HOURS[curSeg.hour - 1];

  return (
    <div style={{ background: "#fffdf7", minHeight: "100vh", fontFamily: FONT_BODY, color: INK }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 48px", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, margin: "0 0 4px", fontWeight: 400, textAlign: "center" }}>
          🎻 Violin Practice Timer
        </h1>
        <p style={{ textAlign: "center", color: MUTED, margin: "0 0 18px", fontWeight: 600, fontSize: 14 }}>
          The Dorothy DeLay five-hour schedule: 50 minutes of practice, then a 10-minute break.
        </p>

        {/* Hour pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 12 }}>
          {ALL_HOURS.map((n) => {
            const enabled = activeHours.includes(n);
            const active = curSeg.hour === n;
            return (
              <button
                key={n}
                disabled={!enabled}
                onClick={() => jumpHour(n)}
                aria-pressed={active}
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 16,
                  padding: "8px 16px",
                  borderRadius: 99,
                  border: `2.5px solid ${active ? INK : "transparent"}`,
                  background: HOUR_COLORS[n - 1],
                  color: "white",
                  cursor: enabled ? "pointer" : "default",
                  opacity: enabled ? 1 : 0.3,
                }}
              >
                Hour {n}
              </button>
            );
          })}
        </div>

        {/* Orchestra toggle */}
        <label
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontWeight: 700, fontSize: 14, marginBottom: 16, cursor: "pointer",
          }}
        >
          <input type="checkbox" checked={st.orchestra} onChange={toggleOrchestra} />
          Orchestra day mode (Hours 1, 3 and 4 only)
        </label>

        {/* Banner */}
        {banner && (
          <div
            role="status"
            aria-live="polite"
            style={{
              background: HOUR_COLORS[banner.hour - 1],
              color: "white",
              borderRadius: 14,
              padding: "12px 16px",
              marginBottom: 14,
              fontWeight: 800,
              fontSize: 16,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span>🔔 {banner.text}</span>
            <button
              onClick={() => setBanner(null)}
              aria-label="Dismiss"
              style={{ background: "transparent", border: "none", color: "white", fontSize: 20, cursor: "pointer", padding: 0 }}
            >
              ×
            </button>
          </div>
        )}

        {/* Timer card */}
        <div
          style={{
            background: bg,
            border: `3px solid ${color}`,
            borderRadius: 22,
            padding: "20px 16px",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 13, color, textTransform: "uppercase", letterSpacing: 1 }}>
            {hourInfo.name}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, margin: "6px 0 2px", overflowWrap: "anywhere" }}>
            {curSeg.isBreak ? "☕ " : ""}{curSeg.title}
          </div>
          <div
            aria-live="off"
            style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(56px, 18vw, 96px)", lineHeight: 1.1, color }}
          >
            {fmt(leftMs)}
          </div>
          <div style={{ height: 8, background: "white", borderRadius: 99, overflow: "hidden", margin: "6px auto 14px", maxWidth: 480 }}>
            <div style={{ height: "100%", width: `${segPct}%`, background: color, transition: "width 0.25s linear" }} />
          </div>
          <p style={{ margin: "0 auto 6px", maxWidth: 560, fontWeight: 600, fontSize: 15 }}>{curSeg.detail}</p>
          <p style={{ margin: "0 auto 16px", maxWidth: 560, color: MUTED, fontWeight: 600, fontSize: 14 }}>
            💡 {curSeg.tip}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            <Btn onClick={toggle} bg={color} grow>
              {st.finished ? "Restart day" : st.running ? "Pause" : "Start"}
            </Btn>
            <Btn onClick={skip} outline grow disabled={st.idx >= segments.length - 1}>Skip</Btn>
            <Btn onClick={reset} outline grow>Reset</Btn>
          </div>
        </div>

        {/* Day progress */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            <span>Day progress</span>
            <span style={{ color: MUTED }}>
              {fmtMins(elapsedMins)} / {fmtMins(totalMins)} ({Math.round(pct)}%)
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
            style={{ height: 12, background: LINE, borderRadius: 99, overflow: "hidden" }}
          >
            <div style={{ height: "100%", width: `${pct}%`, background: INK, transition: "width 0.25s linear" }} />
          </div>
        </div>

        {/* Segment list */}
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, margin: "0 0 10px" }}>All segments</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {segments.map((s, i) => {
            const isCur = i === st.idx;
            const isDone = i < st.idx || (st.finished && i === st.idx);
            const c = HOUR_COLORS[s.hour - 1];
            const first = i === 0 || segments[i - 1].hour !== s.hour;
            return (
              <div key={s.id}>
                {first && (
                  <div style={{ fontWeight: 800, fontSize: 13, color: c, margin: "10px 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {HOURS[s.hour - 1].name}
                  </div>
                )}
                <button
                  onClick={() => jumpTo(i, st.running)}
                  aria-current={isCur ? "step" : undefined}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 12,
                    border: `2px solid ${isCur ? c : LINE}`,
                    background: isCur ? HOUR_BGS[s.hour - 1] : "white",
                    opacity: isDone ? 0.65 : 1,
                    cursor: "pointer",
                    fontFamily: FONT_BODY,
                    color: INK,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      flex: "0 0 22px", height: 22, borderRadius: "50%",
                      background: isDone ? c : "white",
                      border: `2px solid ${c}`,
                      color: "white", fontSize: 13, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {isDone ? "✓" : ""}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 800, fontSize: 15, overflowWrap: "anywhere", textDecoration: isDone ? "line-through" : "none" }}>
                      {s.isBreak ? "☕ " : ""}{s.title}
                    </span>
                    <span style={{ display: "block", fontSize: 12.5, color: MUTED, fontWeight: 600, overflowWrap: "anywhere" }}>
                      {s.detail}
                    </span>
                  </span>
                  <span style={{ flex: "0 0 auto", fontWeight: 800, fontSize: 13, color: c }}>{s.mins} min</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
