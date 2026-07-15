import { fetchSheet } from "../../shared/scripts/api.js";
import { El } from "../../shared/scripts/ui.js";
import { RikishiTable, StableTable } from "../data.js";

async function loadData() {
  const { detailedStable, rikishi } = await fetchSheet.sumo();

  rikishiTable = RikishiTable.from(rikishi.items);
  stableTable = StableTable.from(detailedStable.items);
}

function sortStables() {
  if (!stableTable) return;

  stableTable.items.sort((lhs, rhs) => {
    return rhs.total - lhs.total;
  })
}


function populateLead() {
  const lead = El.fromId("leaderboard");

  for (const stable of stableTable.items) {
    const standDetailHead = El.create("tr")
      .withChild(El.create("th")
        .withClass("lead-username")
        .withText("Rikishi"));
    for (let i = 1; i < 17; i++) {
      standDetailHead.withChild(El.create("th").withText(""));
    };

    const rikishiName = {
      YOS: rikishiTable.getFromId(stable.YOS.id)?.shikona ?? "?",
      SK: rikishiTable.getFromId(stable.SK.id)?.shikona ?? "?",
      m1: rikishiTable.getFromId(stable.m1.id)?.shikona ?? "?",
      m5: rikishiTable.getFromId(stable.m5.id)?.shikona ?? "?",
      m11: rikishiTable.getFromId(stable.m11.id)?.shikona ?? "?",
      maegashira: rikishiTable.getFromId(stable.maegashira.id)?.shikona ?? "?",
    };
    const detailRows = ["YOS", "SK", "m1", "m5", "m11", "maegashira"].map(pick => {
      return [
        El.create("td")
          .withClass("lead-username")
          .withText(rikishiName[pick]),
        El.create("td")
          .withClass("lead-total")
          .withText(""),
        ...(stable[pick].days.map(day => El.create("td")
            .withClass("lead-score")
            .withText(day)
        ))
      ];
    });

    const standEl = El.create("details")
      .withChild(
        El.create("summary").withChild(
          El.create("tr")
          .withChild(
            El.create("td")
            .withClass("lead-username")
            .withText(stable.username)
          )
          .withChild(
            El.create("td")
            .withClass("lead-total")
            .withText(stable.total ?? "0")
          )
          .withChildren(stable.getDayTotals().map(day => El.create("td")
            .withClass("lead-score")
            .withText(day ?? "0")
          ))
        )
      )
      .withChild(
        El.create("table")
          .withChild(standDetailHead)
          .withChildren(detailRows.map(row => El.create("tr").withChildren(row)))
      );

    lead.withChild(standEl);
  }
}

async function init() {
  await loadData();
  sortStables();
  populateLead();
}

let stableTable;
let rikishiTable;

(async () => {
  await init();
})();
