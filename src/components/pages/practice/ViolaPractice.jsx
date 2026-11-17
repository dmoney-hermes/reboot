import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FaPlay, FaPause, FaForward, FaRedo, FaCheck } from "react-icons/fa";

/* ── Google Fonts injected once into the document head ── */
if (typeof document !== "undefined" && !document.getElementById("vp-fonts")) {
  const link = document.createElement("link");
  link.id = "vp-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap";
  document.head.appendChild(link);
}

/* ── Fonts and palette ── */
const FONT_BODY = "'Inter', system-ui, sans-serif";
const FONT_DISPLAY = "'Fraunces', Georgia, serif";
const INK = "#1f2430";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";

const BLOCKS = {
  warm: { name: "Warm-up & Tone", color: "#0F766E", bg: "#E6F4F1" },
  scales: { name: "Scales", color: "#6D4AC4", bg: "#EFEAFA" },
  etude: { name: "Wohlfahrt Op. 45 No. 37", color: "#B93A32", bg: "#FBEAE8" },
  vivaldi: { name: "Vivaldi D minor", color: "#1F5FA8", bg: "#E5EFFA" },
  review: { name: "Review & Reading", color: "#8A6FB5", bg: "#F1ECF8" },
};

const MODES = {
  full: { label: "Full", sub: "60 min", blocks: ["warm", "scales", "etude", "vivaldi", "review"] },
  short: { label: "Short day", sub: "30 min", blocks: ["scales", "etude", "vivaldi"] },
  orchestra: { label: "Orchestra day", sub: "45 min", blocks: ["warm", "etude", "vivaldi"] },
};

/* [title, minutes, technique / bowing detail, teacher tip] */
const S = (title, min, detail, tip) => ({ title, min, detail, tip });

const PLANS = {
  full: {
    warm: [
      S("Open-string tonalization", 4, "Whole bows on each open string, C-G-D-A. Slow, even, straight bow near the middle of the string.", "Viola needs more bow weight than violin. Sink into the string and let the sound ring."),
      S("Left-hand finger placement", 3, "Slow fingers on each string with tuned fingertips. Keep fingers curved and drop them together.", "Listen for ringing octaves and fifths to check intonation."),
      S("Vibrato warm-up", 3, "Wrist or arm rocking on one finger, then slow pulses in the rhythm of quarter notes.", "Keep the thumb relaxed. A tight grip stops vibrato."),
      S("Bow distribution", 2, "Whole, half and quarter bow on open strings. Match the speed and weight at each part of the bow.", "Use more bow near the frog for a full sound and keep the bow straight."),
    ],
    scales: [
      S("C and G major, 2 octaves", 3, "Slurred 4 per bow, then separate bows. Keep the same bow speed all the way up and down.", "Use the first two notes to set the tempo and keep it steady."),
      S("D and A major, 2 octaves", 3, "Try a mix of rhythms: long-short, short-long, and 3 per bow.", "Check the high 3rd finger and the shift on the A string."),
      S("A minor, 2 octaves", 2, "Melodic form. Use slurs and detache. Listen for the raised 6th and 7th going up.", "Compare the sound of the minor third against the major scale you just played."),
      S("D minor, 2 octaves", 2, "Home key of the Vivaldi. Play slow and in tune, then with the Vivaldi bowing pattern.", "The scale here is the Vivaldi, so take extra time to hear each finger in tune."),
    ],
    etude: [
      S("Slow with shifts mapped", 3, "Very slow, marking every shift in pencil. Name the starting finger and the landing finger.", "No. 37 is a shifting etude using guide fingers. Plan every shift before you play it."),
      S("Shift drilling", 4, "Approach, shift, landing. Loop each shift alone, then add one note before and after.", "Keep the thumb moving with the hand and release finger pressure while you slide."),
      S("Up to tempo", 3, "Raise the metronome 4 clicks at a time while the shifts stay quiet and clean.", "If a shift fails, drop back one speed step and repeat it three times."),
    ],
    vivaldi: [
      S("Book 4 tonalization and lullaby pieces", 3, "Warm, singing tone with long bows and gentle vibrato.", "Sing the line first, then play it the same way."),
      S("1st movement passage work", 6, "Choose 2-3 tricky spots. Slow practice, rhythm variations, then in context.", "Mark spots in pencil and loop them 5 times in a row before moving on."),
      S("3rd movement (Presto) passage work", 6, "Short bows near the middle for fast notes. Start slow and use a metronome.", "Light bow, relaxed hand. Fast does not mean tense."),
      S("Full run-through", 5, "Play through the movement you are performing without stopping.", "Keep going through mistakes. Make note of them for tomorrow."),
    ],
    review: [
      S("Seitz concerto review", 3, "Play a section from an earlier Seitz concerto for tone and confidence.", "Play for the sound this time. Play it like a performance."),
      S("Sight-reading", 3, "Read something new at a slow tempo. Check the key signature and rhythm before you start.", "Keep the pulse going. Do not stop to fix mistakes."),
      S("Break", 2, "Put the viola down and stand up and stretch.", "Shake out your left hand and roll your shoulders. You earned it."),
    ],
  },
  short: {
    scales: [
      S("C and G major, 2 octaves", 2, "Slurred 4 per bow, then separate bows.", "Keep the same bow speed up and down."),
      S("D and A major, 2 octaves", 2, "Mix of rhythms and bowings.", "Check high 3rd finger intonation."),
      S("A minor, 2 octaves", 2, "Melodic form with slurs and detache.", "Hear the raised 6th and 7th going up."),
      S("D minor, 2 octaves", 2, "Home key of the Vivaldi. Slow and in tune.", "This is the scale of your concerto. Listen closely."),
    ],
    etude: [
      S("Slow with shifts mapped", 3, "Very slow, naming start and landing fingers for each shift.", "No. 37 is a shifting etude using guide fingers."),
      S("Shift drilling", 3, "Approach, shift, landing on the toughest shifts only.", "Release finger pressure as you slide."),
      S("Up to tempo", 2, "Raise the metronome a few clicks at a time.", "Back off one step if a shift fails."),
    ],
    vivaldi: [
      S("1st movement passage work", 5, "Slow practice of the trickiest spots, then in context.", "Loop each spot 5 times in a row."),
      S("3rd movement (Presto) passage work", 5, "Short bows near the middle. Start slow.", "Light bow and relaxed hand."),
      S("Full run-through", 4, "Play one movement start to finish without stopping.", "Keep going through mistakes and note them for tomorrow."),
    ],
  },
  orchestra: {
    warm: [
      S("Open-string tonalization", 4, "Whole bows on each open string, C-G-D-A. Straight bow, even sound.", "Viola needs more bow weight than violin."),
      S("Left-hand finger placement", 3, "Slow fingers, curved and dropped together.", "Listen for ringing octaves and fifths."),
      S("Vibrato warm-up", 3, "Wrist or arm rocking, then slow pulses.", "Keep the thumb relaxed."),
      S("Bow distribution", 2, "Whole, half and quarter bow on open strings.", "Match speed and weight at every part of the bow."),
    ],
    etude: [
      S("Slow with shifts mapped", 4, "Very slow, naming start and landing fingers for each shift.", "No. 37 is a shifting etude using guide fingers."),
      S("Shift drilling", 5, "Approach, shift, landing. Loop each shift alone, then add notes around it.", "Move the thumb with the hand and release finger pressure."),
      S("Up to tempo", 3, "Raise the metronome 4 clicks at a time.", "If a shift fails, drop back one speed step."),
    ],
    vivaldi: [
      S("Book 4 tonalization and lullaby pieces", 3, "Warm, singing tone with long bows and gentle vibrato.", "Sing the line first, then play it the same way."),
      S("1st movement passage work", 6, "Pick 2-3 tricky spots. Slow practice, rhythm variations, then in context.", "Loop each spot 5 times in a row."),
      S("3rd movement (Presto) passage work", 6, "Short bows near the middle. Start slow with a metronome.", "Light bow, relaxed hand."),
      S("Full run-through", 6, "Play through one movement without stopping.", "Keep going through mistakes and note them for tomorrow."),
    ],
  },
};

function buildSegments(mode) {
  const out = [];
  MODES[mode].blocks.forEach((b) => {
    PLANS[mode][b].forEach((s) => out.push({ ...s, block: b }));
  });
  return out;
}

/* ── Helpers ── */
const STORAGE_KEY = "viola-practice-mode";

function loadMode() {
  try {
    const m = window.localStorage.getItem(STORAGE_KEY);
    return m && MODES[m] ? m : "full";
  } catch {
    return "full";
  }
}

function fmt(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function beep(ctx) {
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    [660, 880].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.25, t + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + i * 0.18);
      osc.stop(t + i * 0.18 + 0.18);
    });
  } catch {
    /* audio is optional */
  }
}

/* ── Sub-components ── */
function CtrlButton({ onClick, children, primary, color, label }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600,
        padding: primary ? "12px 28px" : "12px 18px",
        borderRadius: 10,
        border: `1.5px solid ${primary ? color : hover ? "#9ca3af" : "#d1d5db"}`,
        background: primary ? color : "white",
        color: primary ? "white" : INK,
        cursor: "pointer",
        opacity: primary && hover ? 0.9 : 1,
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

/* ── Main component ── */
export default function ViolaPractice() {
  const [mode, setMode] = useState(loadMode);
  const segs = useMemo(() => buildSegments(mode), [mode]);
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(() => buildSegments(loadMode())[0].min * 60000);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [banner, setBanner] = useState("");

  const idxRef = useRef(0);
  const endAtRef = useRef(0);
  const audioRef = useRef(null);
  const bannerTimer = useRef(null);

  const ensureAudio = () => {
    if (!audioRef.current && typeof window !== "undefined") {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try { audioRef.current = new AC(); } catch { /* ignore */ }
      }
    }
    if (audioRef.current && audioRef.current.state === "suspended") {
      audioRef.current.resume().catch(() => {});
    }
  };

  const showBanner = useCallback((text) => {
    setBanner(text);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(""), 6000);
  }, []);

  const goTo = useCallback((i, run, startAt) => {
    const ms = segs[i].min * 60000;
    idxRef.current = i;
    setIdx(i);
    setDone(false);
    setRemaining(ms);
    if (run) endAtRef.current = (startAt ?? Date.now()) + ms;
    setRunning(run);
  }, [segs]);

  /* Timestamp-based ticking, immune to background-tab throttling drift */
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      const now = Date.now();
      const left = endAtRef.current - now;
      if (left > 0) {
        setRemaining(left);
        return;
      }
      const i = idxRef.current;
      beep(audioRef.current);
      if (i >= segs.length - 1) {
        setRunning(false);
        setDone(true);
        setRemaining(0);
        showBanner("Session complete. Great work!");
      } else {
        showBanner(`Up next: ${segs[i + 1].title} (${segs[i + 1].min} min)`);
        goTo(i + 1, true, endAtRef.current);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, segs, goTo, showBanner]);

  useEffect(() => () => clearTimeout(bannerTimer.current), []);

  const toggle = () => {
    if (done) return;
    if (running) {
      setRemaining(Math.max(0, endAtRef.current - Date.now()));
      setRunning(false);
    } else {
      ensureAudio();
      endAtRef.current = Date.now() + remaining;
      setRunning(true);
    }
  };

  const skip = () => {
    if (idx < segs.length - 1) goTo(idx + 1, running);
    else {
      setRunning(false);
      setDone(true);
      setRemaining(0);
    }
  };

  const reset = () => goTo(idx, false);

  const changeMode = (m) => {
    if (m === mode) return;
    try { window.localStorage.setItem(STORAGE_KEY, m); } catch { /* ignore */ }
    clearTimeout(bannerTimer.current);
    setBanner("");
    setMode(m);
    idxRef.current = 0;
    setIdx(0);
    setDone(false);
    setRunning(false);
    setRemaining(buildSegments(m)[0].min * 60000);
  };

  /* Derived values */
  const seg = segs[idx];
  const block = BLOCKS[seg.block];
  const totalMs = segs.reduce((a, s) => a + s.min * 60000, 0);
  const before = segs.slice(0, idx).reduce((a, s) => a + s.min * 60000, 0);
  const elapsedMs = done ? totalMs : before + (seg.min * 60000 - remaining);
  const segPct = done ? 100 : ((seg.min * 60000 - remaining) / (seg.min * 60000)) * 100;
  const overallPct = (elapsedMs / totalMs) * 100;
  const modeBlocks = MODES[mode].blocks;

  return (
    <div style={{ fontFamily: FONT_BODY, color: INK, background: "#fafaf9", minHeight: "100%", padding: "24px 16px 48px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(24px, 6vw, 34px)", margin: "0 0 4px", lineHeight: 1.15 }}>
          Viola Practice Timer
        </h1>
        <p style={{ margin: "0 0 18px", color: MUTED, fontSize: 14 }}>
          Suzuki Viola Book 4 &middot; Vivaldi Concerto in D minor &middot; Wohlfahrt Op. 45 No. 37
        </p>

        {/* Mode selector */}
        <div role="tablist" aria-label="Session mode" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {Object.entries(MODES).map(([key, m]) => {
            const active = key === mode;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => changeMode(key)}
                style={{
                  padding: "8px 16px", borderRadius: 99, cursor: "pointer",
                  fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600,
                  border: `1.5px solid ${active ? INK : "#d1d5db"}`,
                  background: active ? INK : "white",
                  color: active ? "white" : MUTED,
                }}
              >
                {m.label} <span style={{ opacity: 0.7, fontWeight: 500 }}>&middot; {m.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Block pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {modeBlocks.map((b) => {
            const bl = BLOCKS[b];
            const first = segs.findIndex((s) => s.block === b);
            const active = seg.block === b;
            const mins = segs.filter((s) => s.block === b).reduce((a, s) => a + s.min, 0);
            return (
              <button
                key={b}
                onClick={() => goTo(first, running)}
                aria-pressed={active}
                style={{
                  padding: "7px 14px", borderRadius: 99, cursor: "pointer",
                  fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${bl.color}`,
                  background: active ? bl.color : bl.bg,
                  color: active ? "white" : bl.color,
                }}
              >
                {bl.name} &middot; {mins}m
              </button>
            );
          })}
        </div>

        {/* Up-next banner */}
        <div aria-live="polite" style={{ minHeight: banner ? undefined : 0 }}>
          {banner && (
            <div style={{
              background: INK, color: "white", borderRadius: 10, padding: "10px 14px",
              fontSize: 14, fontWeight: 600, marginBottom: 14,
            }}>
              {banner}
            </div>
          )}
        </div>

        {/* Timer card */}
        <div style={{
          background: "white", border: `1px solid ${LINE}`, borderTop: `5px solid ${block.color}`,
          borderRadius: 14, padding: "20px 16px", marginBottom: 16, boxSizing: "border-box",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: block.color }}>
            {block.name}
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(20px, 5vw, 26px)", margin: "4px 0 2px", lineHeight: 1.2 }}>
            {done ? "Session complete" : seg.title}
          </h2>
          <div style={{ fontSize: 13, color: MUTED }}>
            Segment {done ? segs.length : idx + 1} of {segs.length}
          </div>

          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: "clamp(56px, 18vw, 96px)", fontWeight: 700,
            textAlign: "center", margin: "12px 0 8px", color: block.color, lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}>
            {fmt(remaining)}
          </div>

          <div style={{ height: 6, background: LINE, borderRadius: 99, overflow: "hidden", marginBottom: 18 }}>
            <div style={{ width: `${segPct}%`, height: "100%", background: block.color, transition: "width 0.25s linear" }} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 18 }}>
            <CtrlButton primary color={block.color} onClick={toggle} label={running ? "Pause" : "Start"}>
              {running ? <FaPause size={13} /> : <FaPlay size={13} />} {running ? "Pause" : "Start"}
            </CtrlButton>
            <CtrlButton onClick={skip} label="Skip to next segment"><FaForward size={13} /> Skip</CtrlButton>
            <CtrlButton onClick={reset} label="Restart this segment"><FaRedo size={13} /> Reset</CtrlButton>
          </div>

          {!done && (
            <>
              <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.5 }}>
                <strong>Technique / bowing:</strong> {seg.detail}
              </p>
              <div style={{
                background: block.bg, borderLeft: `4px solid ${block.color}`, borderRadius: 8,
                padding: "10px 14px", fontSize: 14, lineHeight: 1.5,
              }}>
                <strong style={{ color: block.color }}>Teacher tip:</strong> {seg.tip}
              </div>
            </>
          )}
        </div>

        {/* Overall progress */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            <span>Overall progress</span>
            <span style={{ color: MUTED, fontVariantNumeric: "tabular-nums" }}>
              {fmt(elapsedMs)} / {fmt(totalMs)}
            </span>
          </div>
          <div style={{ height: 10, background: LINE, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${overallPct}%`, height: "100%", background: INK, transition: "width 0.25s linear" }} />
          </div>
        </div>

        {/* Segment list */}
        <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, background: "white", overflow: "hidden" }}>
          {segs.map((s, i) => {
            const bl = BLOCKS[s.block];
            const current = i === idx && !done;
            const finished = done || i < idx;
            const newBlock = i === 0 || segs[i - 1].block !== s.block;
            return (
              <div key={`${mode}-${i}`}>
                {newBlock && (
                  <div style={{
                    background: bl.bg, color: bl.color, fontSize: 12, fontWeight: 700, letterSpacing: 0.8,
                    textTransform: "uppercase", padding: "6px 14px",
                  }}>
                    {bl.name}
                  </div>
                )}
                <button
                  onClick={() => goTo(i, running)}
                  aria-current={current ? "step" : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                    padding: "10px 14px", border: "none", borderTop: `1px solid ${LINE}`,
                    borderLeft: `4px solid ${current ? bl.color : "transparent"}`,
                    background: current ? bl.bg : "white", cursor: "pointer",
                    fontFamily: FONT_BODY, fontSize: 14, color: finished ? MUTED : INK,
                    boxSizing: "border-box",
                  }}
                >
                  <span style={{
                    flex: "0 0 22px", height: 22, borderRadius: "50%",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: finished ? bl.color : "transparent",
                    border: `1.5px solid ${finished || current ? bl.color : "#d1d5db"}`,
                    color: "white",
                  }}>
                    {finished && <FaCheck size={11} />}
                  </span>
                  <span style={{
                    flex: 1, minWidth: 0, fontWeight: current ? 700 : 500,
                    textDecoration: finished ? "line-through" : "none",
                  }}>
                    {s.title}
                  </span>
                  <span style={{ flex: "0 0 auto", color: MUTED, fontSize: 13 }}>{s.min} min</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
