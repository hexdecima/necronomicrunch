import { SHEET_ID, getSheetData, fetchSheet } from "../shared/scripts/api.js"

function mkTexEl(type, text) {
  const el = document.createElement(type);
  el.innerHTML = text ?? "";

  return el;
}

function mkTd(text) {
  return mkTexEl("td", text);
}

function mkTh(text) {
  return mkTexEl("th", text);
}

/// Returns a formatted <tr> for a given score.
function mkRowFromScore(score) {
  const el = document.createElement("tr");
  el.classList.add("chat-row");
  el.append(mkTd(score.name));
  el.append(mkTd(score.active ? "YES" : ""));
  el.append(mkTd(score.prio ? "YES" : ""));

  const scoreEl = mkTd(`W<b>${score.w}</b> - L<b>${score.l}</b>`);
  scoreEl.classList.add("score");
  el.append(scoreEl);

  return el;
}

// Updates the UI with score data.
//
// Should be called after updating said values.
function refreshFields() {
  const inner = document.getElementById("chat-inner");
  clearScores();

  for (const score of entries.slice(1)) {
    inner.append(mkRowFromScore(score));
  }

  const host = entries[0];
  const winNo = document.getElementById("win-no");
  const lossNo = document.getElementById("loss-no");

  winNo.innerHTML = host.w;
  lossNo.innerHTML = host.l;
}

// Deletes all but the first row of the scores table
// (i.e. except the header).
function clearScores() {
  const inner = document.getElementById("chat-inner");
  Array.from(inner).slice(1).forEach(child => child.remove())
}

// Terrible variable naming, holds each player/score.
// W-L are strings to avoid unexpected fucky wuckys.
// {
//  name: String, active: bool, prio: bool, w: String, l: string
// }
let entries = [];

async function setup() {
  populateInner();
  await loadData();
  refreshFields();
  clearLoading();
}

/// Fetches sheet data and updates the global scores variable.
async function loadData() {
  const scores = await fetchSheet.rounds();
  entries = scores;
}

// Hides loading and shows main.
function clearLoading() {
  const loading = document.getElementById("loading");
  loading.style.display = "none";

  const main = document.getElementById("main");
  main.style.display = "flex";
}

/// Reads the `entries` globals and updates the inner table.
function populateInner() {
  const inner = document.getElementById("chat-inner");
  const header = document.createElement("tr");
  header.classList.add("chat-header");
  header.append(mkTh("PLAYER"));
  header.append(mkTh("ACTIVE"));
  header.append(mkTh("PRIO"));
  header.append(mkTh("SCORE"));
  inner.append(header);

  // const DUMMY_DATA = [
  //   {
  //     name: "Oatmeal",
  //     active: false,
  //     prio: true,
  //     w: "1",
  //     l: "120"
  //   },
  //   {
  //     name: "Gimmo",
  //     active: true,
  //     prio: false,
  //     w: "1021",
  //     l: "0"
  //   }
  // ];
  // for (const item of DUMMY_DATA) {
  //   const row = mkRowFromScore(item);
  //
  //   inner.append(row);
  // }
}

function preSetup() {
  const img = document.getElementById("loading-img");
  const content = Math.floor(Math.random() * 2) == 1 ? 
    "../assets/oatus_small.png" : "../assets/gimmo_small.png";

  img.src = content;
  img.style.filter = "url(#pixelate)";
}

(async () => {
  preSetup();
  await setup();
})();
