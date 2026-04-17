import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */
const LEVELS = [
  {
    type: 0, name: "Type 0 — Recursively Enumerable", short: "RE",
    grammar: "Unrestricted Grammar", automaton: "Turing Machine",
    production: "α → β (no restrictions)",
    color: "#f97316", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.4)",
    desc: "The most general class. Recognized by Turing machines. These grammars have no restrictions on production rules — any string of symbols can be rewritten to any other.",
    key: "Unlimited tape memory. Can simulate any computation.",
    examples: [
      "L = {w | w encodes a halting TM}",
      "Complement of decidable languages",
      "Post Correspondence Problem",
      "L = {⟨M,w⟩ | M accepts w}",
      "L = {M | M accepts at least one string}",
      "Diophantine equations with solutions",
    ],
    realWorld: [
      { title: "General Program Verification", desc: "Checking whether an arbitrary program halts on a given input — the Halting Problem — is RE-complete. Static analysis tools approximate this." },
      { title: "Theorem Proving", desc: "The set of all provable theorems in formal arithmetic is recursively enumerable. Proof assistants like Coq enumerate proofs forward from axioms." },
      { title: "Malware Detection (Undecidable Core)", desc: "Detecting all possible malware behaviours is provably undecidable — virus scanners use approximations (heuristics, signatures) because the general problem is RE-hard." },
      { title: "AI / General Computation", desc: "Any algorithm a computer can ever run lives in the RE class. Neural network training loops, search engines, and OS kernels are all instances of Turing-complete computation." },
    ],
  },
  {
    type: 1, name: "Type 1 — Context-Sensitive", short: "CSL",
    grammar: "Context-Sensitive Grammar", automaton: "Linear Bounded Automaton",
    production: "αAβ → αγβ  (|LHS| ≤ |RHS|)",
    color: "#f472b6", bg: "rgba(244,114,182,0.10)", border: "rgba(244,114,182,0.4)",
    desc: "Recognized by linear bounded automata (Turing machine with tape proportional to input). Production rules cannot shrink the string — context matters.",
    key: "Bounded tape. Productions are non-contracting.",
    examples: [
      "aⁿbⁿcⁿ",
      "ww (string repeated twice)",
      "{aⁱbʲcᵏ | i≤j≤k}",
      "aⁿ² (perfect square number of a's)",
      "Swiss-German cross-serial dependencies",
      "{w | w is a valid chess position}",
      "{aⁿbᵐcⁿdᵐ | n,m ≥ 1}",
    ],
    realWorld: [
      { title: "Natural Language Syntax", desc: "Some human language constructs (e.g. Swiss-German cross-serial verb dependencies) require context-sensitive power. Mildly context-sensitive grammars (Tree-Adjoining Grammars) are used in NLP parsers." },
      { title: "RNA Secondary Structure", desc: "Predicting RNA pseudoknot structures requires context-sensitive rules — the polymer folds back on itself in ways CFGs can't capture." },
      { title: "Bounded Model Checking", desc: "Verifying hardware or software correctness within a fixed memory budget uses LBA-equivalent computations — the state space is bounded by the input size." },
      { title: "Type Systems in Programming Languages", desc: "Dependent type checking in languages like Agda or Coq with bounded resources can be modelled by context-sensitive grammars." },
    ],
  },
  {
    type: 2, name: "Type 2 — Context-Free", short: "CFL",
    grammar: "Context-Free Grammar (CFG)", automaton: "Pushdown Automaton (PDA)",
    production: "A → γ  (single variable → any string)",
    color: "#818cf8", bg: "rgba(129,140,248,0.10)", border: "rgba(129,140,248,0.4)",
    desc: "Recognized by pushdown automata (finite automaton + stack). Handles nested and recursive structures — the backbone of programming language parsers.",
    key: "Stack memory. Can match nested pairs.",
    examples: [
      "aⁿbⁿ",
      "Balanced parentheses",
      "Palindromes over {a,b}",
      "wwᴿ (even palindromes)",
      "Arithmetic expressions: 1+(2*3)",
      "HTML tag nesting (simplified)",
      "Most programming language syntax",
      "{ aⁿb²ⁿ | n ≥ 0 }",
      "JSON structure (without duplicate key constraint)",
    ],
    realWorld: [
      { title: "Programming Language Compilers", desc: "The syntax of nearly every programming language (C, Python, Java, Rust) is defined by a CFG. Parsers (LL, LR, LALR) use PDA-equivalent algorithms to build abstract syntax trees." },
      { title: "XML / HTML / JSON Parsing", desc: "Nested markup and JSON objects are context-free. Browsers parse HTML using CFG-based parsers. The DOM is the parse tree." },
      { title: "Mathematical Expression Evaluation", desc: "Arithmetic with operator precedence and parentheses is context-free. Every calculator and spreadsheet engine parses expressions with a CFG." },
      { title: "Code Auto-complete & Syntax Highlighting", desc: "IDEs like VSCode use incremental CFG parsers (e.g. Tree-sitter) to provide real-time syntax highlighting and structural code folding." },
      { title: "Protocol Buffer / Schema Validation", desc: "Protobuf schemas and API spec languages like OpenAPI define nested structures — validated with CFG-based parsers." },
    ],
  },
  {
    type: 3, name: "Type 3 — Regular", short: "REG",
    grammar: "Regular Grammar", automaton: "Finite Automaton (DFA/NFA)",
    production: "A → aB  or  A → a",
    color: "#2dd4bf", bg: "rgba(45,212,191,0.10)", border: "rgba(45,212,191,0.4)",
    desc: "The simplest class. Recognized by finite automata and described by regular expressions. No memory — cannot count or match nested structures.",
    key: "No memory. Fixed finite states only.",
    examples: [
      "a*b*",
      "(ab)*",
      "Strings ending in 'ab'",
      "[a-z]+ (identifiers)",
      "\\d{3}-\\d{4} (phone format)",
      "Strings with even number of a's",
      "(0|1)* (binary strings)",
      "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,} (email format)",
      "Keywords: if|else|while|for",
    ],
    realWorld: [
      { title: "Lexical Analysis (Tokenizers)", desc: "The first phase of every compiler — splitting source code into tokens (identifiers, numbers, keywords) — is done with regular expressions / DFAs. Tools: flex, re2c." },
      { title: "Text Search & grep", desc: "grep, sed, awk, ripgrep all use regular expression engines (NFA/DFA) to match patterns in text files. POSIX regex is a standardized regular language." },
      { title: "Network Packet Filtering", desc: "Firewall rules and intrusion detection signatures (Snort, Suricata) are compiled to DFAs to match packet payloads at line speed — millions of packets per second." },
      { title: "Input Validation", desc: "Email addresses, phone numbers, ZIP codes, credit card formats — all validated with regular expressions in every web framework (React, Django, Rails)." },
      { title: "Log Parsing & Monitoring", desc: "Observability tools (Splunk, Datadog, ELK) use regex patterns to parse structured fields out of log lines in real time." },
    ],
  },
];

const LANGUAGES = [
  { name: "a*b*", type: 3, desc: "Zero or more a's followed by zero or more b's", test: s => /^a*b*$/.test(s) },
  { name: "(ab)*", type: 3, desc: "Repetitions of 'ab'", test: s => /^(ab)*$/.test(s) },
  { name: "Strings ending in 'ab'", type: 3, desc: "Any string over {a,b} ending with ab", test: s => /^[ab]*ab$/.test(s) },
  { name: "[a-z]+", type: 3, desc: "One or more lowercase letters", test: s => /^[a-z]+$/.test(s) },
  { name: "aⁿbⁿ (n≥0)", type: 2, desc: "Equal number of a's then b's", test: s => { if (s === '') return true; const m = s.match(/^(a+)(b+)$/); return m ? m[1].length === m[2].length : false; }},
  { name: "Balanced parentheses", type: 2, desc: "Properly nested ( and )", test: s => { let d=0; for(const c of s){if(c==='(')d++;else if(c===')')d--;if(d<0)return false; if(c!=='('&&c!==')')return false;} return d===0; }},
  { name: "Palindromes over {a,b}", type: 2, desc: "Strings equal to their reverse", test: s => /^[ab]*$/.test(s) && s === s.split('').reverse().join('') },
  { name: "wwᴿ (even palindromes)", type: 2, desc: "Even-length palindromes", test: s => s.length%2===0 && /^[ab]*$/.test(s) && s === s.split('').reverse().join('') },
  { name: "aⁿbⁿcⁿ (n≥0)", type: 1, desc: "Equal a's, b's, and c's in order", test: s => { if(s==='')return true; const m=s.match(/^(a+)(b+)(c+)$/); return m?m[1].length===m[2].length&&m[2].length===m[3].length:false; }},
  { name: "ww (string doubled)", type: 1, desc: "A string concatenated with itself", test: s => s.length%2===0 && s.slice(0,s.length/2)===s.slice(s.length/2) },
  { name: "aⁿ² (perfect square a's)", type: 1, desc: "Number of a's is a perfect square", test: s => /^a*$/.test(s) && Number.isInteger(Math.sqrt(s.length)) },
];

/* ═══════════════════════════════════════════════════
   NESTED CITIES SUBSET EXPLAINER
   ═══════════════════════════════════════════════════ */
const CITIES = [
  {
    emoji: "🌌", label: "Universe", type: "Type 0 — Recursively Enumerable", color: "#f97316",
    tagline: "No rules. Anything goes.",
    plain: "Imagine the entire universe — infinite space, no limits. A Turing Machine can wander forever with no memory cap. This class contains every possible language, including ones that may never terminate.",
    contains: "Contains everything below it.",
  },
  {
    emoji: "🌍", label: "Country", type: "Type 1 — Context-Sensitive", color: "#f472b6",
    tagline: "Bounded land. Clear borders.",
    plain: "Zoom into a country. It has borders — you can only use the land you were given (the input tape). Context matters here: grammar rules change depending on what symbols surround you.",
    contains: "Every city (CFL) is inside a country.",
  },
  {
    emoji: "🏙️", label: "City", type: "Type 2 — Context-Free", color: "#818cf8",
    tagline: "Stack of buildings. Nested structure.",
    plain: "A city has skyscrapers — floors nested inside floors. A PDA's stack is like an elevator tracking which floor you're on. Perfect for matching pairs and nested brackets in code.",
    contains: "Every village (Regular) is inside a city.",
  },
  {
    emoji: "🏘️", label: "Village", type: "Type 3 — Regular", color: "#2dd4bf",
    tagline: "Simple. No memory needed.",
    plain: "A tiny village where everyone knows each other — no directory needed. You just walk from house to house (state to state). Simple patterns only, no counting, no nesting.",
    contains: "The smallest, simplest class.",
  },
];

function SubsetStory() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "11px 16px",
          background: open ? "rgba(129,140,248,0.10)" : "rgba(var(--w-rgb),0.03)",
          border: `1px solid ${open ? "rgba(129,140,248,0.35)" : "rgba(var(--w-rgb),0.08)"}`,
          borderRadius: 10, color: open ? "#818cf8" : "rgba(var(--w-rgb),0.45)",
          fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "all 0.2s",
        }}
      >
        <span>🪆  Why are they nested? — Plain English explanation</span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{open ? "▲ hide" : "▼ show"}</span>
      </button>

      {open && (
        <div style={{
          marginTop: 8, padding: 20,
          background: "var(--panel-bg)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, animation: "fadeIn 0.3s ease",
        }}>
          <p style={{ fontSize: 13, color: "rgba(var(--w-rgb),0.5)", margin: "0 0 18px", lineHeight: 1.6 }}>
            Think of the four types as <span style={{ color: "var(--text-main)" }}>nested places</span> — a village inside a city, inside a country, inside the universe.
            Every language in the village <em>also</em> lives in the city, the country, and the universe.
            But not everything in the universe fits in a village.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {CITIES.map((c, i) => {
              const isActive = active === i;
              return (
                <div
                  key={i}
                  onClick={() => setActive(isActive ? null : i)}
                  style={{
                    padding: "12px 16px",
                    background: isActive ? `${c.color}12` : "rgba(var(--w-rgb),0.02)",
                    border: `1px solid ${isActive ? c.color + "55" : "rgba(var(--w-rgb),0.06)"}`,
                    borderRadius: 9, cursor: "pointer", transition: "all 0.2s",
                    marginLeft: i * 18,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{c.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, color: c.color, fontSize: 14 }}>{c.label}</span>
                        <span style={{ fontSize: 11, color: "rgba(var(--w-rgb),0.3)", fontFamily: "'IBM Plex Mono', monospace" }}>{c.type}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(var(--w-rgb),0.4)", marginTop: 2 }}>{c.tagline}</div>
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(var(--w-rgb),0.2)" }}>{isActive ? "▲" : "▼"}</span>
                  </div>
                  {isActive && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", animation: "fadeIn 0.2s ease" }}>
                      <p style={{ fontSize: 13, color: "rgba(var(--w-rgb),0.6)", margin: "0 0 8px", lineHeight: 1.6 }}>{c.plain}</p>
                      <div style={{ fontSize: 12, color: c.color, fontStyle: "italic" }}>↳ {c.contains}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)" }}>
            <div style={{ fontSize: 11, color: "#818cf8", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4, letterSpacing: "0.08em" }}>KEY TAKEAWAY</div>
            <div style={{ fontSize: 13, color: "rgba(var(--w-rgb),0.55)", lineHeight: 1.6 }}>
              Regular ⊂ Context-Free ⊂ Context-Sensitive ⊂ Recursively Enumerable<br />
              <span style={{ color: "rgba(var(--w-rgb),0.35)", fontSize: 12 }}>Every simpler class is fully contained inside the more powerful ones above it.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SYMBOL KEYBOARD (shared component)
   ═══════════════════════════════════════════════════ */
const KEYBOARD_ROWS = [
  ["a", "b", "c", "n", "0", "1", "(", ")", "{", "}"],
  ["ε", "→", "δ", "Σ", "Γ", "∪", "∩", "∅", "*", "+"],
  ["⊂", "⊃", "∈", "∉", "≤", "≥", "≠", "|", "λ", "∀"],
  ["⁰", "¹", "²", "³", "⁴", "⁵", "ⁿ", "ⁱ", "ʲ", "ᵏ"],
  ["₀", "₁", "₂", "₃", "ₙ", "ₘ", "ₐ", "ᵃ", "ᵇ", "ᶜ"],
];

function SymbolKeyboard({ targetRef }) {
  const [show, setShow] = useState(false);
  const insert = useCallback((sym) => {
    const ta = targetRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const val = ta.value;
    ta.value = val.substring(0, start) + sym + val.substring(end);
    ta.selectionStart = ta.selectionEnd = start + sym.length;
    ta.focus();
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }, [targetRef]);

  return (
    <div style={{ marginTop: 6 }}>
      <button onClick={() => setShow(!show)} style={{ background: show ? "rgba(129,140,248,0.12)" : "rgba(var(--w-rgb),0.04)", border: `1px solid ${show ? "rgba(129,140,248,0.4)" : "rgba(var(--w-rgb),0.08)"}`, borderRadius: 6, padding: "5px 14px", color: show ? "#818cf8" : "rgba(var(--w-rgb),0.5)", fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s" }}>
        {show ? "▾ Hide Keyboard" : "▸ Symbol Keyboard"}
      </button>
      {show && (
        <div style={{ marginTop: 8, padding: 10, background: "rgba(var(--b-rgb),0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, animation: "fadeIn 0.2s ease" }}>
          {(() => {
            const rowLabels = ["abc", "sym", "set", "sup", "sub"];
            return KEYBOARD_ROWS.map((row, ri) => (
              <div key={ri} style={{ display: "flex", gap: 4, marginBottom: ri < KEYBOARD_ROWS.length - 1 ? 4 : 0, alignItems: "center" }}>
                <span style={{ width: 28, fontSize: 9, color: "rgba(var(--w-rgb),0.2)", fontFamily: "'IBM Plex Mono', monospace", textAlign: "right", flexShrink: 0 }}>{rowLabels[ri]}</span>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", flex: 1 }}>
                  {row.map(sym => (
                    <button key={sym} onClick={() => insert(sym)} style={{ width: 36, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: ri >= 3 ? "rgba(129,140,248,0.06)" : "rgba(var(--w-rgb),0.05)", border: `1px solid ${ri >= 3 ? "rgba(129,140,248,0.15)" : "rgba(var(--w-rgb),0.1)"}`, borderRadius: 5, color: ri >= 3 ? "#a5b4fc" : "var(--text-main)", fontSize: 14, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.target.style.background = "rgba(129,140,248,0.2)"; e.target.style.borderColor = "rgba(129,140,248,0.5)"; }}
                      onMouseLeave={e => { e.target.style.background = ri >= 3 ? "rgba(129,140,248,0.06)" : "rgba(var(--w-rgb),0.05)"; e.target.style.borderColor = ri >= 3 ? "rgba(129,140,248,0.15)" : "rgba(var(--w-rgb),0.1)"; }}>
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            ));
          })()}
          <div style={{ display: "flex", gap: 4, marginTop: 4, justifyContent: "center" }}>
            {["Space", "Backspace", "Clear"].map(label => (
              <button key={label} onClick={() => {
                const ta = targetRef.current; if (!ta) return;
                if (label === "Space") insert(" ");
                else if (label === "Backspace") { const s = ta.selectionStart; if (s > 0) { ta.value = ta.value.slice(0, s - 1) + ta.value.slice(s); ta.selectionStart = ta.selectionEnd = s - 1; ta.focus(); ta.dispatchEvent(new Event('input', { bubbles: true })); } }
                else { ta.value = ""; ta.focus(); ta.dispatchEvent(new Event('input', { bubbles: true })); }
              }} style={{ padding: "6px 16px", background: "rgba(var(--w-rgb),0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, color: "rgba(var(--w-rgb),0.6)", fontSize: 11, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.15s" }}
                onMouseEnter={e => { e.target.style.background = "rgba(var(--w-rgb),0.1)"; }}
                onMouseLeave={e => { e.target.style.background = "rgba(var(--w-rgb),0.04)"; }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SIM BUTTON HELPER
   ═══════════════════════════════════════════════════ */
function simBtn(color, ghost = false) {
  return {
    padding: "7px 16px", background: ghost ? "transparent" : `${color}18`,
    border: `1px solid ${color}55`, borderRadius: 6, color,
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s",
  };
}

/* ═══════════════════════════════════════════════════
   FEATURE 1: DFA SIMULATOR (Type 3) — with free-text language input
   ═══════════════════════════════════════════════════ */

// Known DFA language presets
const DFA_PRESETS = [
  {
    label: "a*b*",
    desc: "Zero or more a's, then zero or more b's",
    alphabet: ["a","b"],
    states: ["q0","q1","qDead"],
    initial: "q0",
    accept: ["q0","q1"],
    transitions: { q0:{a:"q0",b:"q1"}, q1:{b:"q1",a:"qDead"}, qDead:{a:"qDead",b:"qDead"} },
    stateLabels: { q0:"q₀ start / reading a's", q1:"q₁ reading b's", qDead:"qDead error" },
    stateColors: { q0:"#2dd4bf", q1:"#2dd4bf", qDead:"#f97316" },
  },
  {
    label: "(ab)*",
    desc: "Repetitions of the pair 'ab'",
    alphabet: ["a","b"],
    states: ["q0","q1","qDead"],
    initial: "q0",
    accept: ["q0"],
    transitions: { q0:{a:"q1",b:"qDead"}, q1:{b:"q0",a:"qDead"}, qDead:{a:"qDead",b:"qDead"} },
    stateLabels: { q0:"q₀ start/after ab", q1:"q₁ after a", qDead:"qDead error" },
    stateColors: { q0:"#2dd4bf", q1:"#2dd4bf", qDead:"#f97316" },
  },
  {
    label: "Ends with 'ab'",
    desc: "Any string over {a,b} ending in 'ab'",
    alphabet: ["a","b"],
    states: ["q0","q1","q2"],
    initial: "q0",
    accept: ["q2"],
    transitions: { q0:{a:"q1",b:"q0"}, q1:{a:"q1",b:"q2"}, q2:{a:"q1",b:"q0"} },
    stateLabels: { q0:"q₀ start", q1:"q₁ saw 'a'", q2:"q₂ saw 'ab' ✓" },
    stateColors: { q0:"#2dd4bf", q1:"#2dd4bf", q2:"#2dd4bf" },
  },
  {
    label: "Even number of a's",
    desc: "Strings over {a,b} with an even count of a's",
    alphabet: ["a","b"],
    states: ["qEven","qOdd"],
    initial: "qEven",
    accept: ["qEven"],
    transitions: { qEven:{a:"qOdd",b:"qEven"}, qOdd:{a:"qEven",b:"qOdd"} },
    stateLabels: { qEven:"qEven even a's ✓", qOdd:"qOdd odd a's" },
    stateColors: { qEven:"#2dd4bf", qOdd:"#f97316" },
  },
];

function parseDFAFromText(text) {
  const s = text.toLowerCase().trim();
  // Try to match known patterns
  if (/^\(?a\*b\*\)?$/.test(s.replace(/\s/g,''))) return DFA_PRESETS[0];
  if (/^\(?ab\)\*$/.test(s.replace(/\s/g,''))) return DFA_PRESETS[1];
  if (/end.*ab|ab.*end|ends.*ab/.test(s)) return DFA_PRESETS[2];
  if (/even.*a|a.*even/.test(s)) return DFA_PRESETS[3];
  return null;
}

function DFAVisualizer() {
  const [mode, setMode] = useState("preset"); // "preset" | "custom"
  const [presetIdx, setPresetIdx] = useState(0);
  const [customText, setCustomText] = useState("");
  const [customError, setCustomError] = useState("");
  const [activeDFA, setActiveDFA] = useState(DFA_PRESETS[0]);
  const [input, setInput] = useState("aaabb");
  const [stepIdx, setStepIdx] = useState(-1);
  const [result, setResult] = useState(null);
  const customRef = useRef(null);

  const loadCustom = () => {
    const parsed = parseDFAFromText(customText);
    if (parsed) {
      setActiveDFA(parsed);
      setCustomError("");
      handleReset();
    } else {
      setCustomError("Language not recognized. Try: a*b*, (ab)*, ends with ab, even number of a's");
    }
  };

  const dfa = activeDFA;

  const trace = (() => {
    const states = [dfa.initial];
    for (const ch of input) {
      const prev = states[states.length - 1];
      const next = dfa.transitions[prev]?.[ch] ?? "qDead";
      states.push(next);
    }
    return states;
  })();

  const started = stepIdx >= 0;
  const currentState = started ? trace[stepIdx] : null;
  const finished = stepIdx === trace.length - 1;

  const handleStep = () => {
    const next = stepIdx + 1;
    setStepIdx(next);
    if (next === trace.length - 1) {
      const finalState = trace[trace.length - 1];
      setResult(dfa.accept.includes(finalState) ? "accepted" : "rejected");
    }
  };
  const handleReset = () => { setStepIdx(-1); setResult(null); };

  const color = "#2dd4bf";

  return (
    <div style={{ marginTop: 20, padding: 18, background: "rgba(var(--b-rgb),0.25)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: 10 }}>
      <div style={{ fontSize: 11, color, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", marginBottom: 14 }}>
        DFA SIMULATOR — Type 3 (Regular)
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, background: "rgba(var(--b-rgb),0.3)", borderRadius: 8, padding: 3 }}>
        {[["preset","Choose Preset"],["custom","Type a Language"]].map(([id,label]) => (
          <button key={id} onClick={() => { setMode(id); handleReset(); }} style={{ flex:1, padding:"7px 10px", border:"none", borderRadius:6, background: mode===id?"rgba(45,212,191,0.15)":"transparent", color: mode===id?color:"rgba(var(--w-rgb),0.4)", fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Mono', monospace", fontWeight: mode===id?600:400, transition:"all 0.2s" }}>{label}</button>
        ))}
      </div>

      {mode === "preset" ? (
        <div style={{ marginBottom: 12 }}>
          <select value={presetIdx} onChange={e => { setPresetIdx(+e.target.value); setActiveDFA(DFA_PRESETS[+e.target.value]); handleReset(); }} style={{ width:"100%", padding:"8px 12px", background:"rgba(var(--b-rgb),0.4)", border:"1px solid rgba(45,212,191,0.25)", borderRadius:6, color:"var(--text-main)", fontSize:13, fontFamily:"'IBM Plex Mono', monospace", outline:"none" }}>
            {DFA_PRESETS.map((p,i) => <option key={i} value={i} style={{background:"var(--select-bg)"}}>{p.label} — {p.desc}</option>)}
          </select>
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <input
            ref={customRef}
            type="text"
            value={customText}
            onChange={e => { setCustomText(e.target.value); setCustomError(""); }}
            onKeyDown={e => { if(e.key==="Enter") loadCustom(); }}
            placeholder="e.g. a*b*, (ab)*, ends with ab, even number of a's"
            style={{ width:"100%", padding:"8px 12px", background:"rgba(var(--b-rgb),0.4)", border:`1px solid ${customError?"rgba(249,115,22,0.4)":"rgba(45,212,191,0.25)"}`, borderRadius:6, color:"var(--text-main)", fontSize:13, fontFamily:"'IBM Plex Mono', monospace", outline:"none", marginBottom:6 }}
          />
          <SymbolKeyboard targetRef={customRef} />
          <button onClick={loadCustom} style={{ ...simBtn(color), marginTop:8 }}>Load Language →</button>
          {customError && <div style={{ fontSize:11, color:"#f97316", marginTop:6, fontFamily:"'IBM Plex Mono', monospace" }}>⚠ {customError}</div>}
        </div>
      )}

      <div style={{ fontSize: 11, color: "rgba(var(--w-rgb),0.35)", marginBottom: 10, fontFamily:"'IBM Plex Mono', monospace" }}>
        Active language: <span style={{color}}>{dfa.label}</span> — {dfa.desc}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <input
          value={input}
          onChange={e => { setInput(e.target.value.replace(new RegExp(`[^${dfa.alphabet.join('')}]`,'g'),"")); handleReset(); }}
          placeholder={`chars: ${dfa.alphabet.join(', ')}`}
          style={{ background: "rgba(var(--w-rgb),0.04)", border: "1px solid rgba(45,212,191,0.25)", color: "var(--text-main)", padding: "7px 12px", borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, width: 180, outline: "none" }}
        />
        {!started && <button onClick={() => setStepIdx(0)} style={simBtn(color)}>Start</button>}
        {started && !finished && <button onClick={handleStep} style={simBtn(color)}>Step →</button>}
        <button onClick={handleReset} style={simBtn(color, true)}>Reset</button>
      </div>

      {input.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "rgba(var(--w-rgb),0.3)", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>TAPE</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {input.split("").map((ch, i) => {
              const isReading = stepIdx > 0 && i === stepIdx - 1;
              const wasRead = stepIdx > 0 && i < stepIdx - 1;
              return (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 5, border: `2px solid ${isReading ? color : wasRead ? "rgba(45,212,191,0.25)" : "rgba(var(--w-rgb),0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 500, color: isReading ? color : wasRead ? "rgba(var(--w-rgb),0.3)" : "rgba(var(--w-rgb),0.65)", background: isReading ? "rgba(45,212,191,0.08)" : "transparent", transition: "all 0.2s" }}>{ch}</div>
              );
            })}
            <div style={{ width: 32, height: 32, borderRadius: 5, border: "2px dashed rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "rgba(var(--w-rgb),0.2)" }}>⊣</div>
          </div>
        </div>
      )}

      {currentState && (
        <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 10, background: `${(dfa.stateColors||{})[currentState]||color}10`, border: `1px solid ${(dfa.stateColors||{})[currentState]||color}35`, fontSize: 13, color: (dfa.stateColors||{})[currentState]||color, fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.3s" }}>
          Current state: <strong>{(dfa.stateLabels||{})[currentState]||currentState}</strong>
          {stepIdx > 0 && <span style={{ color: "rgba(var(--w-rgb),0.35)", marginLeft: 10, fontSize: 11 }}>read '{input[stepIdx - 1]}'</span>}
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, color: "rgba(var(--w-rgb),0.25)", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>STATE TRANSITIONS</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(dfa.transitions).flatMap(([from, tos]) =>
            Object.entries(tos).map(([sym, to]) => ({ from, sym, to }))
          ).map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 2 }}>
              <span style={{ color: currentState === t.from ? color : "rgba(var(--w-rgb),0.3)" }}>{t.from}</span>
              <span style={{ color: "rgba(var(--w-rgb),0.2)" }}>—{t.sym}→</span>
              <span style={{ color: t.to === "qDead" ? "#f97316" : currentState === t.to ? color : "rgba(var(--w-rgb),0.3)" }}>{t.to}</span>
              <span style={{ color: "rgba(var(--w-rgb),0.1)", marginLeft: 2 }}>|</span>
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: result === "accepted" ? "rgba(45,212,191,0.08)" : "rgba(249,115,22,0.08)", border: `1px solid ${result === "accepted" ? "rgba(45,212,191,0.35)" : "rgba(249,115,22,0.35)"}`, fontSize: 14, fontWeight: 600, color: result === "accepted" ? color : "#f97316", fontFamily: "'IBM Plex Mono', monospace" }}>
          {result === "accepted" ? `✓ ACCEPTED — string is in ${dfa.label}` : `✗ REJECTED — string is not in ${dfa.label}`}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PUMPING LEMMA SIMULATOR (Type 3)
   ═══════════════════════════════════════════════════ */
function PumpingLemmaREG() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState(0); // 0=intro,1=choose_p,2=choose_w,3=decompose,4=pump,5=result
  const [p, setP] = useState(4);
  const [w, setW] = useState("");
  const [wError, setWError] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [z, setZ] = useState("");
  const [decompError, setDecompError] = useState("");
  const [pumpN, setPumpN] = useState(2);
  const [verdict, setVerdict] = useState(null);
  // Example language to disprove
  const [langChoice, setLangChoice] = useState("anbn");

  const LANG_DESCS = {
    anbn: { name: "aⁿbⁿ", classify: "CFL (not regular)", isInLang: s => { if(s==='')return true; const m=s.match(/^(a+)(b+)$/); return m?m[1].length===m[2].length:false; } },
    palindrome: { name: "Palindromes over {a,b}", classify: "CFL (not regular)", isInLang: s => /^[ab]*$/.test(s) && s===s.split('').reverse().join('') },
    astar: { name: "a* (this IS regular)", classify: "Regular — pumping lemma holds!", isInLang: s => /^a*$/.test(s) },
  };

  const lang = LANG_DESCS[langChoice];

  const reset = () => { setPhase(0); setW(""); setX(""); setY(""); setZ(""); setWError(""); setDecompError(""); setVerdict(null); setPumpN(2); };

  const chooseW = () => {
    // Try to auto-suggest w based on p
    const suggested = langChoice==="anbn" ? "a".repeat(p)+"b".repeat(p) : langChoice==="palindrome" ? "a".repeat(p)+"b"+"a".repeat(p) : "a".repeat(p);
    setW(suggested); setWError(""); setPhase(3);
  };

  const checkDecomp = () => {
    const full = x + y + z;
    if (full !== w) { setDecompError(`x+y+z = "${full}" but w = "${w}". They must concatenate to w.`); return; }
    if (y.length === 0) { setDecompError("y must be non-empty (|y| ≥ 1)."); return; }
    if ((x+y).length > p) { setDecompError(`|xy| = ${(x+y).length} > p = ${p}. xy must have length ≤ p.`); return; }
    setDecompError(""); setPhase(4);
  };

  const doPump = () => {
    const pumped = x + y.repeat(pumpN) + z;
    const inLang = lang.isInLang(pumped);
    if (langChoice==="astar") {
      setVerdict({ pumped, accepted: true, msg: `✓ "${pumped}" is still in a*. Pumping lemma holds for regular languages.`, color:"#2dd4bf" });
    } else {
      setVerdict({
        pumped, accepted: inLang,
        msg: inLang
          ? `Hmm, "${pumped}" is still in the language for i=${pumpN}. Try a different decomposition or pump value.`
          : `✓ "${pumped}" is NOT in ${lang.name}. This contradicts the pumping lemma — proving ${lang.name} is NOT regular!`,
        color: inLang ? "#f97316" : "#2dd4bf"
      });
    }
    setPhase(5);
  };

  const color = "#2dd4bf";

  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={() => setOpen(o=>!o)} style={{ width:"100%", padding:"10px 14px", background: open?"rgba(45,212,191,0.08)":"rgba(var(--b-rgb),0.2)", border:`1px solid ${open?"rgba(45,212,191,0.3)":"rgba(45,212,191,0.1)"}`, borderRadius:8, color: open?color:"rgba(45,212,191,0.6)", fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Mono', monospace", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span>🔬 Pumping Lemma (Regular) — Interactive Proof</span>
        <span style={{fontSize:10}}>{open?"▲ hide":"▼ show"}</span>
      </button>

      {open && (
        <div style={{ marginTop:8, padding:18, background:"rgba(var(--b-rgb),0.25)", border:"1px solid rgba(45,212,191,0.15)", borderRadius:10, animation:"fadeIn 0.3s ease" }}>
          <div style={{ marginBottom:14 }}>
            <div style={{fontSize:10, color:"rgba(var(--w-rgb),0.3)", fontFamily:"'IBM Plex Mono', monospace", marginBottom:6}}>CHOOSE LANGUAGE TO TEST</div>
            <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
              {Object.entries(LANG_DESCS).map(([k,v]) => (
                <button key={k} onClick={() => { setLangChoice(k); reset(); }} style={{ padding:"6px 12px", background: langChoice===k?"rgba(45,212,191,0.15)":"rgba(var(--w-rgb),0.04)", border:`1px solid ${langChoice===k?"rgba(45,212,191,0.4)":"rgba(var(--w-rgb),0.08)"}`, borderRadius:6, color: langChoice===k?color:"rgba(var(--w-rgb),0.5)", fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Mono', monospace" }}>{v.name}</button>
              ))}
            </div>
            <div style={{fontSize:11, color:"rgba(var(--w-rgb),0.35)", marginTop:6, fontFamily:"'IBM Plex Mono', monospace"}}>Classification: <span style={{color: lang.classify.includes("regular!")?"#f97316":color}}>{lang.classify}</span></div>
          </div>

          <div style={{padding:"10px 14px", background:"rgba(var(--b-rgb),0.2)", borderRadius:8, marginBottom:14, fontSize:12, color:"rgba(var(--w-rgb),0.5)", lineHeight:1.7}}>
            <strong style={{color:"var(--text-main)"}}>Pumping Lemma (Regular):</strong><br/>
            If L is regular, ∃ pumping length <span style={{color}}>p</span> such that<br/>
            for every <span style={{color}}>w ∈ L</span> with |w| ≥ p, we can write <span style={{color}}>w = xyz</span> where:<br/>
            &nbsp;• |y| ≥ 1 &nbsp;&nbsp;• |xy| ≤ p &nbsp;&nbsp;• for all i ≥ 0, <span style={{color}}>xyⁱz ∈ L</span>
          </div>

          {/* Step 1 */}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10, color:color, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6}}>STEP 1 — Adversary chooses pumping length p</div>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <span style={{fontSize:13, color:"rgba(var(--w-rgb),0.5)"}}>p =</span>
              <input type="number" value={p} min={1} max={20} onChange={e=>{ setP(+e.target.value); reset(); }} style={{width:60, padding:"5px 8px", background:"rgba(var(--b-rgb),0.4)", border:"1px solid rgba(45,212,191,0.3)", borderRadius:5, color:"var(--text-main)", fontFamily:"'IBM Plex Mono', monospace", fontSize:14, outline:"none"}} />
              <button onClick={() => { setPhase(1); }} style={simBtn(color)}>Set p = {p}</button>
            </div>
          </div>

          {phase >= 1 && (
            <div style={{marginBottom:10, animation:"fadeIn 0.3s ease"}}>
              <div style={{fontSize:10, color:color, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6}}>STEP 2 — You choose w ∈ {lang.name} with |w| ≥ p = {p}</div>
              <div style={{fontSize:12, color:"rgba(var(--w-rgb),0.45)", marginBottom:8}}>
                We need a word in <span style={{color}}>{lang.name}</span> of length ≥ {p}. Suggested:
              </div>
              <button onClick={chooseW} style={simBtn(color)}>Use suggested w</button>
              {w && <span style={{marginLeft:10, fontFamily:"'IBM Plex Mono', monospace", color, fontSize:14}}>w = "{w}"</span>}
            </div>
          )}

          {phase >= 3 && (
            <div style={{marginBottom:10, animation:"fadeIn 0.3s ease"}}>
              <div style={{fontSize:10, color:color, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6}}>STEP 3 — Adversary decomposes w = xyz (|y|≥1, |xy|≤{p})</div>
              <div style={{fontSize:11, color:"rgba(var(--w-rgb),0.35)", marginBottom:8}}>w = "<span style={{color:"#f97316"}}>x</span><span style={{color:"#818cf8"}}>y</span><span style={{color:"#2dd4bf"}}>z</span>" — type each part:</div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:6}}>
                {[["x","#f97316",x,setX],["y","#818cf8",y,setY],["z","#2dd4bf",z,setZ]].map(([label,col,val,setter])=>(
                  <div key={label}>
                    <div style={{fontSize:10, color:col, fontFamily:"'IBM Plex Mono', monospace", marginBottom:3}}>{label}</div>
                    <input value={val} onChange={e=>{ setter(e.target.value); setDecompError(""); }} style={{width:90, padding:"6px 8px", background:"rgba(var(--b-rgb),0.4)", border:`1px solid ${col}44`, borderRadius:5, color:col, fontFamily:"'IBM Plex Mono', monospace", fontSize:13, outline:"none"}} />
                  </div>
                ))}
              </div>
              {decompError && <div style={{fontSize:11, color:"#f97316", marginBottom:6, fontFamily:"'IBM Plex Mono', monospace"}}>⚠ {decompError}</div>}
              <button onClick={checkDecomp} style={simBtn(color)}>Validate Decomposition</button>
            </div>
          )}

          {phase >= 4 && (
            <div style={{marginBottom:10, animation:"fadeIn 0.3s ease"}}>
              <div style={{fontSize:10, color:color, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6}}>STEP 4 — Pump: choose i and check if xyⁱz ∈ {lang.name}</div>
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
                <span style={{fontSize:13, color:"rgba(var(--w-rgb),0.5)"}}>i =</span>
                <input type="number" value={pumpN} min={0} max={10} onChange={e=>setPumpN(+e.target.value)} style={{width:55, padding:"5px 8px", background:"rgba(var(--b-rgb),0.4)", border:"1px solid rgba(45,212,191,0.3)", borderRadius:5, color:"var(--text-main)", fontFamily:"'IBM Plex Mono', monospace", fontSize:14, outline:"none"}} />
              </div>
              <div style={{fontSize:12, color:"rgba(var(--w-rgb),0.4)", marginBottom:8, fontFamily:"'IBM Plex Mono', monospace"}}>
                xy<sup>{pumpN}</sup>z = "{x}"{pumpN===0?"":y.repeat(Math.min(pumpN,5))+(pumpN>5?"...":"")}"{z}"
              </div>
              <button onClick={doPump} style={simBtn(color)}>Pump & Check</button>
            </div>
          )}

          {verdict && (
            <div style={{marginTop:10, padding:"12px 14px", borderRadius:8, background:`${verdict.color}10`, border:`1px solid ${verdict.color}40`, fontSize:13, color:verdict.color, fontFamily:"'IBM Plex Mono', monospace", animation:"fadeIn 0.3s ease", lineHeight:1.6}}>
              {verdict.msg}
            </div>
          )}

          <button onClick={reset} style={{...simBtn(color,true), marginTop:12, fontSize:11}}>↺ Reset</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PDA SIMULATOR (Type 2) — with free-text language input
   ═══════════════════════════════════════════════════ */

const PDA_PRESETS = [
  {
    label: "aⁿbⁿ",
    desc: "Equal number of a's followed by b's",
    run: (input) => {
      const steps = [];
      let stack = ["$"];
      let phase = "push";
      steps.push({ pos: -1, stack: [...stack], log: "Start — will push 'A' for each 'a', then pop for each 'b'.", phase });
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === 'a' && phase === 'push') {
          stack = ['A', ...stack];
          steps.push({ pos: i, stack: [...stack], log: `Read 'a' → pushed 'A'. Stack depth: ${stack.length - 1}.`, phase });
          if (input[i+1] === 'b') phase = 'pop';
        } else if (ch === 'b' && phase === 'pop') {
          if (stack[0] === 'A') {
            stack = stack.slice(1);
            steps.push({ pos: i, stack: [...stack], log: `Read 'b' → popped 'A'. Remaining: ${stack.length - 1}.`, phase });
          } else {
            steps.push({ pos: i, stack: [...stack], log: `Read 'b' but stack empty — too many b's!`, phase: 'error' });
            return { steps, accepted: false };
          }
        } else if (ch === 'b' && phase === 'push') {
          // no a before b
          phase = 'pop';
          if (stack[0] === 'A') {
            stack = stack.slice(1);
            steps.push({ pos: i, stack: [...stack], log: `Read 'b' → popped 'A'.`, phase });
          } else {
            steps.push({ pos: i, stack: [...stack], log: `Read 'b' but no matching 'A' on stack.`, phase: 'error' });
            return { steps, accepted: false };
          }
        } else {
          steps.push({ pos: i, stack: [...stack], log: `Unexpected symbol '${ch}' in phase ${phase}.`, phase: 'error' });
          return { steps, accepted: false };
        }
      }
      const accepted = stack.length === 1 && stack[0] === "$";
      steps.push({ pos: input.length, stack, log: accepted ? "✓ Stack back to '$' — all matched. ACCEPTED!" : "✗ Stack not empty — counts differ. REJECTED.", phase: accepted ? 'done' : 'error' });
      return { steps, accepted };
    }
  },
  {
    label: "Balanced parentheses",
    desc: "Properly nested ( and ) characters",
    run: (input) => {
      const steps = [];
      let stack = ["$"];
      steps.push({ pos: -1, stack: [...stack], log: "Start — push '(' for each open paren, pop for each ')'.  " });
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === '(') {
          stack = ['(', ...stack];
          steps.push({ pos: i, stack: [...stack], log: `Read '(' → pushed. Depth: ${stack.length-1}.` });
        } else if (ch === ')') {
          if (stack[0] === '(') {
            stack = stack.slice(1);
            steps.push({ pos: i, stack: [...stack], log: `Read ')' → matched '(', popped. Depth: ${stack.length-1}.` });
          } else {
            steps.push({ pos: i, stack: [...stack], log: `Read ')' but no matching '(' on stack!`, phase:'error' });
            return { steps, accepted: false };
          }
        } else {
          steps.push({ pos: i, stack: [...stack], log: `Invalid char '${ch}'.`, phase:'error' });
          return { steps, accepted: false };
        }
      }
      const accepted = stack.length === 1 && stack[0] === "$";
      steps.push({ pos: input.length, stack, log: accepted ? "✓ All parentheses matched. ACCEPTED!" : "✗ Unclosed parentheses remain. REJECTED.", phase: accepted?'done':'error' });
      return { steps, accepted };
    }
  },
  {
    label: "Palindrome over {a,b}",
    desc: "String equal to its reverse",
    run: (input) => {
      if (!/^[ab]*$/.test(input)) return { steps: [{ pos:-1, stack:["$"], log:"Invalid: only a and b allowed." }], accepted:false };
      const steps = [];
      let stack = ["$"];
      const n = input.length;
      steps.push({ pos:-1, stack:[...stack], log: "Push first half, then match second half." });
      const half = Math.floor(n/2);
      for (let i = 0; i < half; i++) {
        stack = [input[i], ...stack];
        steps.push({ pos:i, stack:[...stack], log:`Push '${input[i]}'` });
      }
      if (n%2===1) steps.push({ pos:half, stack:[...stack], log:`Skip middle char '${input[half]}'` });
      for (let i = (n%2===0?half:half+1); i < n; i++) {
        if (stack[0] === input[i]) {
          stack = stack.slice(1);
          steps.push({ pos:i, stack:[...stack], log:`Match '${input[i]}' → popped.` });
        } else {
          steps.push({ pos:i, stack:[...stack], log:`Mismatch: expected '${stack[0]}' but got '${input[i]}'. REJECTED.`, phase:'error' });
          return { steps, accepted:false };
        }
      }
      const accepted = stack.length===1 && stack[0]==="$";
      steps.push({ pos:n, stack, log: accepted?"✓ All matched. ACCEPTED!":"✗ Stack not empty. REJECTED.", phase: accepted?'done':'error' });
      return { steps, accepted };
    }
  }
];

function parsePDAFromText(text) {
  const s = text.toLowerCase().trim();
  if (/a.?n.?b.?n|equal.*a.*b|anbn/.test(s)) return PDA_PRESETS[0];
  if (/balance|paren|bracket/.test(s)) return PDA_PRESETS[1];
  if (/palindrome|reverse/.test(s)) return PDA_PRESETS[2];
  return null;
}

function PDAVisualizer() {
  const [mode, setMode] = useState("preset");
  const [presetIdx, setPresetIdx] = useState(0);
  const [customText, setCustomText] = useState("");
  const [customError, setCustomError] = useState("");
  const [activePDA, setActivePDA] = useState(PDA_PRESETS[0]);
  const [input, setInput] = useState("aaabbb");
  const [stepIdx, setStepIdx] = useState(-1);
  const [result, setResult] = useState(null);
  const [simData, setSimData] = useState(null);
  const customRef = useRef(null);
  const color = "#818cf8";

  const loadCustom = () => {
    const parsed = parsePDAFromText(customText);
    if (parsed) { setActivePDA(parsed); setCustomError(""); handleReset(); }
    else setCustomError("Language not recognized. Try: aⁿbⁿ, balanced parentheses, palindrome");
  };

  const handleReset = () => { setStepIdx(-1); setResult(null); setSimData(null); };

  const handleStart = () => {
    const data = activePDA.run(input);
    setSimData(data);
    setStepIdx(0);
  };

  const handleStep = () => {
    if (!simData) return;
    const next = stepIdx + 1;
    if (next >= simData.steps.length) return;
    setStepIdx(next);
    if (next === simData.steps.length - 1) setResult(simData.accepted ? "accepted" : "rejected");
  };

  const currentStep = simData && stepIdx >= 0 ? simData.steps[stepIdx] : null;
  const finished = simData && stepIdx === simData.steps.length - 1;

  return (
    <div style={{ marginTop: 20, padding: 18, background: "rgba(var(--b-rgb),0.25)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: 10 }}>
      <div style={{ fontSize: 11, color, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", marginBottom: 14 }}>
        PDA SIMULATOR — Type 2 (Context-Free)
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 12, background: "rgba(var(--b-rgb),0.3)", borderRadius: 8, padding: 3 }}>
        {[["preset","Choose Preset"],["custom","Type a Language"]].map(([id,label]) => (
          <button key={id} onClick={() => { setMode(id); handleReset(); }} style={{ flex:1, padding:"7px 10px", border:"none", borderRadius:6, background: mode===id?"rgba(129,140,248,0.15)":"transparent", color: mode===id?color:"rgba(var(--w-rgb),0.4)", fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Mono', monospace", fontWeight: mode===id?600:400, transition:"all 0.2s" }}>{label}</button>
        ))}
      </div>

      {mode === "preset" ? (
        <div style={{ marginBottom: 12 }}>
          <select value={presetIdx} onChange={e => { setPresetIdx(+e.target.value); setActivePDA(PDA_PRESETS[+e.target.value]); handleReset(); }} style={{ width:"100%", padding:"8px 12px", background:"rgba(var(--b-rgb),0.4)", border:"1px solid rgba(129,140,248,0.25)", borderRadius:6, color:"var(--text-main)", fontSize:13, fontFamily:"'IBM Plex Mono', monospace", outline:"none" }}>
            {PDA_PRESETS.map((p,i) => <option key={i} value={i} style={{background:"var(--select-bg)"}}>{p.label} — {p.desc}</option>)}
          </select>
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <input
            ref={customRef}
            type="text"
            value={customText}
            onChange={e => { setCustomText(e.target.value); setCustomError(""); }}
            onKeyDown={e => { if(e.key==="Enter") loadCustom(); }}
            placeholder="e.g. aⁿbⁿ, balanced parentheses, palindrome"
            style={{ width:"100%", padding:"8px 12px", background:"rgba(var(--b-rgb),0.4)", border:`1px solid ${customError?"rgba(249,115,22,0.4)":"rgba(129,140,248,0.25)"}`, borderRadius:6, color:"var(--text-main)", fontSize:13, fontFamily:"'IBM Plex Mono', monospace", outline:"none", marginBottom:6 }}
          />
          <SymbolKeyboard targetRef={customRef} />
          <button onClick={loadCustom} style={{ ...simBtn(color), marginTop:8 }}>Load Language →</button>
          {customError && <div style={{ fontSize:11, color:"#f97316", marginTop:6, fontFamily:"'IBM Plex Mono', monospace" }}>⚠ {customError}</div>}
        </div>
      )}

      <div style={{ fontSize:11, color:"rgba(var(--w-rgb),0.35)", marginBottom:10, fontFamily:"'IBM Plex Mono', monospace" }}>
        Active: <span style={{color}}>{activePDA.label}</span> — {activePDA.desc}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <input
          value={input}
          onChange={e => { setInput(e.target.value); handleReset(); }}
          placeholder="e.g. aaabbb"
          style={{ background: "rgba(var(--w-rgb),0.04)", border: "1px solid rgba(129,140,248,0.25)", color: "var(--text-main)", padding: "7px 12px", borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, width: 180, outline: "none" }}
        />
        {stepIdx < 0 && <button onClick={handleStart} style={simBtn(color)}>Start</button>}
        {stepIdx >= 0 && !finished && <button onClick={handleStep} style={simBtn(color)}>Step →</button>}
        <button onClick={handleReset} style={simBtn(color, true)}>Reset</button>
      </div>

      {currentStep && (
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(var(--w-rgb),0.3)", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>INPUT TAPE</div>
            <div style={{ display: "flex", gap: 4 }}>
              {input.split("").map((ch, i) => {
                const isHead = i === currentStep.pos;
                const wasRead = i < currentStep.pos;
                return (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: 5, border: `2px solid ${isHead ? color : wasRead ? "rgba(129,140,248,0.2)" : "rgba(var(--w-rgb),0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 500, color: isHead ? color : wasRead ? "rgba(var(--w-rgb),0.25)" : "rgba(var(--w-rgb),0.65)", background: isHead ? "rgba(129,140,248,0.1)" : "transparent", transition: "all 0.2s" }}>{ch}</div>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: "rgba(var(--w-rgb),0.3)", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>STACK (top → bottom)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, minHeight: 60, minWidth: 48 }}>
              {currentStep.stack.map((item, i) => (
                <div key={i} style={{ width: 48, height: 26, borderRadius: 4, background: item === "$" ? "rgba(var(--w-rgb),0.07)" : "rgba(129,140,248,0.25)", border: `1px solid ${item === "$" ? "rgba(var(--w-rgb),0.12)" : "rgba(129,140,248,0.45)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: item === "$" ? "rgba(var(--w-rgb),0.3)" : color, transition: "all 0.2s" }}>{item}</div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "rgba(var(--w-rgb),0.2)", marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>$ = bottom marker</div>
          </div>
        </div>
      )}

      {currentStep && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(var(--b-rgb),0.2)", border: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "rgba(var(--w-rgb),0.5)", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5 }}>{currentStep.log}</div>
      )}

      {result && (
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: result === "accepted" ? "rgba(129,140,248,0.08)" : "rgba(249,115,22,0.08)", border: `1px solid ${result === "accepted" ? "rgba(129,140,248,0.35)" : "rgba(249,115,22,0.35)"}`, fontSize: 14, fontWeight: 600, color: result === "accepted" ? color : "#f97316", fontFamily: "'IBM Plex Mono', monospace" }}>
          {result === "accepted" ? `✓ ACCEPTED — string is in ${activePDA.label}` : `✗ REJECTED — string is not in ${activePDA.label}`}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PUMPING LEMMA (Type 2 — CFL)
   ═══════════════════════════════════════════════════ */
function PumpingLemmaCFL() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState(0);
  const [p, setP] = useState(4);
  const [langChoice, setLangChoice] = useState("anbncn");
  const [uvxyz, setUvxyz] = useState({ u:"", v:"", x:"", y:"", z:"" });
  const [decompError, setDecompError] = useState("");
  const [pumpN, setPumpN] = useState(2);
  const [verdict, setVerdict] = useState(null);

  const LANGS = {
    anbncn: { name:"aⁿbⁿcⁿ", classify:"Context-Sensitive (not CFL)", isInLang: s => { if(s==='')return true; const m=s.match(/^(a+)(b+)(c+)$/); return m&&m[1].length===m[2].length&&m[2].length===m[3].length; } },
    ww: { name:"ww (string doubled)", classify:"Context-Sensitive (not CFL)", isInLang: s => s.length%2===0&&s.slice(0,s.length/2)===s.slice(s.length/2) },
    anbn: { name:"aⁿbⁿ (this IS CFL)", classify:"Context-Free — pumping lemma holds!", isInLang: s => { if(s==='')return true; const m=s.match(/^(a+)(b+)$/); return m&&m[1].length===m[2].length; } },
  };
  const lang = LANGS[langChoice];

  const reset = () => { setPhase(0); setUvxyz({u:"",v:"",x:"",y:"",z:""}); setDecompError(""); setVerdict(null); setPumpN(2); };

  const suggestW = () => {
    const w = langChoice==="anbncn" ? "a".repeat(p)+"b".repeat(p)+"c".repeat(p) : langChoice==="ww" ? "ab".repeat(Math.ceil(p/2)).slice(0,p) + "ab".repeat(Math.ceil(p/2)).slice(0,p) : "a".repeat(p)+"b".repeat(p);
    setPhase(2);
    return w;
  };
  const [w, setW] = useState("");
  const doChooseW = () => { setW(suggestW()); setPhase(2); };

  const checkDecomp = () => {
    const {u,v,x,y,z} = uvxyz;
    const full = u+v+x+y+z;
    if (full !== w) { setDecompError(`u+v+x+y+z = "${full}" ≠ w = "${w}"`); return; }
    if (v.length===0 && y.length===0) { setDecompError("v and y cannot both be empty (|vy| ≥ 1)."); return; }
    if ((u+v+x).length > p) { setDecompError(`|uvx| = ${(u+v+x).length} > p = ${p}. Must have |uvx| ≤ p.`); return; }
    setDecompError(""); setPhase(3);
  };

  const doPump = () => {
    const {u,v,x,y,z} = uvxyz;
    const pumped = u + v.repeat(pumpN) + x + y.repeat(pumpN) + z;
    const inLang = lang.isInLang(pumped);
    if (langChoice==="anbn") {
      setVerdict({ pumped, msg:`"${pumped}" ${inLang?"IS":"is NOT"} in aⁿbⁿ. For CFL, the lemma holds.`, color:"#818cf8" });
    } else {
      setVerdict({
        pumped,
        msg: inLang
          ? `"${pumped}" is still in the language for i=${pumpN}. Try a different decomposition or i value.`
          : `✓ "${pumped}" is NOT in ${lang.name}! This disproves regularity/CFL — ${lang.name} is NOT context-free!`,
        color: inLang ? "#f97316" : "#818cf8"
      });
    }
    setPhase(4);
  };

  const color = "#818cf8";

  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={() => setOpen(o=>!o)} style={{ width:"100%", padding:"10px 14px", background: open?"rgba(129,140,248,0.08)":"rgba(var(--b-rgb),0.2)", border:`1px solid ${open?"rgba(129,140,248,0.3)":"rgba(129,140,248,0.1)"}`, borderRadius:8, color: open?color:"rgba(129,140,248,0.6)", fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Mono', monospace", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span>🔬 Pumping Lemma (CFL) — Interactive Proof</span>
        <span style={{fontSize:10}}>{open?"▲ hide":"▼ show"}</span>
      </button>
      {open && (
        <div style={{ marginTop:8, padding:18, background:"rgba(var(--b-rgb),0.25)", border:"1px solid rgba(129,140,248,0.15)", borderRadius:10, animation:"fadeIn 0.3s ease" }}>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10, color:"rgba(var(--w-rgb),0.3)", fontFamily:"'IBM Plex Mono', monospace", marginBottom:6}}>CHOOSE LANGUAGE</div>
            <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
              {Object.entries(LANGS).map(([k,v]) => (
                <button key={k} onClick={() => { setLangChoice(k); reset(); setW(""); }} style={{ padding:"6px 12px", background: langChoice===k?"rgba(129,140,248,0.15)":"rgba(var(--w-rgb),0.04)", border:`1px solid ${langChoice===k?"rgba(129,140,248,0.4)":"rgba(var(--w-rgb),0.08)"}`, borderRadius:6, color: langChoice===k?color:"rgba(var(--w-rgb),0.5)", fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Mono', monospace" }}>{v.name}</button>
              ))}
            </div>
            <div style={{fontSize:11, color:"rgba(var(--w-rgb),0.35)", marginTop:6}}>{lang.classify}</div>
          </div>

          <div style={{padding:"10px 14px", background:"rgba(var(--b-rgb),0.2)", borderRadius:8, marginBottom:14, fontSize:12, color:"rgba(var(--w-rgb),0.5)", lineHeight:1.7}}>
            <strong style={{color:"var(--text-main)"}}>CFL Pumping Lemma:</strong><br/>
            If L is context-free, ∃ pumping length <span style={{color}}>p</span> such that<br/>
            for every <span style={{color}}>w ∈ L</span> with |w| ≥ p, w = <span style={{color}}>uvxyz</span> where:<br/>
            &nbsp;• |vy| ≥ 1 &nbsp;&nbsp;• |uvx| ≤ p &nbsp;&nbsp;• for all i ≥ 0, <span style={{color}}>uvⁱxyⁱz ∈ L</span>
          </div>

          <div style={{marginBottom:10}}>
            <div style={{fontSize:10, color, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6}}>STEP 1 — Set pumping length p</div>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <span style={{fontSize:13, color:"rgba(var(--w-rgb),0.5)"}}>p =</span>
              <input type="number" value={p} min={1} max={15} onChange={e=>{ setP(+e.target.value); reset(); setW(""); }} style={{width:60, padding:"5px 8px", background:"rgba(var(--b-rgb),0.4)", border:"1px solid rgba(129,140,248,0.3)", borderRadius:5, color:"var(--text-main)", fontFamily:"'IBM Plex Mono', monospace", fontSize:14, outline:"none"}} />
              <button onClick={() => setPhase(1)} style={simBtn(color)}>Set p = {p}</button>
            </div>
          </div>

          {phase >= 1 && (
            <div style={{marginBottom:10, animation:"fadeIn 0.3s ease"}}>
              <div style={{fontSize:10, color, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6}}>STEP 2 — Choose w ∈ {lang.name} with |w| ≥ {p}</div>
              <button onClick={doChooseW} style={simBtn(color)}>Use suggested w</button>
              {w && <span style={{marginLeft:10, fontFamily:"'IBM Plex Mono', monospace", color, fontSize:13}}>w = "{w}" (|w|={w.length})</span>}
            </div>
          )}

          {phase >= 2 && (
            <div style={{marginBottom:10, animation:"fadeIn 0.3s ease"}}>
              <div style={{fontSize:10, color, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6}}>STEP 3 — Decompose w = uvxyz (|vy|≥1, |uvx|≤{p})</div>
              <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:6}}>
                {[["u","#f97316"],["v","#f472b6"],["x","#818cf8"],["y","#2dd4bf"],["z","#a78bfa"]].map(([label,col])=>(
                  <div key={label}>
                    <div style={{fontSize:10, color:col, fontFamily:"'IBM Plex Mono', monospace", marginBottom:3}}>{label}</div>
                    <input value={uvxyz[label]} onChange={e=>{ setUvxyz(prev=>({...prev,[label]:e.target.value})); setDecompError(""); }} style={{width:70, padding:"6px 8px", background:"rgba(var(--b-rgb),0.4)", border:`1px solid ${col}44`, borderRadius:5, color:col, fontFamily:"'IBM Plex Mono', monospace", fontSize:13, outline:"none"}} />
                  </div>
                ))}
              </div>
              {decompError && <div style={{fontSize:11, color:"#f97316", marginBottom:6, fontFamily:"'IBM Plex Mono', monospace"}}>⚠ {decompError}</div>}
              <button onClick={checkDecomp} style={simBtn(color)}>Validate</button>
            </div>
          )}

          {phase >= 3 && (
            <div style={{marginBottom:10, animation:"fadeIn 0.3s ease"}}>
              <div style={{fontSize:10, color, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6}}>STEP 4 — Pump with i and check uvⁱxyⁱz</div>
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
                <span style={{fontSize:13, color:"rgba(var(--w-rgb),0.5)"}}>i =</span>
                <input type="number" value={pumpN} min={0} max={8} onChange={e=>setPumpN(+e.target.value)} style={{width:55, padding:"5px 8px", background:"rgba(var(--b-rgb),0.4)", border:"1px solid rgba(129,140,248,0.3)", borderRadius:5, color:"var(--text-main)", fontFamily:"'IBM Plex Mono', monospace", fontSize:14, outline:"none"}} />
              </div>
              <button onClick={doPump} style={simBtn(color)}>Pump & Check</button>
            </div>
          )}

          {verdict && (
            <div style={{marginTop:10, padding:"12px 14px", borderRadius:8, background:`${verdict.color}10`, border:`1px solid ${verdict.color}40`, fontSize:13, color:verdict.color, fontFamily:"'IBM Plex Mono', monospace", animation:"fadeIn 0.3s ease", lineHeight:1.6}}>
              {verdict.msg}
            </div>
          )}

          <button onClick={() => { reset(); setW(""); }} style={{...simBtn(color,true), marginTop:12, fontSize:11}}>↺ Reset</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FEATURE 4: LBA SIMULATOR (Type 1)
   ═══════════════════════════════════════════════════ */

const LBA_PRESETS = [
  {
    label: "aⁿbⁿcⁿ",
    desc: "Equal counts of a's, b's, and c's",
    run: (input) => {
      const steps = [];
      if (input === '') return { steps:[{tape:['ε'], head:0, log:"Empty string — accepted (n=0)."}], accepted:true };
      if (!/^a+b+c+$/.test(input)) return { steps:[{tape:[...input], head:0, log:"Invalid format — need a+b+c+."}], accepted:false };
      let tape = [...input];
      steps.push({tape:[...tape], head:0, log:"Start — will mark one a, one b, one c per iteration."});
      let iter = 0;
      while (iter < 50) {
        // Find first unmarked 'a'
        const aIdx = tape.indexOf('a');
        if (aIdx === -1) {
          // Check no remaining b or c
          const anyLeft = tape.includes('b') || tape.includes('c');
          steps.push({tape:[...tape], head:0, log: anyLeft?"Unmatched b's or c's remain. REJECTED.":"All marked! ACCEPTED!"});
          return { steps, accepted: !anyLeft };
        }
        tape[aIdx] = 'A';
        steps.push({tape:[...tape], head:aIdx, log:`Marked a→A at pos ${aIdx}. Scanning for matching b...`});
        const bIdx = tape.indexOf('b');
        if (bIdx === -1) { steps.push({tape:[...tape], head:0, log:"No b found — counts unequal. REJECTED."}); return {steps, accepted:false}; }
        tape[bIdx] = 'B';
        steps.push({tape:[...tape], head:bIdx, log:`Marked b→B at pos ${bIdx}. Scanning for matching c...`});
        const cIdx = tape.indexOf('c');
        if (cIdx === -1) { steps.push({tape:[...tape], head:0, log:"No c found — counts unequal. REJECTED."}); return {steps, accepted:false}; }
        tape[cIdx] = 'C';
        steps.push({tape:[...tape], head:cIdx, log:`Marked c→C at pos ${cIdx}. Repeat...`});
        iter++;
      }
      return {steps, accepted:false};
    }
  },
  {
    label: "ww (string doubled)",
    desc: "A string w concatenated with itself",
    run: (input) => {
      const steps = [];
      if (input.length % 2 !== 0) {
        steps.push({tape:[...input], head:0, log:"Odd length — cannot be ww. REJECTED."});
        return {steps, accepted:false};
      }
      const half = input.length / 2;
      const w1 = input.slice(0, half);
      const w2 = input.slice(half);
      steps.push({tape:[...input], head:0, log:`Length ${input.length} — split into "${w1}" and "${w2}".`});
      let tape = [...input];
      for (let i = 0; i < half; i++) {
        steps.push({tape:[...tape], head:i, log:`Compare pos ${i} ('${tape[i]}') with pos ${i+half} ('${tape[i+half]}').`});
        if (tape[i] !== tape[i+half]) {
          steps.push({tape:[...tape], head:i, log:`Mismatch at pos ${i}! REJECTED.`});
          return {steps, accepted:false};
        }
        tape[i] = tape[i].toUpperCase();
        tape[i+half] = tape[i+half].toUpperCase()+'\'';
      }
      steps.push({tape:[...tape], head:0, log:"All characters matched — ww confirmed. ACCEPTED!"});
      return {steps, accepted:true};
    }
  }
];

function parseLBAFromText(text) {
  const s = text.toLowerCase().trim();
  if (/a.?n.?b.?n.?c.?n|anbncn/.test(s)) return LBA_PRESETS[0];
  if (/ww|doubled|repeated|copy/.test(s)) return LBA_PRESETS[1];
  return null;
}

function LBAVisualizer() {
  const [mode, setMode] = useState("preset");
  const [presetIdx, setPresetIdx] = useState(0);
  const [activeLBA, setActiveLBA] = useState(LBA_PRESETS[0]);
  const [customText, setCustomText] = useState("");
  const [customError, setCustomError] = useState("");
  const [input, setInput] = useState("aabbcc");
  const [stepIdx, setStepIdx] = useState(-1);
  const [result, setResult] = useState(null);
  const [simData, setSimData] = useState(null);
  const customRef = useRef(null);
  const color = "#f472b6";

  const loadCustom = () => {
    const parsed = parseLBAFromText(customText);
    if (parsed) { setActiveLBA(parsed); setCustomError(""); handleReset(); }
    else setCustomError("Language not recognized. Try: aⁿbⁿcⁿ, ww (string doubled)");
  };

  const handleReset = () => { setStepIdx(-1); setResult(null); setSimData(null); };

  const handleStart = () => {
    const data = activeLBA.run(input);
    setSimData(data);
    setStepIdx(0);
  };

  const handleStep = () => {
    if (!simData) return;
    const next = stepIdx + 1;
    if (next >= simData.steps.length) return;
    setStepIdx(next);
    if (next === simData.steps.length - 1) setResult(simData.accepted ? "accepted" : "rejected");
  };

  const currentStep = simData && stepIdx >= 0 ? simData.steps[stepIdx] : null;
  const finished = simData && stepIdx === simData.steps.length - 1;

  return (
    <div style={{ marginTop: 20, padding: 18, background: "rgba(var(--b-rgb),0.25)", border: "1px solid rgba(244,114,182,0.2)", borderRadius: 10 }}>
      <div style={{ fontSize: 11, color, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", marginBottom: 14 }}>
        LBA SIMULATOR — Type 1 (Context-Sensitive)
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 12, background: "rgba(var(--b-rgb),0.3)", borderRadius: 8, padding: 3 }}>
        {[["preset","Choose Preset"],["custom","Type a Language"]].map(([id,label]) => (
          <button key={id} onClick={() => { setMode(id); handleReset(); }} style={{ flex:1, padding:"7px 10px", border:"none", borderRadius:6, background: mode===id?`rgba(244,114,182,0.15)`:"transparent", color: mode===id?color:"rgba(var(--w-rgb),0.4)", fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Mono', monospace", fontWeight: mode===id?600:400, transition:"all 0.2s" }}>{label}</button>
        ))}
      </div>

      {mode === "preset" ? (
        <div style={{ marginBottom: 12 }}>
          <select value={presetIdx} onChange={e => { setPresetIdx(+e.target.value); setActiveLBA(LBA_PRESETS[+e.target.value]); handleReset(); }} style={{ width:"100%", padding:"8px 12px", background:"rgba(var(--b-rgb),0.4)", border:"1px solid rgba(244,114,182,0.25)", borderRadius:6, color:"var(--text-main)", fontSize:13, fontFamily:"'IBM Plex Mono', monospace", outline:"none" }}>
            {LBA_PRESETS.map((p,i) => <option key={i} value={i} style={{background:"var(--select-bg)"}}>{p.label} — {p.desc}</option>)}
          </select>
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <input
            ref={customRef}
            type="text"
            value={customText}
            onChange={e => { setCustomText(e.target.value); setCustomError(""); }}
            onKeyDown={e => { if(e.key==="Enter") loadCustom(); }}
            placeholder="e.g. aⁿbⁿcⁿ, ww (string doubled)"
            style={{ width:"100%", padding:"8px 12px", background:"rgba(var(--b-rgb),0.4)", border:`1px solid ${customError?"rgba(249,115,22,0.4)":"rgba(244,114,182,0.25)"}`, borderRadius:6, color:"var(--text-main)", fontSize:13, fontFamily:"'IBM Plex Mono', monospace", outline:"none", marginBottom:6 }}
          />
          <SymbolKeyboard targetRef={customRef} />
          <button onClick={loadCustom} style={{ ...simBtn(color), marginTop:8 }}>Load Language →</button>
          {customError && <div style={{ fontSize:11, color:"#f97316", marginTop:6, fontFamily:"'IBM Plex Mono', monospace" }}>⚠ {customError}</div>}
        </div>
      )}

      <div style={{ fontSize:11, color:"rgba(var(--w-rgb),0.35)", marginBottom:10, fontFamily:"'IBM Plex Mono', monospace" }}>
        Active: <span style={{color}}>{activeLBA.label}</span> — {activeLBA.desc}
      </div>

      <div style={{ marginBottom:10, padding:"8px 12px", background:"rgba(244,114,182,0.05)", border:"1px solid rgba(244,114,182,0.1)", borderRadius:8, fontSize:11, color:"rgba(var(--w-rgb),0.4)", fontFamily:"'IBM Plex Mono', monospace" }}>
        💡 LBA key property: tape is bounded to input length. No extra space allocated — unlike a full Turing Machine.
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <input
          value={input}
          onChange={e => { setInput(e.target.value); handleReset(); }}
          placeholder="e.g. aabbcc"
          style={{ background: "rgba(var(--w-rgb),0.04)", border: "1px solid rgba(244,114,182,0.25)", color: "var(--text-main)", padding: "7px 12px", borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, width: 180, outline: "none" }}
        />
        {stepIdx < 0 && <button onClick={handleStart} style={simBtn(color)}>Start</button>}
        {stepIdx >= 0 && !finished && <button onClick={handleStep} style={simBtn(color)}>Step →</button>}
        <button onClick={handleReset} style={simBtn(color, true)}>Reset</button>
      </div>

      {currentStep && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "rgba(var(--w-rgb),0.3)", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>BOUNDED TAPE (in-place rewrite)</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {currentStep.tape.map((cell, i) => {
              const isHead = i === currentStep.head;
              const isModified = cell !== cell.toLowerCase() || cell === "ε" || cell.includes("'");
              return (
                <div key={i} style={{ minWidth: 32, height: 34, borderRadius: 5, padding:"0 4px", border: `2px solid ${isHead ? color : isModified ? "rgba(244,114,182,0.4)" : "rgba(var(--w-rgb),0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: isHead ? color : isModified ? "rgba(244,114,182,0.7)" : "rgba(var(--w-rgb),0.65)", background: isHead ? "rgba(244,114,182,0.1)" : isModified ? "rgba(244,114,182,0.05)" : "transparent", transition: "all 0.2s" }}>{cell}</div>
              );
            })}
          </div>
          <div style={{fontSize:10, color:"rgba(var(--w-rgb),0.2)", marginTop:4, fontFamily:"'IBM Plex Mono', monospace"}}>Uppercase = marked/processed cells</div>
        </div>
      )}

      {currentStep && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(var(--b-rgb),0.2)", border: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "rgba(var(--w-rgb),0.5)", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5 }}>{currentStep.log}</div>
      )}

      {result && (
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: result === "accepted" ? "rgba(244,114,182,0.08)" : "rgba(249,115,22,0.08)", border: `1px solid ${result === "accepted" ? "rgba(244,114,182,0.35)" : "rgba(249,115,22,0.35)"}`, fontSize: 14, fontWeight: 600, color: result === "accepted" ? color : "#f97316", fontFamily: "'IBM Plex Mono', monospace" }}>
          {result === "accepted" ? `✓ ACCEPTED — string is in ${activeLBA.label}` : `✗ REJECTED — string is not in ${activeLBA.label}`}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FEATURE 4: TURING MACHINE SIMULATOR (Type 0)
   ═══════════════════════════════════════════════════ */

const TM_PRESETS = [
  {
    label: "aⁿbⁿ (TM version)",
    desc: "Turing Machine recognizing equal a's and b's",
    initTape: (input) => [...input, '_'],
    run: (input) => {
      if (!input) return { steps:[{tape:['_'], head:0, state:'q_accept', log:"Empty input — accepted."}], accepted:true };
      if (!/^a+b+$/.test(input)) return { steps:[{tape:[...input,'_'], head:0, state:'q_reject', log:"Invalid: need a+b+. REJECTED."}], accepted:false };
      const steps = [];
      let tape = [...input, '_'];
      let head = 0;
      let state = 'q0';
      steps.push({tape:[...tape], head, state, log:"Start — will cross off matching a/b pairs."});
      let iterations = 0;
      while (state !== 'q_accept' && state !== 'q_reject' && iterations < 200) {
        iterations++;
        const sym = tape[head] || '_';
        if (state === 'q0') {
          if (sym === 'a') { tape[head]='X'; state='q1'; head++; steps.push({tape:[...tape],head,state,log:`Marked a→X, scanning right for 'b'...`}); }
          else if (sym === 'X') { head++; steps.push({tape:[...tape],head,state,log:"Skip marked X."}); }
          else if (sym === 'Y') { state='q3'; head++; steps.push({tape:[...tape],head,state,log:"Found only Y's — check b's done."}); }
          else if (sym === '_') { state='q_accept'; steps.push({tape:[...tape],head,state,log:"Blank reached from start — ACCEPTED!"}); }
          else { state='q_reject'; steps.push({tape:[...tape],head,state,log:`Unexpected '${sym}' — REJECTED.`}); }
        } else if (state === 'q1') {
          if (sym === 'a' || sym === 'X') { head++; steps.push({tape:[...tape],head,state,log:"Skip — moving right to find b."}); }
          else if (sym === 'Y') { head++; steps.push({tape:[...tape],head,state,log:"Skip Y."}); }
          else if (sym === 'b') { tape[head]='Y'; state='q2'; head--; steps.push({tape:[...tape],head,state,log:`Marked b→Y, scanning left to restart.`}); }
          else { state='q_reject'; steps.push({tape:[...tape],head,state,log:`No b found — counts unequal. REJECTED.`}); }
        } else if (state === 'q2') {
          if (sym === 'a' || sym === 'X' || sym === 'Y') { head--; steps.push({tape:[...tape],head,state,log:"Moving left..."}); }
          else { head++; state='q0'; steps.push({tape:[...tape],head,state,log:"Back at left — restart marking."}); }
        } else if (state === 'q3') {
          if (sym === 'Y') { head++; steps.push({tape:[...tape],head,state,log:"Skip Y."}); }
          else if (sym === '_') { state='q_accept'; steps.push({tape:[...tape],head,state,log:"All b's accounted for. ACCEPTED!"}); }
          else { state='q_reject'; steps.push({tape:[...tape],head,state,log:`Unexpected '${sym}'. REJECTED.`}); }
        }
      }
      if (state !== 'q_accept' && state !== 'q_reject') { steps.push({tape:[...tape],head,state,log:"Timeout — too many steps."}); return {steps, accepted:false}; }
      return { steps, accepted: state === 'q_accept' };
    }
  },
  {
    label: "Palindrome (TM)",
    desc: "Turing Machine checking if string is a palindrome over {a,b}",
    initTape: (input) => [...input, '_'],
    run: (input) => {
      if (!input) return { steps:[{tape:['_'], head:0, state:'q_accept', log:"Empty — palindrome trivially. ACCEPTED."}], accepted:true };
      if (!/^[ab]*$/.test(input)) return { steps:[{tape:[...input,'_'], head:0, state:'q_reject', log:"Invalid chars."}], accepted:false };
      const steps = [];
      let tape = [...input, '_'];
      steps.push({tape:[...tape], head:0, state:'q0', log:"Check left-most against right-most, repeatedly."});
      let lo = 0, hi = input.length - 1;
      let accepted = true;
      while (lo <= hi) {
        steps.push({tape:[...tape], head:lo, state:'q_compare', log:`Compare pos ${lo} ('${tape[lo]}') with pos ${hi} ('${tape[hi]}').`});
        if (tape[lo] !== tape[hi]) { accepted = false; steps.push({tape:[...tape], head:lo, state:'q_reject', log:`Mismatch — not a palindrome. REJECTED.`}); break; }
        tape[lo] = tape[lo].toUpperCase();
        tape[hi] = tape[hi].toUpperCase()+"'";
        steps.push({tape:[...tape], head:lo, state:'q0', log:`Match! Marked both ends. Move inward.`});
        lo++; hi--;
      }
      if (accepted) steps.push({tape:[...tape], head:lo, state:'q_accept', log:"All matched — palindrome confirmed. ACCEPTED!"});
      return { steps, accepted };
    }
  }
];

function parseTMFromText(text) {
  const s = text.toLowerCase().trim();
  if (/a.?n.?b.?n|anbn|equal.*a.*b/.test(s)) return TM_PRESETS[0];
  if (/palindrome|reverse/.test(s)) return TM_PRESETS[1];
  return null;
}

function TMVisualizer() {
  const [mode, setMode] = useState("preset");
  const [presetIdx, setPresetIdx] = useState(0);
  const [activeTM, setActiveTM] = useState(TM_PRESETS[0]);
  const [customText, setCustomText] = useState("");
  const [customError, setCustomError] = useState("");
  const [input, setInput] = useState("aaabbb");
  const [stepIdx, setStepIdx] = useState(-1);
  const [result, setResult] = useState(null);
  const [simData, setSimData] = useState(null);
  const customRef = useRef(null);
  const color = "#f97316";

  const loadCustom = () => {
    const parsed = parseTMFromText(customText);
    if (parsed) { setActiveTM(parsed); setCustomError(""); handleReset(); }
    else setCustomError("Language not recognized. Try: aⁿbⁿ, palindrome");
  };

  const handleReset = () => { setStepIdx(-1); setResult(null); setSimData(null); };

  const handleStart = () => {
    const data = activeTM.run(input);
    setSimData(data);
    setStepIdx(0);
  };

  const handleStep = () => {
    if (!simData) return;
    const next = stepIdx + 1;
    if (next >= simData.steps.length) return;
    setStepIdx(next);
    if (next === simData.steps.length - 1) setResult(simData.accepted ? "accepted" : "rejected");
  };

  const currentStep = simData && stepIdx >= 0 ? simData.steps[stepIdx] : null;
  const finished = simData && stepIdx === simData.steps.length - 1;

  const STATE_COLORS = { q_accept:"#2dd4bf", q_reject:"#f97316", q0:"#f97316", q1:"#f97316", q2:"#f97316", q3:"#f97316", q_compare:"#f97316" };

  return (
    <div style={{ marginTop: 20, padding: 18, background: "rgba(var(--b-rgb),0.25)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 10 }}>
      <div style={{ fontSize: 11, color, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", marginBottom: 14 }}>
        TURING MACHINE SIMULATOR — Type 0 (Recursively Enumerable)
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 12, background: "rgba(var(--b-rgb),0.3)", borderRadius: 8, padding: 3 }}>
        {[["preset","Choose Preset"],["custom","Type a Language"]].map(([id,label]) => (
          <button key={id} onClick={() => { setMode(id); handleReset(); }} style={{ flex:1, padding:"7px 10px", border:"none", borderRadius:6, background: mode===id?`rgba(249,115,22,0.15)`:"transparent", color: mode===id?color:"rgba(var(--w-rgb),0.4)", fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Mono', monospace", fontWeight: mode===id?600:400, transition:"all 0.2s" }}>{label}</button>
        ))}
      </div>

      {mode === "preset" ? (
        <div style={{ marginBottom: 12 }}>
          <select value={presetIdx} onChange={e => { setPresetIdx(+e.target.value); setActiveTM(TM_PRESETS[+e.target.value]); handleReset(); }} style={{ width:"100%", padding:"8px 12px", background:"rgba(var(--b-rgb),0.4)", border:"1px solid rgba(249,115,22,0.25)", borderRadius:6, color:"var(--text-main)", fontSize:13, fontFamily:"'IBM Plex Mono', monospace", outline:"none" }}>
            {TM_PRESETS.map((p,i) => <option key={i} value={i} style={{background:"var(--select-bg)"}}>{p.label} — {p.desc}</option>)}
          </select>
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <input
            ref={customRef}
            type="text"
            value={customText}
            onChange={e => { setCustomText(e.target.value); setCustomError(""); }}
            onKeyDown={e => { if(e.key==="Enter") loadCustom(); }}
            placeholder="e.g. aⁿbⁿ, palindrome"
            style={{ width:"100%", padding:"8px 12px", background:"rgba(var(--b-rgb),0.4)", border:`1px solid ${customError?"rgba(249,115,22,0.4)":"rgba(249,115,22,0.25)"}`, borderRadius:6, color:"var(--text-main)", fontSize:13, fontFamily:"'IBM Plex Mono', monospace", outline:"none", marginBottom:6 }}
          />
          <SymbolKeyboard targetRef={customRef} />
          <button onClick={loadCustom} style={{ ...simBtn(color), marginTop:8 }}>Load Language →</button>
          {customError && <div style={{ fontSize:11, color:"#f97316", marginTop:6, fontFamily:"'IBM Plex Mono', monospace" }}>⚠ {customError}</div>}
        </div>
      )}

      <div style={{ fontSize:11, color:"rgba(var(--w-rgb),0.35)", marginBottom:10, fontFamily:"'IBM Plex Mono', monospace" }}>
        Active: <span style={{color}}>{activeTM.label}</span> — {activeTM.desc}
      </div>

      <div style={{ marginBottom:10, padding:"8px 12px", background:"rgba(249,115,22,0.05)", border:"1px solid rgba(249,115,22,0.1)", borderRadius:8, fontSize:11, color:"rgba(var(--w-rgb),0.4)", fontFamily:"'IBM Plex Mono', monospace" }}>
        💡 TM key property: infinite tape — the head can move freely left and right, read and write any symbol.
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <input
          value={input}
          onChange={e => { setInput(e.target.value); handleReset(); }}
          placeholder="e.g. aaabbb"
          style={{ background: "rgba(var(--w-rgb),0.04)", border: "1px solid rgba(249,115,22,0.25)", color: "var(--text-main)", padding: "7px 12px", borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, width: 180, outline: "none" }}
        />
        {stepIdx < 0 && <button onClick={handleStart} style={simBtn(color)}>Start</button>}
        {stepIdx >= 0 && !finished && <button onClick={handleStep} style={simBtn(color)}>Step →</button>}
        <button onClick={handleReset} style={simBtn(color, true)}>Reset</button>
      </div>

      {currentStep && (
        <>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "rgba(var(--w-rgb),0.3)", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>TAPE (infinite, shown in view)</div>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap", overflowX:"auto" }}>
              {[...currentStep.tape].map((cell, i) => {
                const isHead = i === currentStep.head;
                const isModified = /[A-Z'XY]/.test(cell) || cell !== (currentStep.tape[i]);
                return (
                  <div key={i} style={{ minWidth: 30, height: 34, borderRadius: 5, padding:"0 3px", border: `2px solid ${isHead ? color : isModified ? "rgba(249,115,22,0.35)" : "rgba(var(--w-rgb),0.1)"}`, display: "flex", flexDirection:"column", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: isHead ? color : isModified ? "rgba(249,115,22,0.7)" : "rgba(var(--w-rgb),0.6)", background: isHead ? "rgba(249,115,22,0.1)" : "transparent", transition: "all 0.2s", position:"relative" }}>
                    {cell}
                    {isHead && <div style={{position:"absolute", bottom:-8, fontSize:8, color}}>▲</div>}
                    <div style={{fontSize:7, color:"rgba(var(--w-rgb),0.15)", marginTop:1}}>{i}</div>
                  </div>
                );
              })}
              <div style={{ minWidth: 30, height: 34, borderRadius: 5, border: "2px dashed rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(var(--w-rgb),0.15)" }}>…</div>
            </div>
          </div>

          <div style={{ marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
            <div style={{fontSize:10, color:"rgba(var(--w-rgb),0.3)", fontFamily:"'IBM Plex Mono', monospace"}}>STATE:</div>
            <div style={{padding:"4px 10px", borderRadius:5, background:`${STATE_COLORS[currentStep.state]||color}18`, border:`1px solid ${STATE_COLORS[currentStep.state]||color}40`, fontSize:12, color:STATE_COLORS[currentStep.state]||color, fontFamily:"'IBM Plex Mono', monospace"}}>
              {currentStep.state}
            </div>
          </div>

          <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(var(--b-rgb),0.2)", border: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "rgba(var(--w-rgb),0.5)", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5 }}>{currentStep.log}</div>
        </>
      )}

      {result && (
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: result === "accepted" ? "rgba(249,115,22,0.08)" : "rgba(249,115,22,0.04)", border: `1px solid ${result === "accepted" ? "rgba(249,115,22,0.35)" : "rgba(249,115,22,0.2)"}`, fontSize: 14, fontWeight: 600, color: result === "accepted" ? color : "#f97316", fontFamily: "'IBM Plex Mono', monospace" }}>
          {result === "accepted" ? `✓ ACCEPTED — string is in ${activeTM.label}` : `✗ REJECTED — string is not in ${activeTM.label}`}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   REAL WORLD SECTION
   ═══════════════════════════════════════════════════ */
function RealWorldSection({ level }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={() => setOpen(o=>!o)} style={{ width:"100%", padding:"10px 14px", background: open?`${level.bg}`:"rgba(var(--b-rgb),0.2)", border:`1px solid ${open?level.border:"rgba(var(--w-rgb),0.06)"}`, borderRadius:8, color: open?level.color:"rgba(var(--w-rgb),0.4)", fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Mono', monospace", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.2s" }}>
        <span>🌐 Real-World Applications</span>
        <span style={{fontSize:10}}>{open?"▲ hide":"▼ show"}</span>
      </button>
      {open && (
        <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:8, animation:"fadeIn 0.3s ease" }}>
          {level.realWorld.map((item, i) => (
            <div key={i} style={{ padding:"12px 14px", background:"rgba(var(--b-rgb),0.2)", border:`1px solid rgba(255,255,255,0.05)`, borderLeft:`3px solid ${level.color}`, borderRadius:8 }}>
              <div style={{fontSize:13, fontWeight:600, color:level.color, marginBottom:4}}>{item.title}</div>
              <div style={{fontSize:12, color:"rgba(var(--w-rgb),0.5)", lineHeight:1.6}}>{item.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ANIMATED VENN DIAGRAM (SVG) — unchanged
   ═══════════════════════════════════════════════════ */
function VennDiagram({ activeLevel, onSelect, pulse }) {
  const rings = [
    { type: 0, cx: 300, cy: 210, rx: 270, ry: 190, color: "#f97316" },
    { type: 1, cx: 300, cy: 220, rx: 210, ry: 148, color: "#f472b6" },
    { type: 2, cx: 300, cy: 228, rx: 150, ry: 108, color: "#818cf8" },
    { type: 3, cx: 300, cy: 234, rx: 90, ry: 68, color: "#2dd4bf" },
  ];

  return (
    <svg viewBox="0 0 600 430" style={{ width: "100%", maxWidth: 560, display: "block", margin: "0 auto" }}>
      <defs>
        {rings.map(r => (
          <radialGradient key={`g${r.type}`} id={`grad${r.type}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={r.color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={r.color} stopOpacity="0.03" />
          </radialGradient>
        ))}
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {rings.map(r => {
          const sx = r.cx - r.rx, sy = r.cy;
          const ex = r.cx + r.rx, ey = r.cy;
          return (
            <path key={`path${r.type}`} id={`arc${r.type}`}
              d={`M ${sx},${sy} A ${r.rx},${r.ry} 0 0,1 ${ex},${ey}`}
              fill="none" stroke="none" />
          );
        })}
      </defs>

      {rings.map((r, i) => {
        const isActive = activeLevel === r.type;
        const labelText = `${LEVELS[i].short}: ${LEVELS[i].grammar.split('(')[0].trim()}`;
        return (
          <g key={r.type} onClick={() => onSelect(r.type)} style={{ cursor: "pointer" }}>
            {isActive && (
              <ellipse cx={r.cx} cy={r.cy} rx={r.rx + 4} ry={r.ry + 4}
                fill="none" stroke={r.color} strokeWidth="3" opacity="0.3" filter="url(#glow)">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
              </ellipse>
            )}
            <ellipse cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry}
              fill={`url(#grad${r.type})`}
              stroke={r.color}
              strokeWidth={isActive ? 2.5 : 1.2}
              strokeOpacity={isActive ? 1 : 0.5}
              style={{ transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)" }}
            />
            {pulse === r.type && (
              <ellipse cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry}
                fill="none" stroke={r.color} strokeWidth="3">
                <animate attributeName="rx" from={r.rx} to={r.rx + 30} dur="0.8s" fill="freeze" />
                <animate attributeName="ry" from={r.ry} to={r.ry + 22} dur="0.8s" fill="freeze" />
                <animate attributeName="opacity" from="0.8" to="0" dur="0.8s" fill="freeze" />
              </ellipse>
            )}
            <text fill={r.color}
              fontSize={i === 0 ? 12 : 11} fontWeight="600"
              fontFamily="'IBM Plex Mono', monospace"
              opacity={isActive ? 1 : 0.7}
              style={{ transition: "opacity 0.3s" }}>
              <textPath href={`#arc${r.type}`} startOffset="50%" textAnchor="middle">
                {labelText}
              </textPath>
            </text>
          </g>
        );
      })}

      <text x="300" y="245" textAnchor="middle" fill="rgba(var(--w-rgb),0.25)" fontSize="9"
        fontFamily="'IBM Plex Mono', monospace">
        Regular ⊂ Context-Free ⊂ Context-Sensitive ⊂ RE
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   LANGUAGE CLASSIFIER — unchanged
   ═══════════════════════════════════════════════════ */
function Classifier({ onClassify }) {
  const [selectedLang, setSelectedLang] = useState(0);
  const [testString, setTestString] = useState("");
  const [result, setResult] = useState(null);
  const [customLang, setCustomLang] = useState("");
  const [mode, setMode] = useState("preset");
  const inputRef = useRef(null);
  const customRef = useRef(null);
  const lang = LANGUAGES[selectedLang];

  const classify = () => {
    if (mode === "preset") {
      const accepted = lang.test(testString);
      const level = LEVELS.find(l => l.type === lang.type);
      setResult({ accepted, level, langName: lang.name, testString });
      onClassify(lang.type);
    } else {
      const classified = classifyCustom(customLang);
      const level = LEVELS.find(l => l.type === classified.type);
      setResult({ accepted: null, level, langName: customLang, testString: null, reason: classified.reason });
      onClassify(classified.type);
    }
  };

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 24, backdropFilter: "blur(20px)" }}>
      <h3 style={{ margin: "0 0 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: "var(--text-main)" }}>Language Classifier</h3>
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "rgba(var(--b-rgb),0.3)", borderRadius: 8, padding: 3 }}>
        {[["preset", "Test Preset Language"], ["custom", "Classify a Language"]].map(([id, label]) => (
          <button key={id} onClick={() => { setMode(id); setResult(null); }} style={{ flex: 1, padding: "8px 12px", border: "none", borderRadius: 6, background: mode === id ? "rgba(129,140,248,0.15)" : "transparent", color: mode === id ? "#818cf8" : "rgba(var(--w-rgb),0.4)", fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontWeight: mode === id ? 600 : 400, transition: "all 0.2s" }}>{label}</button>
        ))}
      </div>
      {mode === "preset" ? (
        <>
          <label style={{ display: "block", fontSize: 11, color: "rgba(var(--w-rgb),0.4)", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Select Language</label>
          <select value={selectedLang} onChange={e => { setSelectedLang(+e.target.value); setResult(null); }} style={{ width: "100%", padding: "10px 12px", background: "rgba(var(--b-rgb),0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "var(--text-main)", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4, outline: "none", cursor: "pointer" }}>
            {LANGUAGES.map((l, i) => (<option key={i} value={i} style={{ background: "var(--select-bg)" }}>{l.name} — {LEVELS.find(lv => lv.type === l.type)?.short}</option>))}
          </select>
          <div style={{ fontSize: 12, color: "rgba(var(--w-rgb),0.35)", marginBottom: 14 }}>{lang.desc}</div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(var(--w-rgb),0.4)", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Test String</label>
          <input ref={inputRef} type="text" value={testString} onChange={e => { setTestString(e.target.value); setResult(null); }} onKeyDown={e => { if (e.key === 'Enter') classify(); }} placeholder="Type a string to test..." style={{ width: "100%", padding: "10px 12px", background: "rgba(var(--b-rgb),0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "var(--text-main)", fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", outline: "none" }} />
          <SymbolKeyboard targetRef={inputRef} />
        </>
      ) : (
        <>
          <label style={{ display: "block", fontSize: 11, color: "rgba(var(--w-rgb),0.4)", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Describe a Language (e.g. "aⁿbⁿ", "a*b*", "aⁿbⁿcⁿ", "balanced parens")</label>
          <input ref={customRef} type="text" value={customLang} onChange={e => { setCustomLang(e.target.value); setResult(null); }} onKeyDown={e => { if (e.key === 'Enter') classify(); }} placeholder='e.g. aⁿbⁿ, (ab)*, balanced parentheses...' style={{ width: "100%", padding: "10px 12px", background: "rgba(var(--b-rgb),0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "var(--text-main)", fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", outline: "none" }} />
          <SymbolKeyboard targetRef={customRef} />
        </>
      )}
      <button onClick={classify} style={{ marginTop: 14, width: "100%", padding: "11px", background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 8, color: "#818cf8", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s" }}
        onMouseEnter={e => { e.target.style.background = "rgba(129,140,248,0.25)"; }}
        onMouseLeave={e => { e.target.style.background = "rgba(129,140,248,0.15)"; }}>
        {mode === "preset" ? "Test String" : "Classify Language"}
      </button>
      {result && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 8, background: result.accepted === true ? "rgba(45,212,191,0.08)" : result.accepted === false ? "rgba(249,115,22,0.08)" : result.level.bg, border: `1px solid ${result.accepted === true ? "rgba(45,212,191,0.3)" : result.accepted === false ? "rgba(249,115,22,0.3)" : result.level.border}`, animation: "fadeIn 0.3s ease" }}>
          {result.accepted !== null ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: result.accepted ? "#2dd4bf" : "#f97316", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>{result.accepted ? "✓ ACCEPTED" : "✗ REJECTED"}</div>
              <div style={{ fontSize: 12, color: "rgba(var(--w-rgb),0.5)", lineHeight: 1.5 }}>
                The string <code style={{ color: "var(--text-main)", background: "rgba(var(--w-rgb),0.06)", padding: "1px 5px", borderRadius: 3 }}>"{result.testString}"</code> is {result.accepted ? "in" : "not in"} the language <span style={{ color: result.level.color }}>{result.langName}</span>.
                <br />This language belongs to <span style={{ color: result.level.color, fontWeight: 600 }}>{result.level.short} ({result.level.name})</span>.
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: result.level.color, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>Classified: {result.level.short} — {result.level.name}</div>
              <div style={{ fontSize: 12, color: "rgba(var(--w-rgb),0.5)", lineHeight: 1.5 }}><span style={{ color: "var(--text-main)" }}>"{result.langName}"</span> {result.reason}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function classifyCustom(input) {
  const s = input.toLowerCase().replace(/\s+/g, ' ').trim();
  if (/a.?n.?b.?n.?c.?n/.test(s) || /ww[^r]/.test(s) || s.includes("copy") || s.includes("duplicate") || s.includes("triple") || /a.?n.?²/.test(s) || s.includes("square"))
    return { type: 1, reason: "appears to require matching three or more dependent counts — beyond the power of a pushdown automaton." };
  if (/a.?n.?b.?n/.test(s) || s.includes("palindrome") || s.includes("balanced") || s.includes("nested") || s.includes("paren") || s.includes("bracket") || /ww.?r/.test(s) || s.includes("reverse") || s.includes("cfg") || s.includes("pushdown"))
    return { type: 2, reason: "involves matching pairs or nested structures that require stack memory — characteristic of context-free languages." };
  if (/^[abc\*\+\|\(\)\[\]\.\?\\\/\^]+$/.test(s) || s.includes("regex") || s.includes("regular") || s.includes("ends with") || s.includes("starts with") || s.includes("contains") || /^[a-c][\*\+]?[a-c]?[\*\+]?$/.test(s))
    return { type: 3, reason: "can be described by a regular expression and requires only finite memory — a regular language." };
  if (s.includes("halt") || s.includes("turing") || s.includes("undecidable") || s.includes("recursive") || s.includes("enumerable"))
    return { type: 0, reason: "references computability concepts that place it in the recursively enumerable class." };
  if (s.includes("ⁿ") || s.includes("^n"))
    return { type: 2, reason: "uses exponent notation suggesting matched counting — likely context-free." };
  return { type: 2, reason: "could not be definitively classified — defaulting to context-free. Try a more specific description." };
}

/* ═══════════════════════════════════════════════════
   QUIZ — unchanged
   ═══════════════════════════════════════════════════ */
const QUIZ_QUESTIONS = [
  { q: "Which class can recognize balanced parentheses?", opts: ["Regular", "Context-Free", "Context-Sensitive", "RE only"], ans: 1, why: "Balanced parentheses need a stack to match nesting — that's a pushdown automaton, which recognizes context-free languages." },
  { q: "What automaton recognizes regular languages?", opts: ["Turing Machine", "PDA", "Finite Automaton", "LBA"], ans: 2, why: "Regular languages (Type 3) are recognized by finite automata (DFA/NFA)." },
  { q: "aⁿbⁿcⁿ belongs to which class?", opts: ["Regular", "Context-Free", "Context-Sensitive", "RE"], ans: 2, why: "Matching three independent counts requires context-sensitive rules. A PDA's single stack can't track three groups." },
  { q: "Every regular language is also context-free?", opts: ["True", "False"], ans: 0, why: "True — the hierarchy is a strict containment: Regular ⊂ CFL ⊂ CSL ⊂ RE." },
  { q: "Which model has unlimited tape?", opts: ["DFA", "PDA", "LBA", "Turing Machine"], ans: 3, why: "A Turing Machine has an infinite tape, making it the most powerful model." },
  { q: 'The language "ww" (string doubled) is:', opts: ["Regular", "Context-Free", "Context-Sensitive", "Undecidable"], ans: 2, why: "Recognizing ww requires comparing two halves of the input — needs more than a stack but fits within linear bounded memory." },
];

function Quiz() {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = QUIZ_QUESTIONS[qi];

  const pick = (i) => { if (selected !== null) return; setSelected(i); if (i === q.ans) setScore(s => s + 1); };
  const next = () => { if (qi < QUIZ_QUESTIONS.length - 1) { setQi(qi + 1); setSelected(null); } else setDone(true); };
  const restart = () => { setQi(0); setSelected(null); setScore(0); setDone(false); };

  if (done) return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{score >= 5 ? "🏆" : score >= 3 ? "👍" : "📚"}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-main)", fontFamily: "'IBM Plex Mono', monospace" }}>{score} / {QUIZ_QUESTIONS.length}</div>
      <div style={{ color: "rgba(var(--w-rgb),0.5)", fontSize: 13, margin: "8px 0 20px" }}>{score >= 5 ? "Excellent — you know your hierarchy!" : score >= 3 ? "Good effort — review the tricky ones!" : "Keep studying — you'll get there!"}</div>
      <button onClick={restart} style={{ padding: "10px 28px", background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 8, color: "#818cf8", fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>Try Again</button>
    </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 11, color: "rgba(var(--w-rgb),0.3)", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>Question {qi + 1} of {QUIZ_QUESTIONS.length} · Score: {score}</div>
      <div style={{ fontSize: 15, color: "var(--text-main)", marginBottom: 16, lineHeight: 1.5 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {q.opts.map((opt, i) => {
          let bg = "rgba(var(--w-rgb),0.03)", bdr = "rgba(var(--w-rgb),0.08)", col = "rgba(var(--w-rgb),0.7)";
          if (selected !== null) {
            if (i === q.ans) { bg = "rgba(45,212,191,0.12)"; bdr = "rgba(45,212,191,0.4)"; col = "#2dd4bf"; }
            else if (i === selected) { bg = "rgba(249,115,22,0.12)"; bdr = "rgba(249,115,22,0.4)"; col = "#f97316"; }
          }
          return (<button key={i} onClick={() => pick(i)} style={{ padding: "10px 14px", background: bg, border: `1px solid ${bdr}`, borderRadius: 6, color: col, fontSize: 13, textAlign: "left", cursor: selected !== null ? "default" : "pointer", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s" }}>{opt}</button>);
        })}
      </div>
      {selected !== null && <div style={{ marginTop: 12, padding: 12, background: "rgba(var(--b-rgb),0.3)", borderRadius: 8, fontSize: 12, color: "rgba(var(--w-rgb),0.5)", lineHeight: 1.5, animation: "fadeIn 0.3s ease" }}>{q.why}</div>}
      {selected !== null && <button onClick={next} style={{ marginTop: 12, padding: "9px 24px", background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 6, color: "#818cf8", fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>{qi < QUIZ_QUESTIONS.length - 1 ? "Next →" : "See Results"}</button>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */
export default function ChomskyHierarchy() {
  const [activeLevel, setActiveLevel] = useState(null);
  const [tab, setTab] = useState("explore");
  const [pulse, setPulse] = useState(null);

  const handleClassify = (type) => {
    setActiveLevel(type);
    setPulse(type);
    setTimeout(() => setPulse(null), 900);
  };

  const level = activeLevel !== null ? LEVELS.find(l => l.type === activeLevel) : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-grad)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", padding: "0 0 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@300;400;600;700&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        select option { background: #111; }
      `}</style>

      <div style={{ textAlign: "center", padding: "44px 20px 24px" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(var(--w-rgb),0.25)", textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 10 }}>Formal Language Theory</div>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 700, margin: "0 0 6px", fontFamily: "'IBM Plex Mono', monospace", background: "linear-gradient(135deg, #2dd4bf, #818cf8, #f472b6, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Chomsky Hierarchy</h1>
        <p style={{ color: "rgba(var(--w-rgb),0.35)", maxWidth: 520, margin: "0 auto", fontSize: 13, lineHeight: 1.5 }}>Four nested levels of formal grammars, each with increasing generative power.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 28, padding: "0 20px", flexWrap: "wrap" }}>
        {[["explore","Explore"],["classify","Classify"],["compare","Compare"],["quiz","Quiz"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? "rgba(var(--w-rgb),0.08)" : "transparent", border: `1px solid ${tab === id ? "rgba(var(--w-rgb),0.15)" : "rgba(var(--w-rgb),0.05)"}`, borderRadius: 8, padding: "9px 22px", color: tab === id ? "var(--text-main)" : "rgba(var(--w-rgb),0.35)", fontSize: 13, fontWeight: tab === id ? 600 : 400, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s" }}>{label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 20px" }}>

        {/* ─── EXPLORE ─── */}
        {tab === "explore" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <SubsetStory />

            <VennDiagram activeLevel={activeLevel} onSelect={t => setActiveLevel(activeLevel === t ? null : t)} pulse={pulse} />

            {level && (
              <div key={level.type} style={{ marginTop: 24, padding: 24, background: "var(--card-bg)", border: `1px solid ${level.border}`, borderRadius: 12, backdropFilter: "blur(20px)", animation: "fadeIn 0.4s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: level.color, fontFamily: "'IBM Plex Mono', monospace" }}>{level.name}</h3>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: level.bg, border: `1px solid ${level.border}`, color: level.color, fontFamily: "'IBM Plex Mono', monospace" }}>{level.automaton}</span>
                </div>
                <p style={{ marginTop: 12, fontSize: 14, color: "rgba(var(--w-rgb),0.6)", lineHeight: 1.6 }}>{level.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                  <div style={{ padding: 12, background: "rgba(var(--b-rgb),0.2)", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: "rgba(var(--w-rgb),0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Production Form</div>
                    <code style={{ fontSize: 13, color: level.color }}>{level.production}</code>
                  </div>
                  <div style={{ padding: 12, background: "rgba(var(--b-rgb),0.2)", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: "rgba(var(--w-rgb),0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Key Property</div>
                    <div style={{ fontSize: 13, color: "rgba(var(--w-rgb),0.6)" }}>{level.key}</div>
                  </div>
                </div>

                {/* FEATURE 2: More examples */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 10, color: "rgba(var(--w-rgb),0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>Examples</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {level.examples.map((ex, i) => (
                      <span key={i} style={{ padding: "5px 12px", background: level.bg, border: `1px solid ${level.border}`, borderRadius: 20, fontSize: 12, color: level.color, fontFamily: "'IBM Plex Mono', monospace" }}>{ex}</span>
                    ))}
                  </div>
                </div>

                {/* FEATURE 3: Real-world applications */}
                <RealWorldSection level={level} />

                {/* FEATURE 1 & 4: Simulators for each type */}
                {level.type === 3 && (
                  <>
                    <DFAVisualizer />
                    <PumpingLemmaREG />
                  </>
                )}
                {level.type === 2 && (
                  <>
                    <PDAVisualizer />
                    <PumpingLemmaCFL />
                  </>
                )}
                {level.type === 1 && <LBAVisualizer />}
                {level.type === 0 && <TMVisualizer />}
              </div>
            )}
          </div>
        )}

        {/* ─── CLASSIFY ─── */}
        {tab === "classify" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <VennDiagram activeLevel={activeLevel} onSelect={t => setActiveLevel(activeLevel === t ? null : t)} pulse={pulse} />
            <div style={{ marginTop: 24 }}><Classifier onClassify={handleClassify} /></div>
          </div>
        )}

        {/* ─── COMPARE ─── */}
        {tab === "compare" && (
          <div style={{ animation: "fadeIn 0.4s ease", background: "var(--card-bg)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 24, backdropFilter: "blur(20px)", overflowX: "auto" }}>
            <h3 style={{ margin: "0 0 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: "var(--text-main)" }}>Comparison Table</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>{["Type", "Grammar", "Automaton", "Production", "Example"].map(h => (<th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", textAlign: "left", color: "rgba(var(--w-rgb),0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'IBM Plex Mono', monospace" }}>{h}</th>))}</tr>
              </thead>
              <tbody>
                {LEVELS.map(l => (
                  <tr key={l.type} style={{ cursor: "pointer" }} onClick={() => { setActiveLevel(l.type); setTab("explore"); }}>
                    <td style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: l.color, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{l.short}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(var(--w-rgb),0.6)" }}>{l.grammar}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(var(--w-rgb),0.6)" }}>{l.automaton}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(var(--w-rgb),0.45)", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>{l.production}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: l.color, fontFamily: "'IBM Plex Mono', monospace" }}>{l.examples[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ textAlign: "center", color: "rgba(var(--w-rgb),0.2)", fontSize: 11, marginTop: 14 }}>Click any row to explore that level</p>
          </div>
        )}

        {/* ─── QUIZ ─── */}
        {tab === "quiz" && (
          <div style={{ animation: "fadeIn 0.4s ease", background: "var(--card-bg)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 24, backdropFilter: "blur(20px)" }}>
            <Quiz />
          </div>
        )}
      </div>
    </div>
  );
}
