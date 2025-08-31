"use strict";

// ====== DATA TEMPS ======
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-11
const todayDate = now.getDate(); // 1-31

// FR ou EN ? (choisis)
const monthsFR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const monthsEN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const months = monthsFR;

// DOM
const titleEl = document.getElementById("title");
const totalDaysEl = document.getElementById("totalDays");
const habitBtn = document.getElementById("habitTitle");
const gridEl = document.getElementById("calendarGrid");
const resetBtn = document.getElementById("resetButton");

// ====== UTILS ======
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysInMonth = (y, m) =>
  m === 1
    ? isLeap(y)
      ? 29
      : 28
    : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
const firstWeekday = (y, m) => new Date(y, m, 1).getDay(); // 0=Dimanche

// Storage keys
const KEY = `habit-${currentYear}-${currentMonth}`;
const NAME_KEY = `habit-name-${currentYear}-${currentMonth}`;

// ====== INIT ======
titleEl.textContent = months[currentMonth];

let habitName =
  localStorage.getItem(NAME_KEY) || "Clique pour définir ton habitude";
habitBtn.textContent = habitName;

// Générer les cases
const totalDaysInMonth = daysInMonth(currentYear, currentMonth);
const offset = (firstWeekday(currentYear, currentMonth) + 6) % 7; // décaler pour Lundi=0

// Lire l’état sauvé
let checked = JSON.parse(localStorage.getItem(KEY) || "[]");

function render() {
  gridEl.innerHTML = "";
  // cases vides avant le 1er
  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div");
    empty.className = "day day--empty";
    empty.setAttribute("aria-hidden", "true");
    gridEl.appendChild(empty);
  }
  // jours
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const btn = document.createElement("button");
    btn.className = "day";
    btn.type = "button";
    btn.textContent = d;
    btn.setAttribute("role", "button");
    const isDone = checked.includes(d);
    btn.setAttribute("aria-pressed", String(isDone));
    if (d === todayDate) btn.classList.add("day--today");
    btn.addEventListener("click", () => {
      const pressed = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!pressed));
      if (!pressed) {
        checked.push(d);
      } else {
        checked = checked.filter((x) => x !== d);
      }
      localStorage.setItem(KEY, JSON.stringify(checked));
      updateTotal();
    });
    gridEl.appendChild(btn);
  }
  updateTotal();
}

function updateTotal() {
  totalDaysEl.textContent = `${checked.length}/${totalDaysInMonth}`;
}

// Events
habitBtn.addEventListener("click", () => {
  const val = prompt("Quelle est ton habitude ?", habitBtn.textContent);
  if (val !== null) {
    const name = val.trim();
    habitBtn.textContent = name.length
      ? name
      : "Clique pour définir ton habitude";
    localStorage.setItem(NAME_KEY, habitBtn.textContent);
  }
});

resetBtn.addEventListener("click", () => {
  if (confirm("Tout réinitialiser pour ce mois ?")) {
    checked = [];
    localStorage.removeItem(KEY);
    localStorage.removeItem(NAME_KEY);
    habitBtn.textContent = "Clique pour définir ton habitude";
    render();
  }
});

render();

// ========== THEME TOGGLE ==========
const themeToggle = document.getElementById("themeToggle");
const THEME_KEY = "pref-theme";

/**
 * Applique un thème ("light" | "dark") sur <html data-theme="...">
 * et met à jour le bouton/ARIA.
 */
function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", "true");
      themeToggle.textContent = "☀️ Mode clair";
      themeToggle.title = "Basculer en mode clair";
    }
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", "false");
      themeToggle.textContent = "🌙 Mode sombre";
      themeToggle.title = "Basculer en mode sombre";
    }
  }
}

// 1) Au chargement : si l'utilisateur a déjà choisi, on respecte
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === "dark" || savedTheme === "light") {
  applyTheme(savedTheme);
} else {
  // Sinon : ne rien mettre → le @media (prefers-color-scheme) prendra le relais
  // Mais on met à jour le bouton en conséquence du thème effectif
  const isOSDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(isOSDark ? "dark" : "light");
}

// 2) Au clic : on alterne et on sauve
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}
