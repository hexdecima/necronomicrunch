const API_KEY = "AIzaSyDiRt8r0c2snhdg_63xL-SLay7Z1D7OmQw"; // yes, this is restricted.
const SHEET_ID = "1FUrU4olD_55Lf9F7LgYGdqZD8xfObITvLrenmcjSAFI";

async function getSheetData(sheetId) {
  const uri = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${API_KEY}&includeGridData=true`;

  const data = fetch(uri)
    .then(res => res.json())
    .catch(e => { console.error(`uh-oh: ${e}`) });

  return data;
}

/// Fetches and parses both sheets, ready to be consumed by the UI logic.
async function fetchSheets() {
  const data = await getSheetData(SHEET_ID);

  let played = data.sheets[1].data[0].rowData
    .slice(1)
    .map(item => item.values);
  let planning = data.sheets[2].data[0].rowData
    .slice(1)
    .map(item => item.values);

  const lastPlayedRow = played.findIndex(row => row[0].formattedValue == null);
  const lastPlanningRow = planning.findIndex(row => row[0].formattedValue == null);

  played = played
    .slice(0, lastPlayedRow)
    .map(row => row.slice(0, 8)
    .map(cell => cell.formattedValue))
    .map(v => ({
      name: v[0],
      started: v[1],
      finished: v[2],
      episodes: v[3],
      link: v[4],
      will_return: v[5],
      deaths: v[6],
      time: v[7]
    }));
  planning = planning
    .slice(0, lastPlanningRow)
    .map(row => row.slice(0, 5)
    .map(cell => cell.formattedValue))
    .map(v => ({
      name: v[0],
      played: v[1],
      owned: v[2]
    }))

  return {
    played, planning
  }
}

class Played {
  constructor(inner) {
    this.inner = inner ?? [];
    this.sorting = "name";
  }
  refresh(values) {
    if (!values) values = this.inner;
    const table = byId("played");
    clearTable("played");
    for (const el of createPlayed(values)) {
      table.append(el);
    }
  }
  reset() {
    this.sorting = "name";
    this.sortBy("name");
  }
  sortBy(field) {
    let sorted;
    switch (field) {
      case "name":
        sorted = this.getSortedByName();
        break;
      case "started":
        sorted = this.getSortedByStart();
        break;
      case "finished":
        sorted = this.getSortedByFinish();
        break;
      case "will_return":
        sorted = this.getSortedByReturn();
        break;
      case "episodes":
        sorted = this.getSortedByEpisodes();
        break;
      default:
        sorted = null;
        break
    }

    if (sorted != null) {
      this.sorting = field;
      this.refresh(sorted);
    }
  }
  getSortedByName() {
    return this.inner.toSorted((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }
  getSortedByStart() {
    // undefined parses as `Invalid Date`, so we change that to null (which for some reason is 1970).
    return this.inner.toSorted((a, b) => new Date(a.started || null) < new Date(b.started || null))
  }
  getSortedByFinish() {
    return this.inner.toSorted((a, b) => new Date(a.finished || null) < new Date(b.finished || null))
  }
  getSortedByReturn() {
    return this.inner.toSorted((a, b) => a.will_return?.toLowerCase() > b.will_return?.toLowerCase())
  }
  getSortedByEpisodes() {
    return this.inner.toSorted((a, b) => Number(a.episodes || 0) > Number(b.episodes || 0))
  }
}

class Planning {
  constructor(inner) {
    this.inner = inner ?? [];
    this.sorting = "name";
  }
  refresh(values) {
    if (!values) values = this.inner;
    const table = byId("planning");
    clearTable("planning");
    for (const el of createPlanning(this.inner)) {
      table.append(el);
    }
  }
  getSortedByName() {
    return this.inner.toSorted((a, b) => a.name.localeCompare(b.name))
  }
}

/// Shorthand.
function byId(id) {
  return document.getElementById(id);
}

let activeTable = "played"; // must be either "played" or "planning".
let played;
let planning;

async function init() {
  let data = await fetchSheets();

  played = new Played(data.played);
  planning = new Planning(data.planning);
  played.sortBy("name");
  planning.refresh();
  clearLoading();
}

init();

function switchTables() {
  document.getElementById(activeTable).style.display = "none";
  if (activeTable == "played") {
    document.getElementById("planning").style.display = "table";
    activeTable = "planning";
    resetSorting();
  } else if (activeTable == "planning") {
    document.getElementById("played").style.display = "table";
    activeTable = "played";
    resetSorting();
  } else { console.error("uhhh"); }
}

function switchToPlayed() {
  if (activeTable == "planning") {
    switchTables();
    document.getElementById("switch-played").classList.add("selected-switch");
    document.getElementById("switch-planning").classList.remove("selected-switch");
  }
}

function switchToPlanning() {
  if (activeTable == "played") {
    switchTables();
    document.getElementById("switch-planning").classList.add("selected-switch");
    document.getElementById("switch-played").classList.remove("selected-switch");
  }
}

/// Shorthand to create a `<td>` with optional default.
function createTdElFrom(str, def) {
  let el = document.createElement("td");
  if (str != null) {
    str += '';
  }
  el.innerHTML = str?.length > 0 ? str : (def?.length > 0 ? def : "" );
  return el;
}

function createPlanning(planningData) {
  const plannedEls = [];

  for (let item of planningData) {
    let el = document.createElement("tr");
    el.className = "gamerow";
    el.append(createTdElFrom(item.name));
    el.append(createTdElFrom(item.played));
    el.append(createTdElFrom(item.owned));
    plannedEls.push(el);
  }

  return plannedEls
}

function createPlayed(playedData) {
  const playedEls = [];

  for (let item of playedData) {
    let el = document.createElement("tr");
    el.className = "gamerow";
    el.append(createTdElFrom(item.name));
    el.append(createTdElFrom(item.started));
    el.append(createTdElFrom(item.finished));
    el.append(createTdElFrom(item.episodes));
    el.append(createTdElFrom(
      !item.link ? null :
      `<a href="${item.link}">&lt;here&gt;</a>`)
    );
    el.append(createTdElFrom(item.will_return));
    el.append(createTdElFrom(item.deaths));
    el.append(createTdElFrom(item.time));
    playedEls.push(el);
  }

  return playedEls
}

/// Remove all rows of a table `id` but its head.
function clearTable(id) {
  const table = byId(id);
  Array.from(table.children).forEach((child, i) => {
    if (i == 0) {
      return;
    }
    child.remove();
  });
}

/// Configures the switching and styling of the PLAYED and PLANNING buttons at the top.
function setupTableSwitchers() {
  let switchPlayedBtn = document.getElementById("switch-played");
  switchPlayedBtn.addEventListener("click", switchToPlayed);
  switchPlayedBtn.classList.add("selected-switch");
  document.getElementById("switch-planning").addEventListener("click", switchToPlanning);
}

setupTableSwitchers();

const PLAYED_FIELDS = {
  name: "Name",
  started: "Started on",
  finished: "Finished on",
  episodes: "Episodes",
  link: "Link",
  will_return: "Will return?",
  deaths: "Deaths",
  time: "Time"
}

const PLANNING_FIELDS = {
  name: "Name",
  played: "Played?",
  owned: "Owned?"
}

function setupPlayedSorting() {
  const sortingField = document.getElementById("sorting-field");

  function sortBy(field) {
    sortingField.innerText = PLAYED_FIELDS[field];
    played?.sortBy(field);
  }

  byId("played-game").addEventListener("click", () => sortBy("name"));
  byId("played-started").addEventListener("click", () => sortBy("started"));
  byId("played-finished").addEventListener("click", () => sortBy("finished"));
  byId("played-willreturn").addEventListener("click", () => sortBy("will_return"));
  byId("played-episodes").addEventListener("click", () => sortBy("episodes"));
}

function setupPlanningSorting() {
  const sortingField = byId("sorting-field");

  function sortBy(field) {
    sortingField.innerText = PLANNING_FIELDS[field];
  }

  byId("planning-game").addEventListener("click", () => sortBy("name"));
}

function setupSorting() {
  setupPlayedSorting();
  setupPlanningSorting();
}

function resetSorting() {
  played?.reset();
  byId("sorting-field").innerText = PLAYED_FIELDS.name;
}

setupSorting();

/// Loads the spinner image and uhh make it spin?
function setupLoading() {
  const el = byId("loading");
  el.classList.add("loading-spin");
  let src;

  if (Math.floor(Math.random() * 10) == 0) {
    src = "assets/gimmo.png";
  } else {
    src = "assets/oatus.png";
  }

  el.src = src;
}

/// Makes the spinner stop at the very bottom of the page.
function clearLoading() {
  const el = byId("loading");
  el.classList.remove("loading-spin");
}

setupLoading();
