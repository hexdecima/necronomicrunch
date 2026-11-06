import { El } from "../../shared/scripts/ui.js"
import { fetchSheet } from "../../shared/scripts/api.js";
import { RikishiTable, StableTable } from "../data.js"

const DAYS = [
  "D1",
  "D2",
  "D3",
  "D4",
  "D5",
  "D6",
  "D7",
  "D8",
  "D9",
  "D10",
  "D11",
  "D12",
  "D13",
  "D14",
  "D15"
];

const PICKS = [ "YOS", "SK", "m1", "m5", "m11", "maegashira" ];

function assetUrl(id) {
  return `https://raw.githubusercontent.com/hexdecima/necronomicrunch/refs/heads/sumo/src/assets/rikishi/${id}.png`;
}

/// Returns the detailed daily scores table for the overlay.
function makeDailyTable(stableScore) {
  const headerCells = [
    El.create("th").withText("RIKISHI").withClass("daily-rikishi")
  ];
  for (let i = 0; i < 15; i++) {
    headerCells.push(
      El.create("th")
        .withClass("daily-day")
        .withText(DAYS[i])
    );
  }
  const theader = El.create("tr")
    .withChildren(headerCells)

  const table = El.create("table")
    .withClass("results")
    .withChild(theader)

  const rikishiName = {
    YOS: rikishiTable?.getFromId(stableScore.YOS.id)?.shikona ?? "?",
    SK: rikishiTable?.getFromId(stableScore.SK.id)?.shikona ?? "?",
    m1: rikishiTable?.getFromId(stableScore.m1.id)?.shikona ?? "?",
    m5: rikishiTable?.getFromId(stableScore.m5.id)?.shikona ?? "?",
    m11: rikishiTable?.getFromId(stableScore.m11.id)?.shikona ?? "?",
    maegashira: rikishiTable?.getFromId(stableScore.maegashira.id)?.shikona ?? "?",
  };
  // There is no total column here (unlike leaderboard v1). Maaaybe I should add it.
  const rikishiRows = PICKS.map(pick => 
    El.create("tr")
      .withChild(
        El.create("td")
          .withClass("daily-rikishi")
          .withText(rikishiName[pick]))
      .withChildren(
        stableScore[pick].days.map(day => El.create("td")
            .withClass("daily-day")
            .withText(day)
        )
      )
  );
  table.withChildren(rikishiRows);

  return table;
}

// Dynamically creates the table with daily results for each rikishi on the detail overlay.
function makeInspectDaily() {
  return El.create("details")
    .withId("stable-results")
    .withChild(El.create("summary")
      .withChild(El.create("b").withText("CLICK HERE TO EXPAND/HIDE."))
    )
    .withChildren(inspectedTable == null ? [] : [ makeDailyTable(inspectedTable) ]);
}

function closeInspect() {
  El.fromId("inspect-container").downcast()
    .style.display = "none";
  El.fromId("footer").downcast()
    .style.display = "flex";
  El.fromId("stables").downcast()
    .style.display = "flex";

  inspectedTable = null;
}

function openInspect(stable) {
  inspectedTable = stable;
  refreshInspect();

  El.fromId("footer").downcast()
    .style.display = "none";
  El.fromId("stables").downcast()
    .style.display = "none";
  El.fromId("inspect-container").downcast()
    .style.display = "flex";
}

// Updates inspection overlay with the currently inspected table.
//
// Should be called before showing the overlay.
function refreshInspect() {
  El.fromId("stable-name").withText(inspectedTable.username);

  for (const PICK of PICKS) {
    El.fromId(`rikishi-${PICK}-label-name`)
      .withText(rikishiTable.getFromId(inspectedTable[PICK].id)?.shikona ?? "?");
    El.fromId(`rikishi-${PICK}-label-pts`)
      .withText(`${inspectedTable[PICK].total} PTS.`);
    El.fromId(`rikishi-${PICK}-img`).downcast()
      .src = assetUrl(inspectedTable[PICK].id);
  }

  El.fromId("stable-results")
    .downcast().remove();
  El.fromId("stable").withChild(makeInspectDaily());
}

// Sets up the stable detail overlay dynamically after HTML is loaded.
//
// In practice, elements are blank. refreshInspect() should update the overlay.
function setupInspect() {
  El.fromId("close").downcast().addEventListener("click", closeInspect);

  const cards = El.create("div").withId("rikishi-cards");
  for (const pick of PICKS) {
    const label = El.create("div")
     .withId(`rikishi-${pick}-label`)
      .withClass("rikishi-label")
      .withChild(
        El.create("b")
          .withId(`rikishi-${pick}-label-name`)
          .withText("?")
      )
      .withChild(
        El.create("p")
          .withId(`rikishi-${pick}-label-pts`)
          .withText(`-- PTS.`)
      );
    const img = El.create("img").withId(`rikishi-${pick}-img`);
    img.downcast().src = "";
    const card = El.create("div")
      .withId(`rikishi-${pick}`)
      .withClass("rikishi-card")
      .withChild(img)
      .withChild(label);

    cards.withChild(card);
  }

  El.fromId("stable-name").withText("?");
  El.fromId("stable")
    .withChild(cards)
    .withChild(makeInspectDaily());
}

function populateStables() {
  const stables = El.fromId("stables");

  const cards = stableTable.listByScore().map((stable, idx)=> {
    if (!stable.username) {
      return null
    }

    const card = El.create("div")
    .withClass("stable-card")
    .withChild(El.create("i").withText(`# ${idx + 1}`))
    .withChild(El.create("b").withText(stable.username))
    .withChild(El.create("p").withText(`${stable.total} pts.`))
    .withChild(El.create("div")
      .withClass("stable-card-pts")
      .withChild(El.create("b").withText(stable.YOS.total))
      .withChild(El.create("i").withText("+"))
      .withChild(El.create("b").withText(stable.SK.total))
      .withChild(El.create("i").withText("+"))
      .withChild(El.create("b").withText(stable.m1.total))
      .withChild(El.create("i").withText("+"))
      .withChild(El.create("b").withText(stable.m5.total))
      .withChild(El.create("i").withText("+"))
      .withChild(El.create("b").withText(stable.m11.total))
      .withChild(El.create("i").withText("+"))
      .withChild(El.create("b").withText(stable.maegashira.total))
    );
    card.downcast().addEventListener("click", () => openInspect(stable));
    return card;
  });

  stables.withChildren(cards.filter(c => !!c));
}

function showOverlay(stable) {
  if (inspectedTable == null) {
    return;
  };
}

async function loadData() {
  const { rikishi, detailedStable } = await fetchSheet.sumo();
  rikishiTable = RikishiTable.from(rikishi.items);
  stableTable = StableTable.from(detailedStable.items);
}

let rikishiTable;
let stableTable;
let inspectedTable = null;

(async () => {
  await loadData();
  // inspectedTable = stableTable.items[0];
  setupInspect();
  populateStables();
})();

