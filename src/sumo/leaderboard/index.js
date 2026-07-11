import { fetchSheet } from "../../shared/scripts/api.js";
import { Leaderboard } from "../data.js";

async function loadData() {
  const { leaderboard } = await fetchSheet.sumo();

  leadTable = Leaderboard.from(leaderboard.items);
  console.log(leadTable);
}

function populateLead() {
  const lead = document.getElementById("leaderboard");

  for (const standing of leadTable.items) {
    const leadRow = document.createElement("tr");
    const leadName = document.createElement("td");
    leadName.classList.add("lead-username");
    leadName.innerText = standing.username;
    leadRow.append(leadName);
    const leadTotal = document.createElement("td");
    leadTotal.classList.add("lead-total");
    leadTotal.innerText = standing.total ?? "0";
    leadRow.append(leadTotal);

    for (const day of standing.days) {
      const leadDay = document.createElement("td");
      leadDay.innerText = day ?? "0";
      leadDay.classList.add("lead-score");
      leadRow.append(leadDay);
    }

    lead.append(leadRow);
  }
}

async function init() {
  await loadData();
  populateLead();
}

let leadTable;

(async () => {
  await init();
})();
