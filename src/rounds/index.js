const API_KEY = "AIzaSyDiRt8r0c2snhdg_63xL-SLay7Z1D7OmQw";
const SHEET_ID = "1FUrU4olD_55Lf9F7LgYGdqZD8xfObITvLrenmcjSAFI";

async function getSheetData(sheetId) {
  const uri = 
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${API_KEY}&includeGridData=true`;

  const data = fetch(uri)
    .then(res => res.json())
    .catch(e => { console.error(`uh-oh: ${e}`) });

  return data;
}

// Fetches sheet data, parses it and returns relevant data.
async function fetchData() {
  function parseRawData(raw) {
    const lastRow = raw.findIndex(row => row[0].formattedValue == null);

    return raw.slice(0, lastRow)
      .map(row => row.slice(0, 4)
        .map(cell => cell.formattedValue)
      )
      .map(v => {
        const [w, l] = v[3].split("-");

        return {
          name: v[0],
          // WARN: This ignores anything but true or false being an option.
          active: v[1] == "TRUE" ? true : false,
          prio: v[2] == "TRUE" ? true : false,
          w, l
        }
      })
  }
  const data = await (async () => { 
    const raw = await getSheetData(SHEET_ID);
    return raw.sheets[5].data[0].rowData
      .slice(1)
      .map(item => item.values)
  })();

  return parseRawData(data);
}

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
  const scores = await fetchData();
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
