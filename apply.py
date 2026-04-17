import re

with open('src/App_temp.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

state_injection = """  const [activeLevel, setActiveLevel] = useState(null);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isLight]);
"""
code = code.replace("  const [activeLevel, setActiveLevel] = useState(null);", state_injection)

button_injection = """
      <div style={{ textAlign: "center", padding: "44px 20px 24px", position: "relative" }}>
        <button 
          onClick={() => setIsLight(prev => !prev)}
          style={{ 
            position: "absolute", top: 20, right: 20, 
            background: "rgba(var(--w-rgb), 0.1)", 
            border: "1px solid rgba(var(--w-rgb), 0.2)", 
            borderRadius: 8, padding: "8px 12px", 
            color: "var(--text-main)", cursor: "pointer", 
            fontFamily: "'IBM Plex Mono', monospace",
            display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.3s", zIndex: 50
          }}
        >
          {isLight ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
"""
code = code.replace('      <div style={{ textAlign: "center", padding: "44px 20px 24px" }}>', button_injection)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
    print("Updated src/App.jsx")
