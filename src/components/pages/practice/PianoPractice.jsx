import { useState, useEffect, useMemo, useRef } from "react";
import { FaPlay, FaPause, FaForward, FaRedo, FaCheck } from "react-icons/fa";

/* ── Google Fonts injected once into the document head ── */
if (typeof document !== "undefined" && !document.getElementById("pp-fonts")) {
  const link = document.createElement("link");
  link.id = "pp-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka+One&display=swap";
  document.head.appendChild(link);
}

/* ── Palette ── */
const FONT_BODY = "'Nunito', sans-serif";
const FONT_DISPLAY = "'Fredoka One', cursive";
const INK = "#1a1a1a";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";

const BLOCKS = {
  warmup: { label: "Warm-up", color: "#378ADD", bg: "#E6F1FB", dark: "#0C447C" },
  etude: { label: "Etude", color: "#7F77DD", bg: "#EEEDFE", dark: "#3C3489" },
  repertoire: { label: "Repertoire", color: "#1D9E75", bg: "#E1F5EE", dark: "#085041" },
  reading: { label: "Sight-reading & Theory", color: "#D85A30", bg: "#FAECE7", dark: "#712B13" },
};
const BREAK_STYLE = { color: "#9ca3af", bg: "#f3f4f6", dark: "#374151" };

/* ── Etude content (reloads when the switcher changes) ── */
const ETUDES = {
  beyer: {
    name: "Beyer Op. 101",
    phases: [
      {
        title: "Beyer: hands separate, slow",
        detail: "Right hand, then left hand, at half tempo. Work toward No. 87.",
        tip: "Play each hand alone until you could do it with your eyes closed. Check fingering first, and keep the same fingers every time.",
      },
      {
        title: "Beyer: hands together",
        detail: "Short phrases, two or four bars at a time, then link them.",
        tip: "For No. 87, let the melody sing over the accompaniment. Play the accompaniment softer and shorter, and listen for the tune like a singer on top.",
      },
      {
        title: "Beyer: up to tempo",
        detail: "Use the metronome and nudge it up a few clicks only when it is clean.",
        tip: "If a spot trips you, slow down for that bar only. Three clean repeats in a row beats ten fast, messy ones.",
      },
    ],
  },
  czerny: {
    name: "Czerny Op. 139",
    phases: [
      {
        title: "Czerny: hands separate, slow",
        detail: "Each hand alone, slowly, with firm even fingers.",
        tip: "Czerny builds finger strength and evenness. Keep your hand shape round and your wrist loose, not stiff.",
      },
      {
        title: "Czerny: hands together",
        detail: "Phrase by phrase. Keep both hands perfectly in time.",
        tip: "Think in groups, not single notes. Feel the beat at the start of each group and let the notes in between flow.",
      },
      {
        title: "Czerny: up to tempo",
        detail: "Metronome on. Raise it a little at a time.",
        tip: "Speed comes from relaxation. If your shoulders rise, you are going too fast, so drop back a notch.",
      },
    ],
  },
};

const DEFAULT_PIECE = "Current Suzuki Book 2 piece";
const DEFAULT_REVIEW = "Review piece";

/* ── Segment builder: [block, minutes, title, detail, tip] ── */
function buildSegments(etudeKey, mode, piece, review) {
  const e = ETUDES[etudeKey].phases;
  const cur = piece.trim() || DEFAULT_PIECE;
  const rev = review.trim() || DEFAULT_REVIEW;
  const rows =
    mode === "short"
      ? [
          ["warmup", 3, "Scales: hands separate", "One major scale and its relative minor, 1 to 2 octaves. Suggested keys: C, G, D or F.", "Keep thumbs light and passing smoothly under. Eyes on the music, not the hands."],
          ["warmup", 3, "Scales: hands together, dotted rhythm", "Same scale hands together, then long-short, short-long dotted rhythm.", "Dotted rhythms make the fast notes even once you go back to straight notes."],
          ["etude", 3, e[0].title, e[0].detail, e[0].tip],
          ["etude", 4, e[1].title, e[1].detail, e[1].tip],
          ["etude", 3, e[2].title, e[2].detail, e[2].tip],
          ["repertoire", 5, `${cur}: detail drilling`, "Pick the hardest two or three spots and fix them slowly.", "Fix the spot, not the whole piece. Loop four bars, three clean times."],
          ["repertoire", 4, `${cur}: full run-through`, "Play start to finish without stopping.", "Keep going through mistakes like a real performance. Fix them afterwards."],
          ["reading", 3, "Sight-reading: one line", "Pick a new line. Look first, set the pulse, then play without stopping.", "Scan for the key, time signature and tricky spots, then count one bar in."],
          ["reading", 2, "Free play", "Play anything you love, just for fun.", "Music is meant to be enjoyed. End on a smile."],
        ]
      : [
          ["warmup", 4, "Hanon exercise", "Hanon No. 1 or 2, hands together, slow and even.", "Relaxed wrists, curved fingers, equal sound in every note. Slow is strong."],
          ["warmup", 3, "Scales: hands separate", "One major scale and its relative minor, 1 to 2 octaves. Rotate keys: C, G, D, F.", "Keep your thumb passing smoothly under, with no bump in the line."],
          ["warmup", 3, "Scales: hands together, dotted rhythm", "Hands together, then long-short and short-long dotted rhythm.", "Dotted rhythms make the fast notes evener when you go back to straight notes."],
          ["warmup", 2, "Arpeggios", "Broken chords of the same key, hands separate then together.", "Let the wrist roll gently across, and keep the hand quiet."],
          ["etude", 5, e[0].title, e[0].detail, e[0].tip],
          ["etude", 6, e[1].title, e[1].detail, e[1].tip],
          ["etude", 5, e[2].title, e[2].detail, e[2].tip],
          ["break", 2, "Short break", "Stretch, shake out your hands, sip some water.", "A rested hand learns faster. Back to the bench in two minutes."],
          ["repertoire", 8, `${cur}: detail drilling`, "Choose two or three tricky spots. Slow, hands separate if needed.", "Loop small chunks, and change one thing at a time: rhythm, fingering or dynamics."],
          ["repertoire", 6, `${cur}: full run-through`, "Play start to finish without stopping, as a performance.", "If you slip, keep going and keep the beat. Fix it afterwards."],
          ["repertoire", 6, `${rev}: review`, "Play an older piece and make it beautiful.", "Review pieces keep your skills sharp. Focus on tone and shaping."],
          ["reading", 4, "Sight-reading: one line", "Pick a new line. Look first, set the pulse, then play without stopping.", "Scan for the key, time signature and tricky spots, then count one bar in."],
          ["reading", 3, "Intervals & rhythm", "Name and play 2nds, 3rds and 5ths. Clap a rhythm from the page.", "Think in shapes: step, skip, leap. Counting out loud helps."],
          ["reading", 3, "Free play", "Play anything you love, just for fun.", "Music is meant to be enjoyed. End on a smile."],
        ];
  return rows.map(([block, min, title, detail, tip], i) => ({
    id: i, block, min, title, detail, tip,
  }));
}

/* ── Helpers ── */
const STORE_KEY = "pianoPractice.v1";

function loadPrefs() {
  const base = { etude: "beyer", mode: "full", piece: "", review: "" };
  try {
    const p = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    return {
      etude: p.etude in ETUDES ? p.etude : base.etude,
      mode: p.mode === "short" ? "short" : "full",
      piece: typeof p.piece === "string" ? p.piece : "",
      review: typeof p.review === "string" ? p.review : "",
    };
  } catch {
    return base;
  }
}

function fmt(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function styleOf(seg) {
  return seg.block === "break" ? BREAK_STYLE : BLOCKS[seg.block];
}

/* ── Sub-components ── */
function Pill({ active, color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: "7px 14px",
        borderRadius: 99,
        border: `2px solid ${color}`,
        background: active ? color : "white",
        color: active ? "white" : color,
        fontFamily: FONT_BODY,
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function Toggle({ active, onClick, children }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        padding: "7px 16px",
        borderRadius: 99,
        border: `1.5px solid ${active ? INK : "#d1d5db"}`,
        background: active ? INK : "transparent",
        color: active ? "white" : MUTED,
        fontFamily: FONT_BODY,
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function CtrlButton({ onClick, color, children, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: primary ? "12px 28px" : "12px 18px",
        borderRadius: 14,
        border: `2px solid ${color}`,
        background: primary ? color : "white",
        color: primary ? "white" : color,
        fontFamily: FONT_DISPLAY,
        fontSize: 17,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1.5px solid #d1d5db",
  fontFamily: FONT_BODY,
  fontSize: 14,
  color: INK,
};

/* ── Main component ── */
export default function PianoPractice() {
  const [prefs, setPrefs] = useState(loadPrefs);
  const { etude, mode, piece, review } = prefs;
  const segments = useMemo(
    () => buildSegments(etude, mode, piece, review),
    [etude, mode, piece, review]
  );

  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(() => segments[0].min * 60000);
  const [finished, setFinished] = useState(false);
  const [banner, setBanner] = useState(null);
  const endAtRef = useRef(0);
  const audioRef = useRef(null);

  const seg = segments[idx];
  const st = styleOf(seg);
  const segMs = seg.min * 60000;
  const totalMs = segments.reduce((a, s) => a + s.min * 60000, 0);
  const doneMs = segments.slice(0, idx).reduce((a, s) => a + s.min * 60000, 0);
  const elapsedMs = finished ? totalMs : Math.min(totalMs, doneMs + segMs - remaining);

  /* persist prefs */
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(prefs));
    } catch {
      /* storage unavailable */
    }
  }, [prefs]);

  /* short WebAudio beep */
  function beep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      const ctx = audioRef.current;
      if (ctx.state === "suspended") ctx.resume();
      [0, 0.22].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = i === 0 ? 660 : 880;
        const t = ctx.currentTime + delay;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch {
      /* audio unavailable */
    }
  }

  /* timestamp-based ticking, so background tabs do not drift */
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      const left = endAtRef.current - Date.now();
      if (left > 0) {
        setRemaining(left);
        return;
      }
      beep();
      if (idx >= segments.length - 1) {
        setRunning(false);
        setRemaining(0);
        setFinished(true);
        setBanner("All done! Great practice today.");
      } else {
        const next = segments[idx + 1];
        setIdx(idx + 1);
        setRemaining(next.min * 60000);
        endAtRef.current = Date.now() + next.min * 60000;
        setBanner(`Up next: ${next.title} (${next.min} min)`);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, idx, segments]);

  /* banner auto-dismiss */
  useEffect(() => {
    if (!banner) return undefined;
    const t = setTimeout(() => setBanner(null), 7000);
    return () => clearTimeout(t);
  }, [banner]);

  function jump(i, keepRunning = running) {
    const ms = segments[i].min * 60000;
    setIdx(i);
    setRemaining(ms);
    setFinished(false);
    setBanner(null);
    endAtRef.current = Date.now() + ms;
    setRunning(keepRunning);
  }

  function toggleRun() {
    if (running) {
      setRemaining(Math.max(0, endAtRef.current - Date.now()));
      setRunning(false);
      return;
    }
    // create/resume audio inside the user gesture so later beeps are allowed
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx && !audioRef.current) audioRef.current = new Ctx();
      if (audioRef.current?.state === "suspended") audioRef.current.resume();
    } catch {
      /* ignore */
    }
    if (finished) {
      jump(0, true);
      return;
    }
    endAtRef.current = Date.now() + remaining;
    setRunning(true);
  }

  function skip() {
    if (idx >= segments.length - 1) {
      setRunning(false);
      setRemaining(0);
      setFinished(true);
      setBanner("All done! Great practice today.");
      return;
    }
    const next = segments[idx + 1];
    jump(idx + 1);
    setBanner(`Up next: ${next.title} (${next.min} min)`);
  }

  function resetAll(nextPrefs) {
    setPrefs(nextPrefs);
    const first = buildSegments(nextPrefs.etude, nextPrefs.mode, nextPrefs.piece, nextPrefs.review)[0];
    setIdx(0);
    setRemaining(first.min * 60000);
    setRunning(false);
    setFinished(false);
    setBanner(null);
  }

  /* block pills: first segment of each block */
  const blockOrder = [];
  segments.forEach((s, i) => {
    if (s.block !== "break" && !blockOrder.some((b) => b.block === s.block)) {
      blockOrder.push({ block: s.block, first: i });
    }
  });

  const pct = totalMs ? Math.round((elapsedMs / totalMs) * 100) : 0;
  const segPct = segMs ? Math.round(((segMs - remaining) / segMs) * 100) : 0;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "20px 16px 48px",
        boxSizing: "border-box",
        fontFamily: FONT_BODY,
        color: INK,
        overflowX: "hidden",
      }}
    >
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, margin: "0 0 4px", fontWeight: 400 }}>
        Piano Practice Timer
      </h1>
      <p style={{ margin: "0 0 16px", color: MUTED, fontSize: 15 }}>
        Suzuki Piano Level 2 · {mode === "short" ? "30" : "60"} minutes
      </p>

      {/* Etude + mode switchers */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }} role="tablist" aria-label="Etude">
        {Object.entries(ETUDES).map(([key, v]) => (
          <Toggle key={key} active={etude === key} onClick={() => resetAll({ ...prefs, etude: key })}>
            {v.name}
          </Toggle>
        ))}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
        <input
          type="checkbox"
          checked={mode === "short"}
          onChange={(e) => resetAll({ ...prefs, mode: e.target.checked ? "short" : "full" })}
          style={{ width: 18, height: 18, accentColor: "#EAB308" }}
        />
        Short day mode (30 min)
      </label>

      {/* Piece names */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <label style={{ flex: "1 1 240px", fontSize: 12, fontWeight: 700, color: MUTED }}>
          Current piece (Suzuki Book 2)
          <input
            style={inputStyle}
            value={piece}
            placeholder={DEFAULT_PIECE}
            onChange={(e) => setPrefs({ ...prefs, piece: e.target.value })}
          />
        </label>
        <label style={{ flex: "1 1 240px", fontSize: 12, fontWeight: 700, color: MUTED }}>
          Review piece
          <input
            style={inputStyle}
            value={review}
            placeholder={DEFAULT_REVIEW}
            onChange={(e) => setPrefs({ ...prefs, review: e.target.value })}
          />
        </label>
      </div>

      {/* Block pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {blockOrder.map(({ block, first }) => (
          <Pill
            key={block}
            color={BLOCKS[block].color}
            active={seg.block === block}
            onClick={() => jump(first)}
          >
            {BLOCKS[block].label}
          </Pill>
        ))}
      </div>

      {/* Up-next banner */}
      {banner && (
        <div
          role="status"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            background: "#FEF9C3",
            border: "2px solid #EAB308",
            borderRadius: 14,
            padding: "10px 14px",
            marginBottom: 14,
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          <span>{banner}</span>
          <button
            onClick={() => setBanner(null)}
            aria-label="Dismiss"
            style={{ border: "none", background: "transparent", fontSize: 20, cursor: "pointer", color: INK }}
          >
            ×
          </button>
        </div>
      )}

      {/* Timer card */}
      <div
        style={{
          background: st.bg,
          border: `2px solid ${st.color}`,
          borderRadius: 20,
          padding: "20px 16px",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: st.dark }}>
          {seg.block === "break" ? "Break" : BLOCKS[seg.block].label} · {idx + 1} of {segments.length}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: st.dark, margin: "6px 0 2px" }}>
          {seg.title}
        </div>
        <div style={{ fontSize: 14, color: st.dark, marginBottom: 8 }}>{seg.detail}</div>
        <div
          aria-live="off"
          style={{ fontFamily: FONT_DISPLAY, fontSize: 72, lineHeight: 1.1, color: st.color }}
        >
          {fmt(remaining)}
        </div>
        <div style={{ height: 8, background: "white", borderRadius: 99, overflow: "hidden", margin: "8px auto 16px", maxWidth: 400 }}>
          <div style={{ width: `${segPct}%`, height: "100%", background: st.color, transition: "width 0.25s linear" }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <CtrlButton primary color={st.color} onClick={toggleRun}>
            {running ? <FaPause /> : <FaPlay />} {running ? "Pause" : finished ? "Again" : "Start"}
          </CtrlButton>
          <CtrlButton color={st.color} onClick={skip}>
            <FaForward /> Skip
          </CtrlButton>
          <CtrlButton color={st.color} onClick={() => jump(idx)}>
            <FaRedo /> Reset
          </CtrlButton>
        </div>
        <div
          style={{
            background: "white",
            borderLeft: `6px solid ${st.color}`,
            borderRadius: 12,
            padding: "10px 14px",
            textAlign: "left",
            fontSize: 14,
            color: st.dark,
          }}
        >
          <strong>Teacher tip: </strong>
          {seg.tip}
        </div>
      </div>

      {/* Overall progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
          <span>Overall progress</span>
          <span style={{ color: MUTED }}>
            {fmt(elapsedMs)} / {fmt(totalMs)} ({pct}%)
          </span>
        </div>
        <div style={{ height: 12, background: LINE, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "#EAB308", transition: "width 0.25s linear" }} />
        </div>
      </div>

      {/* Segment list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {segments.map((s, i) => {
          const c = styleOf(s);
          const current = i === idx && !finished;
          const done = finished || i < idx;
          return (
            <button
              key={s.id}
              onClick={() => jump(i)}
              aria-current={current ? "step" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 12,
                border: `2px solid ${current ? c.color : "transparent"}`,
                borderLeft: `6px solid ${c.color}`,
                background: current ? c.bg : "white",
                boxShadow: current ? "none" : `inset 0 0 0 1px ${LINE}`,
                opacity: done ? 0.6 : 1,
                cursor: "pointer",
                fontFamily: FONT_BODY,
                color: INK,
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  flex: "0 0 22px",
                  height: 22,
                  borderRadius: "50%",
                  background: done ? c.color : "transparent",
                  border: `2px solid ${c.color}`,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                }}
              >
                {done && <FaCheck />}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 800, fontSize: 14, textDecoration: done ? "line-through" : "none" }}>
                  {s.title}
                </span>
                <span style={{ display: "block", fontSize: 12, color: MUTED }}>{s.detail}</span>
              </span>
              <span style={{ fontWeight: 800, fontSize: 13, color: c.dark, whiteSpace: "nowrap" }}>{s.min} min</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
