# Chomsky Hierarchy — Interactive Visualizer

An interactive educational tool for exploring the Chomsky Hierarchy of formal languages, built with React. Covers all four grammar types with animated automaton simulations, a pumping lemma simulator, a language classifier, and a quiz.

---

## Features

- **Explore Tab** — Click through an interactive Venn diagram to explore each of the four grammar types (Type 0–3). Each level includes its production rules, key properties, language examples, real-world applications, and a step-by-step animated automaton.
- **Machine Animations** — Watch a DFA, PDA, Linear Bounded Automaton, or Turing Machine process an input string one step at a time. Supports manual stepping, auto-play, and reset.
- **Pumping Lemma Simulator** — Interactive proofs for both the Regular and Context-Free pumping lemmas. Select preset languages, adjust the pump count `i`, and observe accepted/rejected outcomes with full explanations.
- **Classify Tab** — Type in a language description (e.g. `aⁿbⁿcⁿ`, `balanced parentheses`, `ww`) and get an instant classification with reasoning. Includes a built-in symbol keyboard for superscript and formal notation.
- **Test Membership** — Select from a set of preset languages and test whether a given string is a member.
- **Compare Tab** — Side-by-side comparison table of all four grammar types: grammar class, automaton, production form, and a canonical example.
- **Quiz** — Six-question quiz to test understanding of the hierarchy.
- **Light / Dark Mode** — Toggle between themes.

---

## Grammar Levels Covered

| Type | Name | Grammar | Automaton |
|------|------|----------|-----------|
| 3 | Regular | Regular Grammar | Finite Automaton (DFA/NFA) |
| 2 | Context-Free | CFG | Pushdown Automaton (PDA) |
| 1 | Context-Sensitive | CSG | Linear Bounded Automaton (LBA) |
| 0 | Recursively Enumerable | Unrestricted Grammar | Turing Machine |

---

## Tech Stack

- **React** (functional components, hooks)
- **Vanilla CSS-in-JS** (inline styles with CSS variables for theming)
- **SVG** for the Venn diagram
- **No external UI libraries** — fully self-contained

---

## Getting Started
## Running it

Just open "chomskyhierarchy.netlify.app" in a browser. That's it.


## Files


index.html   — structure and layout
script.js    — all the logic (classifier, animations, keyboard)
style.css    — styling and theming
---

## Automaton Simulations

Each grammar type has a corresponding step-by-step simulation:

- **DFA** (Type 3) — processes `aaabbb` against `a*b*`, showing state transitions
- **PDA** (Type 2) — processes `aaabbb` against `aⁿbⁿ`, showing stack push/pop
- **LBA** (Type 1) — processes `aabbcc` against `aⁿbⁿcⁿ`, marking symbols in-place
- **Turing Machine** (Type 0) — processes `aaabbb` against `aⁿbⁿ`, showing multi-pass tape rewrites

---

## Pumping Lemma Presets

**Regular (Type 3):**
- `a*b*` — satisfies the lemma (IS regular)
- `aⁿbⁿ` — contradiction found (NOT regular)
- Even number of a's — satisfies the lemma
- Palindromes over {a,b} — contradiction found

**Context-Free (Type 2):**
- `aⁿbⁿcⁿ` — contradiction found (NOT context-free)
- `aⁿbⁿ` — satisfies the lemma (IS context-free)
- `ww` — contradiction found (NOT context-free)

---

## Language Classifier

The classifier supports natural language input and formal notation:

```
aⁿbⁿcⁿ           → Type 1 (Context-Sensitive)
balanced parens   → Type 2 (Context-Free)
(ab)*             → Type 3 (Regular)
halting problem   → Type 0 (RE)
```

A built-in symbol keyboard provides easy input of superscripts, set notation, and formal language symbols.

---

## Author

Made by Yash
