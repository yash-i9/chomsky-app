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

/* ═══════════════════════════════════════════════════
   MACHINE ANIMATION COMPONENT
   ═══════════════════════════════════════════════════ */

const MACHINE_COLORS = {
  3: { main: "#2dd4bf", bg: "rgba(45,212,191,0.08)", border: "rgba(45,212,191,0.25)", light: "rgba(45,212,191,0.15)" },
  2: { main: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.25)", light: "rgba(129,140,248,0.15)" },
  1: { main: "#f472b6", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.25)", light: "rgba(244,114,182,0.15)" },
  0: { main: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)", light: "rgba(249,115,22,0.15)" },
};

const MACHINE_META = {
  3: { label: "DFA ANIMATION", input: "aaabbb", example: "a*b*", desc: "No memory — only fixed states. Reads left to right, one symbol at a time." },
  2: { label: "PDA ANIMATION", input: "aaabbb", example: "aⁿbⁿ", desc: "Stack memory — pushes for each 'a', pops for each 'b'. Counts matched pairs." },
  1: { label: "LBA ANIMATION", input: "aabbcc", example: "aⁿbⁿcⁿ", desc: "Bounded tape — rewrites in-place. Uses no more tape than the input length." },
  0: { label: "TM ANIMATION", input: "aaabbb", example: "aⁿbⁿ", desc: "Infinite tape — reads, writes, moves freely. Multiple passes over the tape." },
};

function buildDFASteps(input) {
  const states = ["q₀", "q₁", "qDead"];
  const accept = ["q₀", "q₁"];
  const trans = { "q₀": { a: "q₀", b: "q₁" }, "q₁": { b: "q₁", a: "qDead" }, qDead: { a: "qDead", b: "qDead" } };
  const stateLabels = { "q₀": "q₀ — reading a's", "q₁": "q₁ — reading b's", qDead: "qDead — error" };
  const steps = [];
  let state = "q₀";
  steps.push({ head: -1, state, msg: "Start — DFA in initial state q₀. No memory used.", allStates: states, accept, stateLabels });
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = (trans[state] || {})[ch] || "qDead";
    steps.push({ head: i, state: next, msg: `Read '${ch}' → transition ${state} → ${next}`, allStates: states, accept, stateLabels });
    state = next;
  }
  const ok = accept.includes(state);
  steps.push({ head: input.length, state, msg: ok ? "End of input. Accepting state — ACCEPTED!" : "End of input. Non-accepting state — REJECTED!", allStates: states, accept, stateLabels, result: ok ? "accepted" : "rejected" });
  return steps;
}

function buildPDASteps(input) {
  const states = ["q_push", "q_pop", "q_accept"];
  const accept = ["q_accept"];
  const steps = [];
  let stack = ["$"];
  let state = "q_push";
  steps.push({ head: -1, state, stack: [...stack], msg: "Stack initialized with bottom-marker $", allStates: states, accept });
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "a") {
      stack = ["A", ...stack];
      steps.push({ head: i, state: "q_push", stack: [...stack], msg: `Read 'a' → push A. Stack depth: ${stack.length - 1}`, allStates: states, accept });
    } else {
      state = "q_pop";
      if (stack[0] === "A") {
        stack = stack.slice(1);
        steps.push({ head: i, state: "q_pop", stack: [...stack], msg: `Read 'b' → pop A. Stack depth: ${stack.length - 1}`, allStates: states, accept });
      } else {
        steps.push({ head: i, state: "q_pop", stack: [...stack], msg: "Read 'b' but stack empty — too many b's!", allStates: states, accept, result: "rejected" });
        return steps;
      }
    }
  }
  const ok = stack.length === 1 && stack[0] === "$";
  state = ok ? "q_accept" : "q_pop";
  steps.push({ head: input.length, state, stack: [...stack], msg: ok ? "Stack back to '$' — counts matched. ACCEPTED!" : "Stack not empty — a's exceed b's. REJECTED!", allStates: states, accept, result: ok ? "accepted" : "rejected" });
  return steps;
}

function buildLBASteps(input) {
  const steps = [];
  let tape = [...input];
  const modSet = new Set();
  steps.push({ tape: [...tape], head: -1, modified: new Set(), msg: "LBA starts — tape length bounded to input size: " + input.length });
  let iter = 0;
  while (iter < 20) {
    const ai = tape.indexOf("a");
    if (ai === -1) {
      const anyLeft = tape.includes("b") || tape.includes("c");
      steps.push({ tape: [...tape], head: 0, modified: new Set(modSet), msg: anyLeft ? "Unmatched b or c remain — REJECTED!" : "All symbols matched — ACCEPTED!", result: anyLeft ? "rejected" : "accepted" });
      break;
    }
    tape[ai] = "A"; modSet.add(ai);
    steps.push({ tape: [...tape], head: ai, modified: new Set(modSet), msg: `Marked a→A at pos ${ai}` });
    const bi = tape.indexOf("b");
    if (bi === -1) { steps.push({ tape: [...tape], head: 0, modified: new Set(modSet), msg: "No b found — counts differ. REJECTED!", result: "rejected" }); break; }
    tape[bi] = "B"; modSet.add(bi);
    steps.push({ tape: [...tape], head: bi, modified: new Set(modSet), msg: `Marked b→B at pos ${bi}` });
    const ci = tape.indexOf("c");
    if (ci === -1) { steps.push({ tape: [...tape], head: 0, modified: new Set(modSet), msg: "No c found — counts differ. REJECTED!", result: "rejected" }); break; }
    tape[ci] = "C"; modSet.add(ci);
    steps.push({ tape: [...tape], head: ci, modified: new Set(modSet), msg: `Marked c→C at pos ${ci} — pass ${iter + 1} complete` });
    iter++;
  }
  return steps;
}

function buildTMSteps(input) {
  const allStates = ["q₀", "q₁", "q₂", "q_accept", "q_reject"];
  const accept = ["q_accept"];
  const steps = [];
  let tape = [...input, "_"];
  let head = 0, state = "q₀";
  const modSet = new Set();
  steps.push({ tape: [...tape], head, state, modified: new Set(modSet), msg: "TM starts — infinite tape, head at position 0", allStates, accept });
  let iter = 0;
  while (state !== "q_accept" && state !== "q_reject" && iter < 200) {
    iter++;
    const sym = tape[head] || "_";
    let nextState = state, write = sym, move = 0;
    if (state === "q₀") {
      if (sym === "a") { write = "X"; nextState = "q₁"; move = 1; modSet.add(head); }
      else if (sym === "X") { move = 1; }
      else if (sym === "Y") { nextState = "q₂"; move = 1; }
      else if (sym === "_") { nextState = "q_accept"; }
      else { nextState = "q_reject"; }
    } else if (state === "q₁") {
      if (sym === "a" || sym === "X" || sym === "Y") { move = 1; }
      else if (sym === "b") { write = "Y"; nextState = "q₂"; move = -1; modSet.add(head); }
      else { nextState = "q_reject"; }
    } else if (state === "q₂") {
      if (sym === "a" || sym === "X" || sym === "Y") { move = -1; }
      else { move = 1; nextState = "q₀"; }
    }
    if (write !== sym) tape[head] = write;
    const msg =
      nextState === "q_accept" ? "All a's matched with b's — ACCEPTED!" :
      nextState === "q_reject" ? "Mismatch found — REJECTED!" :
      `State ${state}: read '${sym}' → write '${write}', move ${move > 0 ? "right ▶" : move < 0 ? "◀ left" : "stay"} → ${nextState}`;
    state = nextState;
    head += move;
    if (head < 0) head = 0;
    while (head >= tape.length) tape.push("_");
    steps.push({ tape: [...tape], head, state, modified: new Set(modSet), msg, allStates, accept, result: state === "q_accept" ? "accepted" : state === "q_reject" ? "rejected" : "" });
    if (state === "q_accept" || state === "q_reject") break;
  }
  return steps;
}

function MachineAnimation({ type }) {
  const col = MACHINE_COLORS[type];
  const meta = MACHINE_META[type];
  const [steps, setSteps] = useState([]);
  const [idx, setIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const autoRef = useRef(null);

  const buildSteps = () => {
    if (type === 3) return buildDFASteps(meta.input);
    if (type === 2) return buildPDASteps(meta.input);
    if (type === 1) return buildLBASteps(meta.input);
    return buildTMSteps(meta.input);
  };

  const handleStart = () => { const s = buildSteps(); setSteps(s); setIdx(0); setRunning(true); };
  const handleStep = () => { setIdx(i => Math.min(i + 1, steps.length - 1)); };
  const handleAuto = () => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; setRunning(false); return; }
    setRunning(true);
    autoRef.current = setInterval(() => {
      setIdx(i => {
        if (i >= steps.length - 1) { clearInterval(autoRef.current); autoRef.current = null; setRunning(false); return i; }
        return i + 1;
      });
    }, 600);
  };
  const handleReset = () => { clearInterval(autoRef.current); autoRef.current = null; setSteps([]); setIdx(-1); setRunning(false); };
  useEffect(() => () => clearInterval(autoRef.current), []);

  const cur = steps[idx] || null;
  const finished = idx === steps.length - 1 && steps.length > 0;
  const result = cur?.result || "";
  const tapeCells = type === 1 || type === 0
    ? (cur?.tape || (type === 0 ? [...meta.input, "_"] : [...meta.input]))
    : meta.input.split("");
  const headIdx = cur ? cur.head : -1;

  const btnStyle = (active) => ({
    padding: "6px 14px", background: active ? col.light : "var(--t04)",
    border: `1px solid ${active ? col.main : "var(--t08)"}`,
    borderRadius: 6, color: active ? col.main : "var(--t5)",
    fontSize: 11, fontWeight: active ? 600 : 400,
    cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s",
  });

  return (
    <div style={{ marginTop: 20, padding: 18, background: col.bg, border: `1px solid ${col.border}`, borderRadius: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
        <div style={{ fontSize: 11, color: col.main, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em" }}>{meta.label}</div>
        <div style={{ fontSize: 11, color: "var(--t35)", fontFamily: "'IBM Plex Mono', monospace" }}>
          Example: <span style={{ color: col.main }}>{meta.example}</span> &nbsp;|&nbsp; Input: <span style={{ color: "var(--t6)" }}>"{meta.input}"</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--t45)", marginBottom: 14, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5 }}>{meta.desc}</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        {idx < 0 && <button style={btnStyle(false)} onClick={handleStart}>▶ Start</button>}
        {idx >= 0 && !finished && <button style={btnStyle(false)} onClick={handleStep}>Step →</button>}
        {idx >= 0 && !finished && <button style={btnStyle(!!autoRef.current)} onClick={handleAuto}>{autoRef.current ? "Pause" : "Auto"}</button>}
        {idx >= 0 && <button style={btnStyle(false)} onClick={handleReset}>Reset</button>}
        {steps.length > 0 && <span style={{ fontSize: 10, color: "var(--t25)", fontFamily: "'IBM Plex Mono', monospace", marginLeft: "auto" }}>step {Math.max(idx, 0)}/{steps.length - 1}</span>}
      </div>
      <div style={{ padding: "9px 13px", borderRadius: 7, marginBottom: 14, background: result === "accepted" ? `${col.bg}` : result === "rejected" ? "rgba(249,115,22,0.08)" : "var(--t02)", border: `1px solid ${result === "accepted" ? col.border : result === "rejected" ? "rgba(249,115,22,0.35)" : "var(--t06)"}`, fontSize: 12, color: result === "accepted" ? col.main : result === "rejected" ? "#f97316" : "var(--t5)", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5, minHeight: 36, transition: "all 0.3s" }}>
        {cur ? cur.msg : `Input: "${meta.input}" — click Start to begin`}
      </div>
      <div style={{ fontSize: 9, color: "var(--t25)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 5 }}>
        {type === 0 ? "Tape (infinite — head shown with ▲)" : type === 1 ? "Bounded tape (in-place rewrite)" : "Input tape"}
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
        {tapeCells.map((cell, i) => {
          const isHead = i === headIdx;
          const isMod = (cur?.modified instanceof Set) ? cur.modified.has(i) : false;
          const wasRead = !isHead && headIdx >= 0 && i < headIdx && type !== 1;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ minWidth: 32, height: 32, borderRadius: 5, padding: "0 4px", border: `2px solid ${isHead ? col.main : isMod ? col.border : "var(--t1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: isHead ? col.main : isMod ? col.main : wasRead ? "var(--t25)" : "var(--t65)", background: isHead ? col.light : isMod ? `${col.main}0d` : "transparent", transition: "all 0.2s" }}>{cell}</div>
              {isHead && <div style={{ fontSize: 9, color: col.main, lineHeight: 1, marginTop: 1 }}>▲</div>}
              <div style={{ fontSize: 7, color: "var(--t15)", fontFamily: "'IBM Plex Mono', monospace" }}>{i}</div>
            </div>
          );
        })}
        {type === 0 && <div style={{ minWidth: 28, height: 32, border: "2px dashed var(--t06)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--t15)" }}>…</div>}
      </div>
      {type === 2 && cur?.stack && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: "var(--t25)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 5 }}>Stack (top → bottom)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 160, overflowY: "auto", width: 56 }}>
            {cur.stack.map((item, i) => (
              <div key={i} style={{ height: 26, borderRadius: 4, background: item === "$" ? "var(--t07)" : col.light, border: `1px solid ${item === "$" ? "var(--t12)" : col.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: item === "$" ? "var(--t3)" : col.main, transition: "all 0.2s" }}>{item}</div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "var(--t2)", marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>$ = bottom marker</div>
        </div>
      )}
      {(type === 3 || type === 0) && cur?.allStates && (
        <div>
          <div style={{ fontSize: 9, color: "var(--t25)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>States</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {cur.allStates.map(s => {
              const isCur = s === cur.state; const isAcc = cur.accept.includes(s);
              const label = type === 3 ? (cur.stateLabels?.[s] || s) : s;
              return (<div key={s} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, border: `${isAcc && !isCur ? "2px" : "1px"} solid ${isCur ? col.main : isAcc ? col.border : "var(--t08)"}`, background: isCur ? col.light : "var(--t03)", color: isCur ? col.main : isAcc ? col.main + "99" : "var(--t35)", fontFamily: "'IBM Plex Mono', monospace", fontWeight: isCur ? 600 : 400, transition: "all 0.25s" }}>{label}{isAcc ? " ✓" : ""}</div>);
            })}
          </div>
        </div>
      )}
      {type === 2 && cur?.allStates && (
        <div>
          <div style={{ fontSize: 9, color: "var(--t25)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6, marginTop: 8 }}>States</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {cur.allStates.map(s => {
              const isCur = s === cur.state; const isAcc = cur.accept.includes(s);
              return (<div key={s} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, border: `${isAcc && !isCur ? "2px" : "1px"} solid ${isCur ? col.main : isAcc ? col.border : "var(--t08)"}`, background: isCur ? col.light : "var(--t03)", color: isCur ? col.main : isAcc ? col.main + "99" : "var(--t35)", fontFamily: "'IBM Plex Mono', monospace", fontWeight: isCur ? 600 : 400, transition: "all 0.25s" }}>{s}{isAcc ? " ✓" : ""}</div>);
            })}
          </div>
        </div>
      )}
      {type === 1 && <div style={{ marginTop: 10, fontSize: 11, color: "var(--t35)", fontFamily: "'IBM Plex Mono', monospace" }}>Uppercase letters (A, B, C) = marked cells. Tape never grows beyond {meta.input.length} cells.</div>}
      {type === 0 && <div style={{ marginTop: 10, fontSize: 11, color: "var(--t35)", fontFamily: "'IBM Plex Mono', monospace" }}>X = marked 'a', Y = matched 'b'. The TM makes multiple left-right sweeps — unlike the LBA, it could use any amount of tape.</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PUMPING LEMMA SIMULATOR
   ═══════════════════════════════════════════════════ */

const PL_REGULAR_PRESETS = [
  {
    id: "astar_bstar",
    name: "a*b* (Regular)",
    type: 3,
    description: "All strings of a's followed by b's. This IS regular.",
    defaultString: "aaabbb",
    pumpingLength: 3,
    // For a*b*, choose w = a^p b^p. Decompose x=a^i, y=a^j (j>=1), z=a^(p-i-j)b^p
    // pumping y down/up keeps it in a*b* — so pumping doesn't break it → language IS regular
    decompose: (w, p) => {
      // pick split: x = first 0 chars, y = first char, z = rest
      const xLen = 0;
      const yLen = Math.min(p, Math.max(1, Math.floor(w.length / 3)));
      const zLen = w.length - xLen - yLen;
      return { x: w.slice(0, xLen), y: w.slice(xLen, xLen + yLen), z: w.slice(xLen + yLen) };
    },
    pump: (x, y, z, i) => x + y.repeat(i) + z,
    check: (s) => /^a*b*$/.test(s),
    isRegular: true,
    explanation: "For any decomposition xyz with |xy| ≤ p and |y| ≥ 1, pumping y any number of times stays in a*b*. The pumped string always has more a's (or more of the repeated block), which remains in a*b*. This confirms the language is regular."
  },
  {
    id: "anbn",
    name: "aⁿbⁿ (Not Regular)",
    type: 2,
    description: "Equal a's followed by equal b's. This is NOT regular — it's context-free.",
    defaultString: "aaabbb",
    pumpingLength: 3,
    decompose: (w, p) => {
      // w = a^p b^p. Since |xy| <= p, y falls entirely in the a-region
      const xLen = 0;
      const yLen = Math.max(1, Math.floor(p / 2));
      const zLen = w.length - xLen - yLen;
      return { x: w.slice(0, xLen), y: w.slice(xLen, xLen + yLen), z: w.slice(xLen + yLen) };
    },
    pump: (x, y, z, i) => x + y.repeat(i) + z,
    check: (s) => {
      if (!s) return true;
      const m = s.match(/^(a*)(b*)$/);
      if (!m) return false;
      return m[1].length === m[2].length;
    },
    isRegular: false,
    explanation: "Since |xy| ≤ p, both x and y consist only of a's. Pumping y (repeating it i times) adds more a's without adding b's. For i=2, the pumped string has more a's than b's, so it's NOT in aⁿbⁿ. This is the pumping lemma contradiction — aⁿbⁿ is not regular."
  },
  {
    id: "even_a",
    name: "Even number of a's (Regular)",
    type: 3,
    description: "Strings over {a,b} with an even count of a's. This IS regular.",
    defaultString: "aabaa",
    pumpingLength: 2,
    decompose: (w, p) => {
      const firstA = w.indexOf('a');
      if (firstA === -1) return { x: w.slice(0, 1), y: w.slice(1, 2) || 'b', z: w.slice(2) };
      return { x: w.slice(0, firstA), y: w.slice(firstA, firstA + 2), z: w.slice(firstA + 2) };
    },
    pump: (x, y, z, i) => x + y.repeat(i) + z,
    check: (s) => /^[ab]*$/.test(s) && (s.split('').filter(c => c === 'a').length % 2 === 0),
    isRegular: true,
    explanation: "We can choose y to consist of exactly 2 a's. Pumping this pair keeps the total a-count even. Even with different decompositions, a DFA with 2 states (even/odd parity) handles this — it IS regular."
  },
  {
    id: "palindrome",
    name: "Palindromes over {a,b} (Not Regular)",
    type: 2,
    description: "Strings equal to their reverse. This is NOT regular.",
    defaultString: "abacaba",
    pumpingLength: 4,
    decompose: (w, p) => {
      return { x: w.slice(0, 1), y: w.slice(1, 2), z: w.slice(2) };
    },
    pump: (x, y, z, i) => x + y.repeat(i) + z,
    check: (s) => /^[ab]*$/.test(s) && s === s.split('').reverse().join(''),
    isRegular: false,
    explanation: "Let w = aⁿbaⁿ (length 2n+1 > p). Since |xy| ≤ p ≤ n, y consists only of a's at the start. Pumping y for i=2 gives extra a's at the front without matching ones at the back — the result is not a palindrome. Contradiction proves palindromes are not regular."
  },
];

const PL_CFL_PRESETS = [
  {
    id: "anbncn",
    name: "aⁿbⁿcⁿ (Not CFL)",
    type: 1,
    description: "Equal counts of a's, b's, and c's. This is NOT context-free.",
    defaultString: "aaabbbccc",
    pumpingLength: 3,
    decompose: (w, p) => {
      // v and x must be non-empty, |vwx| <= p
      // choose v = b's, x = c's (straddling the bc boundary)
      const aCount = w.split('').filter(c=>c==='a').length;
      const bStart = aCount;
      return {
        u: w.slice(0, bStart),
        v: w.slice(bStart, bStart + Math.max(1, Math.floor(p/3))),
        w_mid: w.slice(bStart + Math.max(1, Math.floor(p/3)), bStart + Math.max(1, Math.floor(p/3)) + 1),
        x: w.slice(bStart + Math.max(1, Math.floor(p/3)) + 1, bStart + Math.max(1, Math.floor(p/3)) + 1 + Math.max(1, Math.floor(p/3))),
        y: w.slice(bStart + Math.max(1, Math.floor(p/3)) + 1 + Math.max(1, Math.floor(p/3))),
      };
    },
    pump: (u, v, w_mid, x, y, i) => u + v.repeat(i) + w_mid + x.repeat(i) + y,
    check: (s) => {
      if (!s) return true;
      const m = s.match(/^(a+)(b+)(c+)$/);
      return m ? m[1].length === m[2].length && m[2].length === m[3].length : false;
    },
    isRegular: false,
    explanation: "By the CFL pumping lemma, vwx can span at most two of the three symbol groups. Pumping v and x (e.g., both in the b-region, or straddling b/c) can never keep all three counts equal simultaneously. For i=2, at least one count differs. This proves aⁿbⁿcⁿ is not context-free."
  },
  {
    id: "anbn_cfl",
    name: "aⁿbⁿ (Is CFL)",
    type: 2,
    description: "Equal a's then b's. This IS context-free.",
    defaultString: "aaabbb",
    pumpingLength: 3,
    decompose: (w, p) => {
      const half = Math.floor(w.length / 2);
      return {
        u: "",
        v: w.slice(0, 1),
        w_mid: w.slice(1, half),
        x: w.slice(half, half + 1),
        y: w.slice(half + 1),
      };
    },
    pump: (u, v, w_mid, x, y, i) => u + v.repeat(i) + w_mid + x.repeat(i) + y,
    check: (s) => {
      if (!s) return true;
      const m = s.match(/^(a*)(b*)$/);
      return m ? m[1].length === m[2].length : false;
    },
    isRegular: true,
    explanation: "aⁿbⁿ satisfies the CFL pumping lemma. We can decompose any long enough string so that v spans a's and x spans b's, and pumping both together keeps counts equal. A PDA can recognize this language by pushing a's and popping for b's."
  },
  {
    id: "ww",
    name: "ww — doubled string (Not CFL)",
    type: 1,
    description: "A string concatenated with itself. This is NOT context-free.",
    defaultString: "abcabc",
    pumpingLength: 3,
    decompose: (w, p) => {
      return {
        u: w.slice(0, 1),
        v: w.slice(1, 2),
        w_mid: w.slice(2, w.length - 2),
        x: w.slice(w.length - 2, w.length - 1),
        y: w.slice(w.length - 1),
      };
    },
    pump: (u, v, w_mid, x, y, i) => u + v.repeat(i) + w_mid + x.repeat(i) + y,
    check: (s) => s.length % 2 === 0 && s.slice(0, s.length / 2) === s.slice(s.length / 2),
    isRegular: false,
    explanation: "For w = aⁿbⁿaⁿbⁿ (which is in ww), any vwx of length ≤ p lies in one half or near the middle. Pumping v and x can never simultaneously fix both halves — the string becomes unequal. This proves ww is not context-free."
  },
];

function StringDisplay({ parts, colors, labels }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 0, fontFamily: "'IBM Plex Mono', monospace" }}>
        {parts.map((part, pi) => (
          part.split('').map((ch, ci) => (
            <div key={`${pi}-${ci}`} style={{
              minWidth: 28, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              background: colors[pi] + "22",
              border: `1px solid ${colors[pi]}55`,
              borderLeft: ci === 0 ? `2px solid ${colors[pi]}` : `1px solid ${colors[pi]}44`,
              borderRight: ci === part.length - 1 ? `2px solid ${colors[pi]}` : `1px solid ${colors[pi]}44`,
              fontSize: 14, fontWeight: 600, color: colors[pi],
              transition: "all 0.25s",
            }}>{ch}</div>
          ))
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {labels.map((lbl, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: colors[i] }}></div>
            <span style={{ color: "var(--t4)" }}>{lbl}</span>
            {parts[i] !== undefined && <span style={{ color: colors[i] }}>= "{parts[i] || 'ε'}"</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PumpingLemmaSimulator({ type }) {
  const isRegular = type === 3;
  const presets = isRegular ? PL_REGULAR_PRESETS : PL_CFL_PRESETS;
  const col = MACHINE_COLORS[type];

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [pumpI, setPumpI] = useState(2);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("setup"); // setup | pump | explain

  const preset = presets[selectedPreset];

  // Decomposition
  let decomp;
  if (isRegular) {
    decomp = preset.decompose(preset.defaultString, preset.pumpingLength);
  } else {
    decomp = preset.decompose(preset.defaultString, preset.pumpingLength);
  }

  // Pumped string
  let pumped;
  if (isRegular) {
    pumped = preset.pump(decomp.x, decomp.y, decomp.z, pumpI);
  } else {
    pumped = preset.pump(decomp.u, decomp.v, decomp.w_mid, decomp.x, decomp.y, pumpI);
  }

  const pumpedAccepted = preset.check(pumped);
  const isContradiction = !pumpedAccepted && !preset.isRegular;
  const isSatisfied = pumpedAccepted && preset.isRegular;

  return (
    <div style={{ marginTop: 20 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "11px 16px",
          background: open ? col.bg : "var(--t03)",
          border: `1px solid ${open ? col.border : "var(--t08)"}`,
          borderRadius: 10, color: open ? col.main : "var(--t45)",
          fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "all 0.2s",
        }}
      >
        <span>Pumping Lemma Simulator — {isRegular ? "Type 3 (Regular)" : "Type 2 (Context-Free)"}</span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{open ? "▲ hide" : "▼ show"}</span>
      </button>

      {open && (
        <div style={{ marginTop: 8, padding: 22, background: "var(--panel-bg)", border: `1px solid ${col.border}`, borderRadius: 12, animation: "fadeIn 0.3s ease", backdropFilter: "blur(20px)" }}>
          {/* Theory Banner */}
          <div style={{ padding: "10px 14px", background: col.bg, border: `1px solid ${col.border}`, borderRadius: 8, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: col.main, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>
              {isRegular ? "Regular Pumping Lemma" : "Context-Free Pumping Lemma"}
            </div>
            {isRegular ? (
              <div style={{ fontSize: 12, color: "var(--t55)", lineHeight: 1.7, fontFamily: "'IBM Plex Mono', monospace" }}>
                If L is regular, then ∃ pumping length <span style={{ color: col.main }}>p</span> such that ∀ w ∈ L with |w| ≥ p,<br/>
                w can be split as <span style={{ color: "#f97316" }}>x</span><span style={{ color: col.main }}>y</span><span style={{ color: "#818cf8" }}>z</span> where <span style={{ color: col.main }}>|y| ≥ 1</span>, <span style={{ color: col.main }}>|xy| ≤ p</span>,<br/>
                and ∀ i ≥ 0: <span style={{ color: "#f97316" }}>x</span><span style={{ color: col.main }}>yⁱ</span><span style={{ color: "#818cf8" }}>z</span> ∈ L
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--t55)", lineHeight: 1.7, fontFamily: "'IBM Plex Mono', monospace" }}>
                If L is CFL, then ∃ pumping length <span style={{ color: col.main }}>p</span> such that ∀ w ∈ L with |w| ≥ p,<br/>
                w can be split as <span style={{ color: "#f97316" }}>u</span><span style={{ color: col.main }}>v</span><span style={{ color: "#2dd4bf" }}>w</span><span style={{ color: "#f472b6" }}>x</span><span style={{ color: "#818cf8" }}>y</span> where <span style={{ color: col.main }}>|vx| ≥ 1</span>, <span style={{ color: col.main }}>|vwx| ≤ p</span>,<br/>
                and ∀ i ≥ 0: <span style={{ color: "#f97316" }}>u</span><span style={{ color: col.main }}>vⁱ</span><span style={{ color: "#2dd4bf" }}>w</span><span style={{ color: "#f472b6" }}>xⁱ</span><span style={{ color: "#818cf8" }}>y</span> ∈ L
              </div>
            )}
          </div>

          {/* Preset Selector */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>Select Language</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {presets.map((p, i) => {
                const lvCol = MACHINE_COLORS[p.type].main;
                return (
                  <button key={p.id} onClick={() => { setSelectedPreset(i); setPumpI(2); }}
                    style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", transition: "all 0.15s", background: selectedPreset === i ? `${lvCol}20` : "var(--t03)", border: `1px solid ${selectedPreset === i ? lvCol + "60" : "var(--t08)"}`, color: selectedPreset === i ? lvCol : "var(--t4)", fontWeight: selectedPreset === i ? 600 : 400 }}
                  >{p.name}</button>
                );
              })}
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: "1px solid var(--t08)", paddingBottom: 0 }}>
            {["setup", "pump", "explain"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding: "7px 16px", background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === t ? col.main : "transparent"}`, color: activeTab === t ? col.main : "var(--t35)", fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontWeight: activeTab === t ? 600 : 400, transition: "all 0.15s", marginBottom: -1 }}
              >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>

          {/* SETUP TAB */}
          {activeTab === "setup" && (
            <div style={{ animation: "fadeIn 0.25s ease" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "var(--t65)", lineHeight: 1.65, marginBottom: 12 }}>{preset.description}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                  <div style={{ padding: "9px 14px", background: "var(--b2)", borderRadius: 8, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
                    <span style={{ color: "var(--t3)" }}>Pumping length p = </span>
                    <span style={{ color: col.main, fontWeight: 600 }}>{preset.pumpingLength}</span>
                  </div>
                  <div style={{ padding: "9px 14px", background: "var(--b2)", borderRadius: 8, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
                    <span style={{ color: "var(--t3)" }}>String w = </span>
                    <span style={{ color: "var(--t)", fontWeight: 600 }}>"{preset.defaultString}"</span>
                    <span style={{ color: "var(--t3)" }}> (|w| = {preset.defaultString.length} ≥ p)</span>
                  </div>
                  <div style={{ padding: "9px 14px", background: preset.isRegular ? "rgba(45,212,191,0.08)" : "rgba(249,115,22,0.08)", borderRadius: 8, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", border: `1px solid ${preset.isRegular ? "rgba(45,212,191,0.3)" : "rgba(249,115,22,0.3)"}` }}>
                    <span style={{ color: "var(--t3)" }}>Verdict: </span>
                    <span style={{ color: preset.isRegular ? "#2dd4bf" : "#f97316", fontWeight: 600 }}>{preset.isRegular ? (isRegular ? "IS Regular" : "IS Context-Free") : (isRegular ? "NOT Regular" : "NOT Context-Free")}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
                  Decomposition of w
                </div>
                {isRegular ? (
                  <StringDisplay
                    parts={[decomp.x, decomp.y, decomp.z]}
                    colors={["#f97316", col.main, "#818cf8"]}
                    labels={["x", "y (pumped)", "z"]}
                  />
                ) : (
                  <StringDisplay
                    parts={[decomp.u, decomp.v, decomp.w_mid, decomp.x, decomp.y]}
                    colors={["#f97316", col.main, "#2dd4bf", "#f472b6", "#818cf8"]}
                    labels={["u", "v (pumped)", "w", "x (pumped)", "y"]}
                  />
                )}
              </div>

              {isRegular && (
                <div style={{ fontSize: 12, color: "var(--t4)", fontFamily: "'IBM Plex Mono', monospace", marginTop: 8 }}>
                  Constraints: |xy| = {decomp.x.length + decomp.y.length} ≤ {preset.pumpingLength} (p) &nbsp;|&nbsp; |y| = {decomp.y.length} ≥ 1
                </div>
              )}
              {!isRegular && (
                <div style={{ fontSize: 12, color: "var(--t4)", fontFamily: "'IBM Plex Mono', monospace", marginTop: 8 }}>
                  Constraints: |vwx| = {decomp.v.length + decomp.w_mid.length + decomp.x.length} ≤ {preset.pumpingLength} (p) &nbsp;|&nbsp; |vx| = {decomp.v.length + decomp.x.length} ≥ 1
                </div>
              )}
            </div>
          )}

          {/* PUMP TAB */}
          {activeTab === "pump" && (
            <div style={{ animation: "fadeIn 0.25s ease" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
                  Pump count i
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <button key={i} onClick={() => setPumpI(i)}
                      style={{ width: 40, height: 40, borderRadius: 8, fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", fontWeight: pumpI === i ? 700 : 400, cursor: "pointer", transition: "all 0.15s", background: pumpI === i ? col.light : "var(--t04)", border: `2px solid ${pumpI === i ? col.main : "var(--t08)"}`, color: pumpI === i ? col.main : "var(--t4)" }}
                    >{i}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
                  Pumped string (i = {pumpI})
                </div>
                {pumpI === 0 && (
                  <div style={{ fontSize: 11, color: "var(--t35)", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                    i=0 means y (or v,x) is deleted — string becomes shorter
                  </div>
                )}
                {pumpI === 1 && (
                  <div style={{ fontSize: 11, color: "var(--t35)", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                    i=1 is the original string w unchanged
                  </div>
                )}
                {isRegular ? (
                  <StringDisplay
                    parts={[decomp.x, decomp.y.repeat(pumpI), decomp.z]}
                    colors={["#f97316", col.main, "#818cf8"]}
                    labels={[`x = "${decomp.x || 'ε'}"`, `y^${pumpI} = "${decomp.y.repeat(pumpI) || 'ε'}"`, `z = "${decomp.z || 'ε'}"`]}
                  />
                ) : (
                  <StringDisplay
                    parts={[decomp.u, decomp.v.repeat(pumpI), decomp.w_mid, decomp.x.repeat(pumpI), decomp.y]}
                    colors={["#f97316", col.main, "#2dd4bf", "#f472b6", "#818cf8"]}
                    labels={[`u`, `v^${pumpI}`, `w`, `x^${pumpI}`, `y`]}
                  />
                )}
              </div>

              <div style={{ padding: "12px 16px", borderRadius: 9, marginTop: 8, background: pumpedAccepted ? "rgba(45,212,191,0.08)" : "rgba(249,115,22,0.08)", border: `1px solid ${pumpedAccepted ? "rgba(45,212,191,0.35)" : "rgba(249,115,22,0.35)"}`, transition: "all 0.3s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: pumpedAccepted ? "#2dd4bf" : "#f97316" }}>
                    {pumpedAccepted ? "ACCEPTED" : "REJECTED"}
                  </span>
                  <code style={{ fontSize: 13, color: "var(--t6)", background: "var(--t07)", padding: "2px 8px", borderRadius: 5, fontFamily: "'IBM Plex Mono', monospace" }}>"{pumped}"</code>
                </div>
                <div style={{ fontSize: 12, color: "var(--t5)", lineHeight: 1.6 }}>
                  {isContradiction && (
                    <>The pumped string is <strong style={{ color: "#f97316" }}>not in the language</strong>. This contradicts the pumping lemma — confirming this language is <strong style={{ color: "#f97316" }}>NOT {isRegular ? "regular" : "context-free"}</strong>.</>
                  )}
                  {isSatisfied && (
                    <>The pumped string is <strong style={{ color: "#2dd4bf" }}>still in the language</strong>. Pumping works — consistent with the language being <strong style={{ color: "#2dd4bf" }}>{isRegular ? "regular" : "context-free"}</strong>.</>
                  )}
                  {!isContradiction && !isSatisfied && pumpedAccepted && (
                    <>Pumped string is accepted. Try i=0 or i=2 to find a contradiction (if the language is not {isRegular ? "regular" : "context-free"}).</>
                  )}
                  {!isContradiction && !isSatisfied && !pumpedAccepted && (
                    <>Pumped string is rejected. This is a contradiction — use the Explain tab to understand why.</>
                  )}
                </div>
              </div>

              {/* Quick comparison */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>All pump values at a glance</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[0, 1, 2, 3, 4].map(i => {
                    const s = isRegular
                      ? preset.pump(decomp.x, decomp.y, decomp.z, i)
                      : preset.pump(decomp.u, decomp.v, decomp.w_mid, decomp.x, decomp.y, i);
                    const acc = preset.check(s);
                    return (
                      <div key={i} onClick={() => setPumpI(i)} style={{ padding: "6px 12px", borderRadius: 7, cursor: "pointer", background: acc ? "rgba(45,212,191,0.08)" : "rgba(249,115,22,0.08)", border: `1px solid ${acc ? "rgba(45,212,191,0.3)" : "rgba(249,115,22,0.3)"}`, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.15s" }}>
                        <span style={{ color: "var(--t4)" }}>i={i}: </span>
                        <span style={{ color: "var(--t6)" }}>"{s.length > 12 ? s.slice(0,10)+'…' : s}"</span>
                        <span style={{ color: acc ? "#2dd4bf" : "#f97316", marginLeft: 6 }}>{acc ? "✓" : "✗"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* EXPLAIN TAB */}
          {activeTab === "explain" && (
            <div style={{ animation: "fadeIn 0.25s ease" }}>
              <div style={{ padding: "14px 16px", borderRadius: 10, background: preset.isRegular ? "rgba(45,212,191,0.06)" : "rgba(249,115,22,0.06)", border: `1px solid ${preset.isRegular ? "rgba(45,212,191,0.2)" : "rgba(249,115,22,0.2)"}`, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: preset.isRegular ? "#2dd4bf" : "#f97316", marginBottom: 8 }}>
                  {preset.isRegular
                    ? (isRegular ? "This language IS regular — pumping lemma is satisfied." : "This language IS context-free — pumping lemma is satisfied.")
                    : (isRegular ? "This language is NOT regular — pumping lemma gives a contradiction." : "This language is NOT context-free — pumping lemma gives a contradiction.")}
                </div>
                <div style={{ fontSize: 13, color: "var(--t6)", lineHeight: 1.75 }}>{preset.explanation}</div>
              </div>

              <div style={{ padding: "12px 16px", background: "var(--b2)", borderRadius: 9, marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>Proof Strategy</div>
                {preset.isRegular ? (
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--t55)", lineHeight: 1.8 }}>
                    <li>Assume the language IS {isRegular ? "regular" : "context-free"} with pumping length p.</li>
                    <li>Show that for ANY valid decomposition, pumping always stays in the language.</li>
                    <li>Conclude the pumping lemma is satisfied — consistent with {isRegular ? "regularity" : "being CFL"}.</li>
                  </ol>
                ) : (
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--t55)", lineHeight: 1.8 }}>
                    <li>Assume (for contradiction) the language IS {isRegular ? "regular" : "context-free"} with pumping length p.</li>
                    <li>Pick a specific string w in the language with |w| ≥ p.</li>
                    <li>Show that for EVERY valid decomposition, some pump value i produces a string outside the language.</li>
                    <li>This contradicts the pumping lemma — so the language is NOT {isRegular ? "regular" : "context-free"}.</li>
                  </ol>
                )}
              </div>

              <div style={{ padding: "10px 14px", background: col.bg, border: `1px solid ${col.border}`, borderRadius: 8, fontSize: 12, color: "var(--t45)", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.65 }}>
                Note: The pumping lemma gives a NECESSARY condition for {isRegular ? "regularity" : "being CFL"}, not sufficient. A language can satisfy the pumping lemma and still not be {isRegular ? "regular" : "context-free"}. Failure to pump, however, is DEFINITIVE proof the language is not {isRegular ? "regular" : "context-free"}.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   NESTED CITIES SUBSET EXPLAINER
   ═══════════════════════════════════════════════════ */
const CITIES = [
  { label: "Universe", type: "Type 0 — Recursively Enumerable", color: "#f97316", tagline: "No rules. Anything goes.", plain: "Imagine the entire universe — infinite space, no limits. A Turing Machine can wander forever with no memory cap. This class contains every possible language, including ones that may never terminate.", contains: "Contains everything below it." },
  { label: "Country", type: "Type 1 — Context-Sensitive", color: "#f472b6", tagline: "Bounded land. Clear borders.", plain: "Zoom into a country. It has borders — you can only use the land you were given (the input tape). Context matters here: grammar rules change depending on what symbols surround you.", contains: "Every city (CFL) is inside a country." },
  { label: "City", type: "Type 2 — Context-Free", color: "#818cf8", tagline: "Stack of buildings. Nested structure.", plain: "A city has skyscrapers — floors nested inside floors. A PDA's stack is like an elevator tracking which floor you're on. Perfect for matching pairs and nested brackets in code.", contains: "Every village (Regular) is inside a city." },
  { label: "Village", type: "Type 3 — Regular", color: "#2dd4bf", tagline: "Simple. No memory needed.", plain: "A tiny village where everyone knows each other — no directory needed. You just walk from house to house (state to state). Simple patterns only, no counting, no nesting.", contains: "The smallest, simplest class." },
];

function SubsetStory() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  return (
    <div style={{ marginBottom: 24 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", padding: "11px 16px", background: open ? "rgba(129,140,248,0.10)" : "var(--t03)", border: `1px solid ${open ? "rgba(129,140,248,0.35)" : "var(--t08)"}`, borderRadius: 10, color: open ? "#818cf8" : "var(--t45)", fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
        <span>Why are they nested? — Plain English explanation</span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{open ? "▲ hide" : "▼ show"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: 20, background: "var(--panel-bg)", border: "1px solid var(--t07)", borderRadius: 12, animation: "fadeIn 0.3s ease" }}>
          <p style={{ fontSize: 13, color: "var(--t5)", margin: "0 0 18px", lineHeight: 1.6 }}>
            Think of the four types as <span style={{ color: "var(--t)" }}>nested places</span> — a village inside a city, inside a country, inside the universe. Every language in the village <em>also</em> lives in the city, the country, and the universe. But not everything in the universe fits in a village.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {CITIES.map((c, i) => {
              const isActive = active === i;
              return (
                <div key={i} onClick={() => setActive(isActive ? null : i)} style={{ padding: "12px 16px", background: isActive ? `${c.color}12` : "var(--t02)", border: `1px solid ${isActive ? c.color + "55" : "var(--t06)"}`, borderRadius: 9, cursor: "pointer", transition: "all 0.2s", marginLeft: i * 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, color: c.color, fontSize: 14 }}>{c.label}</span>
                        <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "'IBM Plex Mono', monospace" }}>{c.type}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--t4)", marginTop: 2 }}>{c.tagline}</div>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--t2)" }}>{isActive ? "▲" : "▼"}</span>
                  </div>
                  {isActive && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--t06)", animation: "fadeIn 0.2s ease" }}>
                      <p style={{ fontSize: 13, color: "var(--t6)", margin: "0 0 8px", lineHeight: 1.6 }}>{c.plain}</p>
                      <div style={{ fontSize: 12, color: c.color, fontStyle: "italic" }}>↳ {c.contains}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)" }}>
            <div style={{ fontSize: 11, color: "#818cf8", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4, letterSpacing: "0.08em" }}>KEY TAKEAWAY</div>
            <div style={{ fontSize: 13, color: "var(--t55)", lineHeight: 1.6 }}>
              Regular ⊂ Context-Free ⊂ Context-Sensitive ⊂ Recursively Enumerable<br />
              <span style={{ color: "var(--t35)", fontSize: 12 }}>Every simpler class is fully contained inside the more powerful ones above it.</span>
            </div>
          </div>
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
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", padding: "10px 14px", background: open ? `${level.bg}` : "var(--b2)", border: `1px solid ${open ? level.border : "var(--t06)"}`, borderRadius: 8, color: open ? level.color : "var(--t4)", fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
        <span>Real-World Applications</span>
        <span style={{ fontSize: 10 }}>{open ? "▲ hide" : "▼ show"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn 0.3s ease" }}>
          {level.realWorld.map((item, i) => (
            <div key={i} style={{ padding: "12px 14px", background: "var(--b2)", border: `1px solid var(--t05)`, borderLeft: `3px solid ${level.color}`, borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: level.color, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "var(--t5)", lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   VENN DIAGRAM (SVG)
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
        <filter id="glow"><feGaussianBlur stdDeviation="6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        {rings.map(r => {
          const sx = r.cx - r.rx, sy = r.cy, ex = r.cx + r.rx;
          return (<path key={`path${r.type}`} id={`arc${r.type}`} d={`M ${sx},${sy} A ${r.rx},${r.ry} 0 0,1 ${ex},${sy}`} fill="none" stroke="none" />);
        })}
      </defs>
      {rings.map((r, i) => {
        const isActive = activeLevel === r.type;
        const labelText = `${LEVELS[i].short}: ${LEVELS[i].grammar.split('(')[0].trim()}`;
        return (
          <g key={r.type} onClick={() => onSelect(r.type)} style={{ cursor: "pointer" }}>
            {isActive && (<ellipse cx={r.cx} cy={r.cy} rx={r.rx + 4} ry={r.ry + 4} fill="none" stroke={r.color} strokeWidth="3" opacity="0.3" filter="url(#glow)"><animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" /></ellipse>)}
            <ellipse cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} fill={`url(#grad${r.type})`} stroke={r.color} strokeWidth={isActive ? 2.5 : 1.2} strokeOpacity={isActive ? 1 : 0.5} style={{ transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
            {pulse === r.type && (<ellipse cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} fill="none" stroke={r.color} strokeWidth="3"><animate attributeName="rx" from={r.rx} to={r.rx + 30} dur="0.8s" fill="freeze" /><animate attributeName="ry" from={r.ry} to={r.ry + 22} dur="0.8s" fill="freeze" /><animate attributeName="opacity" from="0.8" to="0" dur="0.8s" fill="freeze" /></ellipse>)}
            <text fill={r.color} fontSize={i === 0 ? 12 : 11} fontWeight="600" fontFamily="'IBM Plex Mono', monospace" opacity={isActive ? 1 : 0.7} style={{ transition: "opacity 0.3s" }}>
              <textPath href={`#arc${r.type}`} startOffset="50%" textAnchor="middle">{labelText}</textPath>
            </text>
          </g>
        );
      })}
      <text x="300" y="245" textAnchor="middle" fill="var(--t25)" fontSize="9" fontFamily="'IBM Plex Mono', monospace">Regular ⊂ Context-Free ⊂ Context-Sensitive ⊂ RE</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   CLASSIFY TAB
   ═══════════════════════════════════════════════════ */
const CLASSIFY_LANGUAGES = [
  { name: "a*b*",                 type: 3, desc: "Zero or more a's followed by zero or more b's",  test: s => /^a*b*$/.test(s) },
  { name: "(ab)*",                type: 3, desc: "Repetitions of 'ab'",                             test: s => /^(ab)*$/.test(s) },
  { name: "Strings ending in 'ab'", type: 3, desc: "Any string over {a,b} ending with ab",        test: s => /^[ab]*ab$/.test(s) },
  { name: "[a-z]+ identifiers",   type: 3, desc: "One or more lowercase letters",                  test: s => /^[a-z]+$/.test(s) },
  { name: "Binary strings (0|1)*",type: 3, desc: "Any string over {0,1}",                          test: s => /^[01]*$/.test(s) },
  { name: "Even number of a's",   type: 3, desc: "Strings over {a,b} with even count of a's",     test: s => /^[ab]*$/.test(s) && (s.split('').filter(c=>c==='a').length % 2 === 0) },
  { name: "aⁿbⁿ  (n≥0)",         type: 2, desc: "Equal number of a's then b's",                   test: s => { if(!s)return true; const m=s.match(/^(a+)(b+)$/); return m?m[1].length===m[2].length:false; }},
  { name: "Balanced parentheses", type: 2, desc: "Properly nested ( and )",                        test: s => { let d=0; for(const c of s){if(c==='(')d++;else if(c===')')d--;if(d<0)return false;if(c!=='('&&c!==')')return false;} return d===0; }},
  { name: "Palindromes {a,b}",    type: 2, desc: "Strings equal to their reverse",                 test: s => /^[ab]*$/.test(s) && s===s.split('').reverse().join('') },
  { name: "wwᴿ even palindromes", type: 2, desc: "Even-length palindromes over {a,b}",             test: s => s.length%2===0 && /^[ab]*$/.test(s) && s===s.split('').reverse().join('') },
  { name: "aⁿb²ⁿ  (n≥0)",        type: 2, desc: "Twice as many b's as a's",                      test: s => { if(!s)return true; const m=s.match(/^(a+)(b+)$/); return m?m[2].length===2*m[1].length:false; }},
  { name: "aⁿbⁿcⁿ  (n≥0)",       type: 1, desc: "Equal a's, b's, and c's in order",              test: s => { if(!s)return true; const m=s.match(/^(a+)(b+)(c+)$/); return m?m[1].length===m[2].length&&m[2].length===m[3].length:false; }},
  { name: "ww  (string doubled)", type: 1, desc: "A string concatenated with itself",              test: s => s.length%2===0 && s.slice(0,s.length/2)===s.slice(s.length/2) },
  { name: "aⁿ²  (perfect square)",type: 1, desc: "Number of a's is a perfect square",             test: s => /^a*$/.test(s) && Number.isInteger(Math.sqrt(s.length)) },
];

const SUP_MAP = { "⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","ⁿ":"n","ⁱ":"i","ʲ":"j","ᵏ":"k","ᵐ":"m" };

function normaliseExponents(raw) {
  let s = "";
  for (const ch of raw.toLowerCase().replace(/\s/g, "")) {
    if (SUP_MAP[ch]) s += "^" + SUP_MAP[ch] + "|";
    else s += ch;
  }
  s = s.replace(/([a-z])\^([a-z])(?!\|)/g, "$1^$2|");
  return s;
}

function countConstrainedLetters(input) {
  const s = normaliseExponents(input);
  const lettersByVar = {};
  const re = /([a-z])\^([a-z])\|/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const [, letter, expVar] = m;
    if (!lettersByVar[expVar]) lettersByVar[expVar] = new Set();
    lettersByVar[expVar].add(letter);
  }
  const constrained = new Set();
  for (const letters of Object.values(lettersByVar)) {
    if (letters.size >= 2) for (const l of letters) constrained.add(l);
  }
  return { count: constrained.size, letters: [...constrained], varMap: Object.fromEntries(Object.entries(lettersByVar).map(([k, v]) => [k, [...v]])) };
}

function classifyLanguage(input) {
  if (!input || !input.trim()) return { type: null, reason: "Please enter a language description." };
  const raw = input.toLowerCase().replace(/\s+/g, " ").trim();
  const ns = raw.replace(/\s/g, "");

  for (const [pat, why] of [
    [/halt(ing)?(\s*problem)?/, "involves the Halting Problem — undecidable and recursively enumerable (Type 0 / RE)."],
    [/turing\s*machine|turing[-\s]complete/, "involves Turing machine computation — Type 0 (RE)."],
    [/undecidable|unrecogniz|non-recogniz/, "describes an undecidable/unrecognizable language — Type 0 (RE)."],
    [/recursively\s*enumerable|re[-\s]complete/, "is explicitly recursively enumerable — Type 0."],
    [/post\s*correspondence/, "is the Post Correspondence Problem — undecidable, Type 0 (RE)."],
    [/diophantine\s*equation/, "involves Diophantine equations — Type 0 (RE)."],
    [/provable\s*theorem/, "the set of provable theorems is recursively enumerable — Type 0."],
    [/complement\s*of\s*(the\s*)?halting/, "is the complement of the Halting Problem — Type 0 (RE)."],
  ]) { if (pat.test(raw)) return { type: 0, reason: `This language ${why}` }; }

  for (const [pat, reason] of [
    [/a\^?n\s*b\^?n\s*c\^?n/, "aⁿbⁿcⁿ has three independently equal symbol counts — requires a Linear Bounded Automaton. This is context-sensitive (Type 1)."],
    [/a\^?n\s*b\^?m\s*c\^?n\s*d\^?m/, "aⁿbᵐcⁿdᵐ has two cross-equality constraints — context-sensitive (Type 1)."],
    [/\bww\b(?!\s*[\^r])/, "the copy language ww (a string concatenated with itself) cannot be recognised by a PDA — it needs linear bounded memory. This is context-sensitive (Type 1)."],
    [/(string|word)\s*(doubled|repeated\s*twice|concatenated\s*with\s*itself)/, "repeating/doubling a string requires context-sensitive power (Type 1)."],
    [/perfect\s*square/, "a perfect-square count of symbols requires context-sensitive rules (Type 1)."],
    [/a\^?\{?n\^?2\}?|a\^?n²/, "a perfect-square number of a's — context-sensitive (Type 1)."],
    [/cross[-\s]serial/, "cross-serial dependencies require context-sensitive grammars (Type 1)."],
    [/swiss[-\s]german/, "Swiss-German verb dependencies are the canonical context-sensitive NL construct (Type 1)."],
    [/linear\s*bounded\s*automaton|lba\b/, "explicitly involves a Linear Bounded Automaton — Type 1 (CSL)."],
    [/i\s*[<≤]\s*j\s*[<≤]\s*k/, "a multi-variable ordering over three symbol groups — context-sensitive (Type 1)."],
    [/valid\s*(chess|go|shogi)\s*position/, "valid board-game positions require context-sensitive memory (Type 1)."],
  ]) { if (pat.test(ns) || pat.test(raw)) return { type: 1, reason }; }

  for (const [pat, reason] of [
    [/balanced\s*(paren|bracket|brace|curly|square)/, "balanced/nested brackets need a pushdown automaton — context-free (Type 2)."],
    [/matched\s*(paren|bracket)/, "matched brackets are the canonical context-free language (Type 2)."],
    [/nested\s*(paren|bracket|tag|element|struct|call|function)/, "nested recursive structures require a PDA stack — context-free (Type 2)."],
    [/\bpalindrome/, "palindromes require a PDA to mirror the string — context-free (Type 2)."],
    [/\bww\s*\^?\s*r\b|ww\^r|w.*reverse/, "wwᴿ (even palindromes) is context-free — recognised by a PDA (Type 2)."],
    [/context[-\s]free|cfg\b|push[-\s]?down|pda\b/, "explicitly context-free — Type 2 (CFL)."],
    [/a\^?n\s*b\^?2n|a\^?n\s*b\^?\{2n\}/, "aⁿb²ⁿ matches one count against twice another — context-free (Type 2)."],
    [/a\^?n\s*b\^?n(?!\s*c)/, "aⁿbⁿ is the canonical context-free language — recognised by a PDA (Type 2)."],
    [/arithmetic\s*expression|operator\s*precedence/, "arithmetic expressions with precedence are context-free (Type 2)."],
    [/(programming\s*language|source\s*code)\s*syntax/, "programming language syntax is defined by CFGs — Type 2."],
    [/xml|html|json\s*struct(ure)?|nested\s*markup/, "nested markup/JSON structures are context-free (Type 2)."],
  ]) { if (pat.test(ns) || pat.test(raw)) return { type: 2, reason }; }

  for (const [pat, reason] of [
    [/\bdfa\b|\bnfa\b|finite\s*automaton|finite\s*state\s*machine/, "involves a finite automaton — Type 3 (Regular)."],
    [/\bregex\b|regular\s*expression/, "described by a regular expression — Type 3 (REG)."],
    [/\bregular\b(?!\s*(grammar|language)\s*that\s*is\s*not)/, "explicitly regular — Type 3 (REG)."],
    [/ends?\s*with|starts?\s*with/, "prefix/suffix patterns are recognised by a DFA — Type 3 (Regular)."],
    [/email\s*format|phone\s*(number\s*)?format|zip\s*code/, "format-validation patterns are regular — Type 3."],
    [/even\s*(number\s*of|count\s*of)\s*[ab]|odd\s*(number\s*of|count\s*of)\s*[ab]/, "parity constraints on a fixed alphabet are regular — Type 3."],
    [/binary\s*string|strings?\s*over\s*\{?0,1\}?/, "binary strings are regular — Type 3."],
    [/kleene\s*star|kleene\s*closure/, "Kleene star is the core regular operator — Type 3."],
    [/strings?\s*with\s*(no|without)\s*(consecutive|adjacent)/, "simple avoidance patterns are regular — Type 3."],
  ]) { if (pat.test(ns) || pat.test(raw)) return { type: 3, reason }; }

  if (/^[a-z0-9()|.*+?^${}[\]\\]+$/.test(ns) && /[*+?|]/.test(ns) && !/\^[a-z]/.test(ns)) {
    return { type: 3, reason: "This looks like a regular expression — Type 3 (Regular)." };
  }

  const { count, letters, varMap } = countConstrainedLetters(raw);
  if (count >= 3) {
    const groups = Object.entries(varMap).filter(([, ls]) => ls.length >= 2).map(([v, ls]) => `${ls.join(", ")} all raised to ^${v}`).join("; ");
    return { type: 1, reason: `Three or more distinct letters (${letters.join(", ")}) share linked exponent constraints (${groups}). Matching three or more equal counts simultaneously requires a Linear Bounded Automaton — context-sensitive (Type 1).` };
  }
  if (count === 2) {
    const groups = Object.entries(varMap).filter(([, ls]) => ls.length >= 2).map(([v, ls]) => `${ls.join(" and ")} both raised to ^${v}`).join("; ");
    return { type: 2, reason: `Two distinct letters (${letters.join(", ")}) share an exponent constraint (${groups}). Matching two equal counts requires a stack (PDA) — context-free (Type 2).` };
  }
  if (count === 1) return { type: 3, reason: `Only one symbol (${letters[0]}) carries a parameterised exponent with no equality constraint to another symbol. Single-symbol parameterised languages (like a*) are regular — Type 3.` };
  if (/\*|\+|kleene|star\b|repetition/.test(raw)) return { type: 3, reason: "Contains Kleene star/plus or repetition operators — regular language pattern (Type 3)." };
  if (/\bstack\b|recursiv(e|ion)|nested/.test(raw)) return { type: 2, reason: "References stacks or recursive nesting — context-free languages (Type 2) are the natural class." };
  if (/rewrite|bounded\s*memory|linear\s*memory|in-place/.test(raw)) return { type: 1, reason: "References bounded memory or in-place rewriting — context-sensitive (Type 1)." };
  return { type: null, reason: `Could not confidently classify "${input}". Try using exponent notation (e.g. aⁿbⁿcⁿ) or describing the counting constraint more explicitly.` };
}

const CLASSIFY_KEYBOARD_ROWS = [
  { label: "letters", keys: ["a", "b", "c", "d", "n", "m", "0", "1", "(", ")"] },
  { label: "logic",   keys: ["ε", "→", "Σ", "∪", "∩", "∅", "*", "+", "|", "λ"] },
  { label: "sets",    keys: ["⊂", "⊃", "∈", "∉", "≤", "≥", "≠", "∀", "∃", "^"] },
  { label: "super",   keys: ["⁰", "¹", "²", "³", "⁴", "⁵", "ⁿ", "ⁱ", "ʲ", "ᵏ"] },
  { label: "sub",     keys: ["₀", "₁", "₂", "₃", "ₙ", "ₘ", "ₐ", "ᵃ", "ᵇ", "ᶜ"] },
];

function ClassifySymbolKeyboard({ targetRef, accentColor }) {
  const [show, setShow] = useState(false);
  const color = accentColor || "#818cf8";
  const insert = useCallback((sym) => {
    const ta = targetRef.current; if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    ta.value = ta.value.substring(0, start) + sym + ta.value.substring(end);
    ta.selectionStart = ta.selectionEnd = start + sym.length;
    ta.focus(); ta.dispatchEvent(new Event("input", { bubbles: true }));
  }, [targetRef]);
  return (
    <div style={{ marginTop: 6 }}>
      <button onClick={() => setShow(!show)} style={{ background: show ? `${color}20` : "var(--t04)", border: `1px solid ${show ? color + "50" : "var(--t08)"}`, borderRadius: 6, padding: "5px 14px", color: show ? color : "var(--t5)", fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s" }}>
        {show ? "▾ Hide Keyboard" : "▸ Symbol Keyboard"}
      </button>
      {show && (
        <div style={{ marginTop: 8, padding: 10, background: "var(--b3)", border: "1px solid var(--t08)", borderRadius: 8, animation: "fadeIn 0.2s ease" }}>
          {CLASSIFY_KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 4, marginBottom: ri < CLASSIFY_KEYBOARD_ROWS.length - 1 ? 4 : 0, alignItems: "center" }}>
              <span style={{ width: 40, fontSize: 9, color: "var(--t2)", fontFamily: "'IBM Plex Mono', monospace", textAlign: "right", flexShrink: 0 }}>{row.label}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {row.keys.map(sym => (
                  <button key={sym} onClick={() => insert(sym)} style={{ width: 34, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: ri >= 3 ? `${color}10` : "var(--t05)", border: `1px solid ${ri >= 3 ? color + "30" : "var(--t1)"}`, borderRadius: 5, color: ri >= 3 ? color : "var(--t)", fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.15s" }}>{sym}</button>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {["Space", "Back", "Clear"].map(label => (
              <button key={label} onClick={() => {
                const ta = targetRef.current; if (!ta) return;
                if (label === "Space") insert(" ");
                else if (label === "Back") { const s = ta.selectionStart; if (s > 0) { ta.value = ta.value.slice(0, s-1) + ta.value.slice(s); ta.selectionStart = ta.selectionEnd = s-1; ta.focus(); ta.dispatchEvent(new Event("input",{bubbles:true})); } }
                else { ta.value = ""; ta.focus(); ta.dispatchEvent(new Event("input",{bubbles:true})); }
              }} style={{ padding: "5px 14px", background: "var(--t04)", border: "1px solid var(--t08)", borderRadius: 5, color: "var(--t6)", fontSize: 11, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>{label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const QUICK_EXAMPLES = [
  { label: "aⁿbⁿcⁿ", type: 1 }, { label: "ww", type: 1 }, { label: "perfect square a's", type: 1 },
  { label: "aⁿbⁿcⁿdⁿ", type: 1 }, { label: "aⁿbⁿ", type: 2 }, { label: "palindrome", type: 2 },
  { label: "balanced parens", type: 2 }, { label: "aⁿb²ⁿ", type: 2 },
  { label: "a*b*", type: 3 }, { label: "(ab)*", type: 3 }, { label: "even number of a's", type: 3 }, { label: "halting problem", type: 0 },
];

function ClassifyTab({ onClassify }) {
  const [mode, setMode] = useState("custom");
  const [customInput, setCustomInput] = useState("");
  const [result, setResult] = useState(null);
  const [resultKey, setResultKey] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [testString, setTestString] = useState("");
  const [presetResult, setPresetResult] = useState(null);
  const customRef = useRef(null);
  const testRef = useRef(null);
  const lvOf = (type) => LEVELS.find(l => l.type === type);

  const handleClassify = () => {
    if (!customInput.trim()) return;
    setResult(null); setResultKey(k => k + 1);
    setTimeout(() => { const r = classifyLanguage(customInput); setResult(r); if (r.type != null && onClassify) onClassify(r.type); }, 80);
  };
  const handleQuick = (label) => {
    setCustomInput(label); if (customRef.current) customRef.current.value = label;
    setResult(null); setResultKey(k => k + 1);
    setTimeout(() => { const r = classifyLanguage(label); setResult(r); if (r.type != null && onClassify) onClassify(r.type); }, 80);
  };
  const handlePresetTest = () => {
    const lang = CLASSIFY_LANGUAGES[selectedPreset];
    const accepted = lang.test(testString);
    setPresetResult({ accepted, langName: lang.name, type: lang.type });
    if (onClassify) onClassify(lang.type);
  };

  const currentLv = result?.type != null ? lvOf(result.type) : null;
  const presetLv = presetResult ? lvOf(presetResult.type) : null;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} .cl-input{outline:none;} .cl-input::placeholder{color:var(--t25);} .cl-chip:hover{transform:translateY(-1px);filter:brightness(1.2);} .cl-act:hover{filter:brightness(1.1);transform:translateY(-1px);}`}</style>
      <div style={{ display:"flex", gap:4, marginBottom:22, background:"var(--b3)", borderRadius:10, padding:4, border:"1px solid var(--t06)" }}>
        {[["custom","Classify a Language","#818cf8"],["preset","Test Membership","#2dd4bf"]].map(([id,label,col])=>(
          <button key={id} onClick={()=>{setMode(id);setResult(null);setPresetResult(null);setTestString("");}} style={{ flex:1, padding:"10px 16px", border:"none", borderRadius:7, background:mode===id?`${col}20`:"transparent", color:mode===id?col:"var(--t35)", fontSize:13, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", fontWeight:mode===id?600:400, transition:"all 0.2s" }}>{label}</button>
        ))}
      </div>

      {mode === "custom" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div>
            <div style={{ fontSize:10, color:"var(--t25)", fontFamily:"'IBM Plex Mono',monospace", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8 }}>Quick examples — click to classify</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {QUICK_EXAMPLES.map(({label,type})=>{
                const lv = lvOf(type);
                return (<button key={label} className="cl-chip" onClick={()=>handleQuick(label)} style={{ padding:"4px 12px", background:`${lv.color}10`, border:`1px solid ${lv.color}35`, borderRadius:20, color:lv.color, fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.14s" }}>{label}</button>);
              })}
            </div>
          </div>
          <div style={{ background:"var(--panel-bg)", border:"1px solid var(--t08)", borderRadius:12, padding:20, backdropFilter:"blur(20px)" }}>
            <label style={{ display:"block", fontSize:11, color:"var(--t4)", marginBottom:8, fontFamily:"'IBM Plex Mono',monospace", textTransform:"uppercase", letterSpacing:".1em" }}>Describe the language</label>
            <input ref={customRef} className="cl-input" type="text" defaultValue={customInput} onInput={e=>{setCustomInput(e.target.value);setResult(null);}} onKeyDown={e=>{if(e.key==="Enter")handleClassify();}} placeholder="e.g. aⁿbⁿcⁿ  or  balanced parentheses  or  ww  …" style={{ width:"100%", padding:"12px 14px", background:"var(--b4)", border:"1px solid var(--t12)", borderRadius:8, color:"var(--t)", fontSize:15, fontFamily:"'IBM Plex Mono',monospace" }} />
            <ClassifySymbolKeyboard targetRef={customRef} accentColor="#818cf8" />
            <div style={{ fontSize:11, color:"var(--t25)", marginTop:10, fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.65 }}>
              Tip: use superscript notation — <span style={{color:"#f472b6"}}>aⁿbⁿcⁿ</span> → Type 1 · <span style={{color:"#818cf8"}}>aⁿbⁿ</span> → Type 2 · <span style={{color:"#2dd4bf"}}>a*b*</span> → Type 3
            </div>
            <button className="cl-act" onClick={handleClassify} disabled={!customInput.trim()} style={{ marginTop:14, width:"100%", padding:"13px", background:customInput.trim()?"rgba(129,140,248,0.18)":"var(--t03)", border:`1px solid ${customInput.trim()?"rgba(129,140,248,0.4)":"var(--t06)"}`, borderRadius:9, color:customInput.trim()?"#818cf8":"var(--t25)", fontSize:14, fontWeight:600, cursor:customInput.trim()?"pointer":"default", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s", letterSpacing:".04em" }}>Classify Language</button>
          </div>
          {result && (
            <div key={resultKey} style={{ animation:"slideIn 0.35s ease" }}>
              {result.type === null ? (
                <div style={{ padding:18, borderRadius:12, background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.25)" }}>
                  <div style={{ fontSize:14, color:"#fbbf24", fontFamily:"'IBM Plex Mono',monospace", marginBottom:6 }}>Unclear Description</div>
                  <div style={{ fontSize:13, color:"var(--t55)", lineHeight:1.7 }}>{result.reason}</div>
                </div>
              ) : (
                <div style={{ padding:22, borderRadius:12, background:currentLv.bg, border:`1px solid ${currentLv.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
                    <div style={{ fontSize:24, fontWeight:700, color:currentLv.color, fontFamily:"'IBM Plex Mono',monospace" }}>{currentLv.short}</div>
                    <div style={{ fontSize:13, color:currentLv.color, opacity:0.9, fontFamily:"'IBM Plex Mono',monospace" }}>{currentLv.name}</div>
                    <div style={{ marginLeft:"auto", padding:"4px 12px", borderRadius:20, background:`${currentLv.color}15`, border:`1px solid ${currentLv.color}40`, fontSize:11, color:currentLv.color, fontFamily:"'IBM Plex Mono',monospace" }}>{currentLv.automaton}</div>
                  </div>
                  <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:16, flexWrap:"wrap" }}>
                    {[...LEVELS].reverse().map((l,i)=>{
                      const isThis = l.type === result.type; const isInside = l.type <= result.type;
                      return (
                        <div key={l.type} style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <div style={{ padding:"4px 10px", borderRadius:6, fontSize:11, fontFamily:"'IBM Plex Mono',monospace", background:isThis?`${l.color}22`:isInside?`${l.color}09`:"var(--t03)", border:`1px solid ${isThis?l.color+"75":isInside?l.color+"28":"var(--t06)"}`, color:isThis?l.color:isInside?l.color+"88":"var(--t2)", fontWeight:isThis?700:400, boxShadow:isThis?`0 0 14px ${l.color}22`:"none", transition:"all 0.2s" }}>{l.short}</div>
                          {i<3 && <span style={{ color:"var(--t2)", fontSize:10 }}>⊃</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding:"13px 14px", borderRadius:9, background:"var(--b25)", marginBottom:12 }}>
                    <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"'IBM Plex Mono',monospace", textTransform:"uppercase", letterSpacing:".1em", marginBottom:5 }}>Classification Reasoning</div>
                    <div style={{ fontSize:13, color:"var(--t65)", lineHeight:1.75 }}>{result.reason}</div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                    <div style={{ padding:"10px 12px", background:"var(--b2)", borderRadius:8 }}>
                      <div style={{ fontSize:9, color:"var(--t3)", fontFamily:"'IBM Plex Mono',monospace", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Grammar Type</div>
                      <div style={{ fontSize:12, color:currentLv.color }}>{currentLv.grammar}</div>
                    </div>
                    <div style={{ padding:"10px 12px", background:"var(--b2)", borderRadius:8 }}>
                      <div style={{ fontSize:9, color:"var(--t3)", fontFamily:"'IBM Plex Mono',monospace", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Recogniser</div>
                      <div style={{ fontSize:12, color:currentLv.color }}>{currentLv.automaton}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.6 }}>
                    ↳ {result.type===3?"Every regular language is also CFL, CSL, and RE — REG ⊂ CFL ⊂ CSL ⊂ RE.":result.type===2?"Every CFL is also CSL and RE, but not all CFLs are regular — CFL ⊂ CSL ⊂ RE.":result.type===1?"Every CSL is also in RE, but not all CSLs are context-free — CSL ⊂ RE.":"RE is the most general class — it contains all other classes."}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "preset" && (
        <div style={{ background:"var(--panel-bg)", border:"1px solid var(--t08)", borderRadius:12, padding:24, backdropFilter:"blur(20px)" }}>
          <label style={{ display:"block", fontSize:11, color:"var(--t4)", marginBottom:8, fontFamily:"'IBM Plex Mono',monospace", textTransform:"uppercase", letterSpacing:".1em" }}>Select Language</label>
          <select value={selectedPreset} onChange={e=>{setSelectedPreset(+e.target.value);setPresetResult(null);setTestString("");}} style={{ width:"100%", padding:"11px 12px", background:"var(--b4)", border:"1px solid var(--t12)", borderRadius:8, color:"var(--t)", fontSize:13, fontFamily:"'IBM Plex Mono',monospace", marginBottom:8, outline:"none", cursor:"pointer" }}>
            {CLASSIFY_LANGUAGES.map((l,i)=>{ const lv = lvOf(l.type); return <option key={i} value={i} style={{background:"var(--select-bg)"}}>{l.name}  [{lv?.short}]</option>; })}
          </select>
          {(()=>{ const lang = CLASSIFY_LANGUAGES[selectedPreset]; const lv = lvOf(lang.type); return (<div style={{ padding:"10px 14px", marginBottom:16, background:`${lv.color}0d`, border:`1px solid ${lv.color}30`, borderRadius:8 }}><span style={{ fontSize:12, color:lv.color, fontFamily:"'IBM Plex Mono',monospace" }}>{lv.short} — {lv.name}</span><div style={{ fontSize:12, color:"var(--t45)", marginTop:3 }}>{lang.desc}</div></div>); })()}
          <label style={{ display:"block", fontSize:11, color:"var(--t4)", marginBottom:8, fontFamily:"'IBM Plex Mono',monospace", textTransform:"uppercase", letterSpacing:".1em" }}>Test String</label>
          <input ref={testRef} className="cl-input" type="text" value={testString} onChange={e=>{setTestString(e.target.value);setPresetResult(null);}} onKeyDown={e=>{if(e.key==="Enter")handlePresetTest();}} placeholder="Type a string to test membership…" style={{ width:"100%", padding:"11px 12px", background:"var(--b4)", border:"1px solid var(--t12)", borderRadius:8, color:"var(--t)", fontSize:14, fontFamily:"'IBM Plex Mono',monospace" }} />
          <ClassifySymbolKeyboard targetRef={testRef} accentColor="#2dd4bf" />
          <button className="cl-act" onClick={handlePresetTest} style={{ marginTop:14, width:"100%", padding:"12px", background:"rgba(45,212,191,0.14)", border:"1px solid rgba(45,212,191,0.35)", borderRadius:9, color:"#2dd4bf", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s" }}>Test Membership</button>
          {presetResult && (
            <div style={{ marginTop:14, padding:16, borderRadius:10, animation:"slideIn 0.3s ease", background:presetResult.accepted?"rgba(45,212,191,0.08)":"rgba(249,115,22,0.08)", border:`1px solid ${presetResult.accepted?"rgba(45,212,191,0.35)":"rgba(249,115,22,0.35)"}` }}>
              <div style={{ fontSize:17, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace", marginBottom:8, color:presetResult.accepted?"#2dd4bf":"#f97316" }}>{presetResult.accepted ? "ACCEPTED" : "REJECTED"}</div>
              <div style={{ fontSize:13, color:"var(--t55)", lineHeight:1.65 }}>
                The string <code style={{ color:"var(--t)", background:"var(--t07)", padding:"1px 7px", borderRadius:4, fontFamily:"'IBM Plex Mono',monospace" }}>"{testString}"</code> is {presetResult.accepted?"a member of":"not in"} the language <span style={{ color:presetLv?.color, fontFamily:"'IBM Plex Mono',monospace" }}>{presetResult.langName}</span>, which belongs to <span style={{ color:presetLv?.color, fontWeight:600 }}>{presetLv?.short} — {presetLv?.name}</span>.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   QUIZ
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
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--t)", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>{score} / {QUIZ_QUESTIONS.length}</div>
      <div style={{ color: "var(--t5)", fontSize: 13, margin: "8px 0 20px" }}>{score >= 5 ? "Excellent — you know your hierarchy!" : score >= 3 ? "Good effort — review the tricky ones!" : "Keep studying — you'll get there!"}</div>
      <button onClick={restart} style={{ padding: "10px 28px", background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 8, color: "#818cf8", fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>Try Again</button>
    </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>Question {qi + 1} of {QUIZ_QUESTIONS.length} · Score: {score}</div>
      <div style={{ fontSize: 15, color: "var(--t)", marginBottom: 16, lineHeight: 1.5 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {q.opts.map((opt, i) => {
          let bg = "var(--t03)", bdr = "var(--t08)", col = "var(--t7)";
          if (selected !== null) {
            if (i === q.ans) { bg = "rgba(45,212,191,0.12)"; bdr = "rgba(45,212,191,0.4)"; col = "#2dd4bf"; }
            else if (i === selected) { bg = "rgba(249,115,22,0.12)"; bdr = "rgba(249,115,22,0.4)"; col = "#f97316"; }
          }
          return (<button key={i} onClick={() => pick(i)} style={{ padding: "10px 14px", background: bg, border: `1px solid ${bdr}`, borderRadius: 6, color: col, fontSize: 13, textAlign: "left", cursor: selected !== null ? "default" : "pointer", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s" }}>{opt}</button>);
        })}
      </div>
      {selected !== null && <div style={{ marginTop: 12, padding: 12, background: "var(--b3)", borderRadius: 8, fontSize: 12, color: "var(--t5)", lineHeight: 1.5, animation: "fadeIn 0.3s ease" }}>{q.why}</div>}
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
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";

  const handleClassify = (type) => { setActiveLevel(type); setPulse(type); setTimeout(() => setPulse(null), 900); };
  const level = activeLevel !== null ? LEVELS.find(l => l.type === activeLevel) : null;

  return (
    <div data-theme={theme} style={{ minHeight: "100vh", background: isDark ? "linear-gradient(160deg, #07070f 0%, #0d0d1a 40%, #0a0a14 100%)" : "linear-gradient(160deg, #f0f0f5 0%, #e8e8f0 40%, #f5f5fa 100%)", color: isDark ? "#e2e8f0" : "#1a1a2e", fontFamily: "'Outfit', sans-serif", padding: "0 0 60px", transition: "background 0.3s, color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@300;400;600;700&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        [data-theme="dark"] { --t:#e2e8f0;--t7:rgba(255,255,255,0.7);--t65:rgba(255,255,255,0.65);--t6:rgba(255,255,255,0.6);--t55:rgba(255,255,255,0.55);--t5:rgba(255,255,255,0.5);--t45:rgba(255,255,255,0.45);--t4:rgba(255,255,255,0.4);--t35:rgba(255,255,255,0.35);--t3:rgba(255,255,255,0.3);--t25:rgba(255,255,255,0.25);--t2:rgba(255,255,255,0.2);--t15:rgba(255,255,255,0.15);--t12:rgba(255,255,255,0.12);--t1:rgba(255,255,255,0.1);--t08:rgba(255,255,255,0.08);--t07:rgba(255,255,255,0.07);--t06:rgba(255,255,255,0.06);--t05:rgba(255,255,255,0.05);--t04:rgba(255,255,255,0.04);--t03:rgba(255,255,255,0.03);--t02:rgba(255,255,255,0.02);--b4:rgba(0,0,0,0.4);--b3:rgba(0,0,0,0.3);--b25:rgba(0,0,0,0.25);--b2:rgba(0,0,0,0.2);--panel-bg:rgba(15,15,25,0.7);--select-bg:#111; }
        [data-theme="light"] { --t:#1a1a2e;--t7:rgba(0,0,0,0.75);--t65:rgba(0,0,0,0.68);--t6:rgba(0,0,0,0.62);--t55:rgba(0,0,0,0.58);--t5:rgba(0,0,0,0.55);--t45:rgba(0,0,0,0.5);--t4:rgba(0,0,0,0.45);--t35:rgba(0,0,0,0.4);--t3:rgba(0,0,0,0.38);--t25:rgba(0,0,0,0.32);--t2:rgba(0,0,0,0.28);--t15:rgba(0,0,0,0.22);--t12:rgba(0,0,0,0.16);--t1:rgba(0,0,0,0.13);--t08:rgba(0,0,0,0.1);--t07:rgba(0,0,0,0.09);--t06:rgba(0,0,0,0.08);--t05:rgba(0,0,0,0.07);--t04:rgba(0,0,0,0.06);--t03:rgba(0,0,0,0.05);--t02:rgba(0,0,0,0.03);--b4:rgba(255,255,255,0.95);--b3:rgba(255,255,255,0.75);--b25:rgba(255,255,255,0.65);--b2:rgba(255,255,255,0.55);--panel-bg:rgba(255,255,255,0.85);--select-bg:#fff; }
        ::-webkit-scrollbar{width:5px;}
        [data-theme="dark"]::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px;}
        [data-theme="light"]::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:3px;}
        select option{background:var(--select-bg);color:var(--t);}
      `}</style>

      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999 }}>
        <button onClick={() => setTheme(isDark ? "light" : "dark")} style={{ width: 42, height: 42, borderRadius: "50%", border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: isDark ? "#e2e8f0" : "#1a1a2e", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", backdropFilter: "blur(10px)" }}>
          {isDark ? "L" : "D"}
        </button>
      </div>

      <div style={{ textAlign: "center", padding: "44px 20px 24px" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.35)", textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 10 }}>Formal Language Theory</div>
        <h1 style={{ fontSize: "clamp(22px, 4.5vw, 38px)", fontWeight: 700, margin: "0 0 6px", padding: "0 50px", fontFamily: "'IBM Plex Mono', monospace", background: "linear-gradient(135deg, #2dd4bf, #818cf8, #f472b6, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.3, overflow: "visible", wordBreak: "keep-all" }}>Chomsky Hierarchy</h1>
        <p style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.45)", maxWidth: 520, margin: "0 auto", fontSize: 13, lineHeight: 1.5 }}>Four nested levels of formal grammars, each with increasing generative power.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 28, padding: "0 20px", flexWrap: "wrap" }}>
        {[["explore","Explore"],["classify","Classify"],["pumping","Pumping Lemma"],["compare","Compare"],["quiz","Quiz"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)") : "transparent", border: `1px solid ${tab === id ? (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.18)") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)")}`, borderRadius: 8, padding: "9px 22px", color: tab === id ? (isDark ? "#e2e8f0" : "#1a1a2e") : (isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)"), fontSize: 13, fontWeight: tab === id ? 600 : 400, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s" }}>{label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 20px" }}>

        {/* EXPLORE */}
        {tab === "explore" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <SubsetStory />
            <VennDiagram activeLevel={activeLevel} onSelect={t => setActiveLevel(activeLevel === t ? null : t)} pulse={pulse} />
            {level && (
              <div key={level.type} style={{ marginTop: 24, padding: 24, background: "var(--panel-bg)", border: `1px solid ${level.border}`, borderRadius: 12, backdropFilter: "blur(20px)", animation: "fadeIn 0.4s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: level.color, fontFamily: "'IBM Plex Mono', monospace" }}>{level.name}</h3>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: level.bg, border: `1px solid ${level.border}`, color: level.color, fontFamily: "'IBM Plex Mono', monospace" }}>{level.automaton}</span>
                </div>
                <p style={{ marginTop: 12, fontSize: 14, color: "var(--t6)", lineHeight: 1.6 }}>{level.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                  <div style={{ padding: 12, background: "var(--b2)", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Production Form</div>
                    <code style={{ fontSize: 13, color: level.color }}>{level.production}</code>
                  </div>
                  <div style={{ padding: 12, background: "var(--b2)", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Key Property</div>
                    <div style={{ fontSize: 13, color: "var(--t6)" }}>{level.key}</div>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>Examples</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {level.examples.map((ex, i) => (<span key={i} style={{ padding: "5px 12px", background: level.bg, border: `1px solid ${level.border}`, borderRadius: 20, fontSize: 12, color: level.color, fontFamily: "'IBM Plex Mono', monospace" }}>{ex}</span>))}
                  </div>
                </div>
                <RealWorldSection level={level} />
                <MachineAnimation type={level.type} />
                {(level.type === 3 || level.type === 2) && <PumpingLemmaSimulator type={level.type} />}
              </div>
            )}
          </div>
        )}

        {/* CLASSIFY */}
        {tab === "classify" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <VennDiagram activeLevel={activeLevel} onSelect={t => setActiveLevel(activeLevel === t ? null : t)} pulse={pulse} />
            <div style={{ marginTop: 24 }}><ClassifyTab onClassify={handleClassify} /></div>
          </div>
        )}

        {/* PUMPING LEMMA (dedicated tab) */}
        {tab === "pumping" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ marginBottom: 24, padding: "16px 20px", background: "var(--panel-bg)", border: "1px solid var(--t07)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
              <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>About the Pumping Lemma</div>
              <p style={{ fontSize: 13, color: "var(--t55)", lineHeight: 1.7, margin: 0 }}>
                The pumping lemma is a necessary condition for a language to be regular (Type 3) or context-free (Type 2). It states that any sufficiently long string in the language can be "pumped" — a substring repeated any number of times — and the result must still belong to the language. Violation of this property proves a language is NOT in the respective class.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: 20, background: "var(--panel-bg)", border: "1px solid var(--t07)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#2dd4bf", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>Type 3 — Regular Languages</div>
                <div style={{ fontSize: 12, color: "var(--t45)", marginBottom: 12 }}>Decompose w = xyz with |xy| ≤ p, |y| ≥ 1 — pump y</div>
                <PumpingLemmaSimulator type={3} />
              </div>
              <div style={{ padding: 20, background: "var(--panel-bg)", border: "1px solid var(--t07)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#818cf8", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>Type 2 — Context-Free Languages</div>
                <div style={{ fontSize: 12, color: "var(--t45)", marginBottom: 12 }}>Decompose w = uvwxy with |vwx| ≤ p, |vx| ≥ 1 — pump v and x</div>
                <PumpingLemmaSimulator type={2} />
              </div>
            </div>
          </div>
        )}

        {/* COMPARE */}
        {tab === "compare" && (
          <div style={{ animation: "fadeIn 0.4s ease", background: "var(--panel-bg)", border: "1px solid var(--t06)", borderRadius: 12, padding: 24, backdropFilter: "blur(20px)", overflowX: "auto" }}>
            <h3 style={{ margin: "0 0 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: "var(--t)" }}>Comparison Table</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>{["Type", "Grammar", "Automaton", "Production", "Example"].map(h => (<th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid var(--t08)", textAlign: "left", color: "var(--t4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'IBM Plex Mono', monospace" }}>{h}</th>))}</tr>
              </thead>
              <tbody>
                {LEVELS.map(l => (
                  <tr key={l.type} style={{ cursor: "pointer" }} onClick={() => { setActiveLevel(l.type); setTab("explore"); }}>
                    <td style={{ padding: "12px", borderBottom: "1px solid var(--t04)", color: l.color, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{l.short}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid var(--t04)", color: "var(--t6)" }}>{l.grammar}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid var(--t04)", color: "var(--t6)" }}>{l.automaton}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid var(--t04)", color: "var(--t45)", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>{l.production}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid var(--t04)", color: l.color, fontFamily: "'IBM Plex Mono', monospace" }}>{l.examples[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ textAlign: "center", color: "var(--t2)", fontSize: 11, marginTop: 14 }}>Click any row to explore that level</p>
          </div>
        )}

        {/* QUIZ */}
        {tab === "quiz" && (
          <div style={{ animation: "fadeIn 0.4s ease", background: "var(--panel-bg)", border: "1px solid var(--t06)", borderRadius: 12, padding: 24, backdropFilter: "blur(20px)" }}>
            <Quiz />
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "40px 20px 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: "0.15em", color: "var(--t25)" }}>
        Made by Yash
      </div>
    </div>
  );
}
