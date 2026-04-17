const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

if (!code.includes('document.body.className')) {
  code = code.replace(
    'const isDark = theme === "dark";',
    'const isDark = theme === "dark";\n\n  useEffect(() => {\n    document.body.className = isDark ? "dark-mode" : "light-mode";\n    document.documentElement.style.colorScheme = isDark ? "dark" : "light";\n  }, [isDark]);'
  );
}

// Ensure the gradients are turned into solid colors so they don't break simple transitions if they run
code = code.replace(
  'isDark ? "linear-gradient(160deg, #07070f 0%, #0d0d1a 40%, #0a0a14 100%)" : "linear-gradient(160deg, #f0f0f5 0%, #e8e8f0 40%, #f5f5fa 100%)"',
  'isDark ? "#0d0d1a" : "#f1f5f9"'
);

// We replace the transition on the main container so we don't get out-of-sync flashing.
code = code.replace(
  'transition: "background 0.3s, color 0.3s"',
  'transition: "background-color 0.3s, color 0.3s"'
);

code = code.replace(/255,255,255/g, 'var(--w-rgb)');
code = code.replace(/rgba\(0,0,0,/g, 'rgba(var(--b-rgb),');
code = code.replace(/"#e2e8f0"/g, '"var(--text-main)"');

// Also #f97316, #f472b6, #818cf8, #2dd4bf which are used as accents. Since they are bright they're usually fine on both dark and light
// But let's check #111 which is a darker color.
code = code.replace(/#111/g, 'var(--select-bg)');

fs.writeFileSync('src/App.jsx', code);
console.log("Replaced successfully!");
