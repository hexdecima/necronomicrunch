import { fetchSheet } from "../../shared/scripts/api.js";
import { RikishiTable, SubmissionTable, StableTable } from "../data.js";

function byId(id) {
  return document.getElementById(id);
}

// Maps (in place) the rikishi IDs in the submissions to their shikona.
function realiseSubmissions(rikishi) {
  stableTable.items = stableTable.items.map(stable => {
    stable.YOS.name = rikishi.getFromId(stable.YOS.id)?.shikona ?? "?";
    stable.SK.name = rikishi.getFromId(stable.SK.id)?.shikona ?? "?";
    stable.m1.name = rikishi.getFromId(stable.m1.id)?.shikona ?? "?";
    stable.m5.name = rikishi.getFromId(stable.m5.id)?.shikona ?? "?";
    stable.m11.name = rikishi.getFromId(stable.m11.id)?.shikona ?? "?";
    stable.maegashira.name = rikishi.getFromId(stable.maegashira.id)?.shikona ?? "?";
    return stable;
  });
}

async function loadData() {
  const { rikishi, detailedStable } = await fetchSheet.sumo();

  stableTable = StableTable.from(detailedStable.items);
  rikishiTable = RikishiTable.from(rikishi.items);
  realiseSubmissions(rikishiTable);
}

function populateSubmissions() {
  const stables = byId("stables");

  for (const stable of stableTable.items) {
    // TODO: Split this cat's cradle.
    const subLi = document.createElement("li");
    const subDetails = document.createElement("details");

    const subSummary = document.createElement("summary");
    const subName = document.createElement("i");
    subName.classList.add("sub-name");
    subName.innerText = `${stable.username}`;
    subSummary.append(subName);

    const subRikishi = document.createElement("div");
    subRikishi.classList.add("sub-rikishi");
    const rikishiList = [
      stable.YOS, stable.SK, stable.m1, stable.m5, stable.m11, stable.maegashira
    ];
    for (const rikishi of rikishiList) {
      const text = document.createElement("p");
      text.innerText = rikishi.name;
      subRikishi.append(text);
    }
    subSummary.append(subRikishi);
    subDetails.append(subSummary);

    const subScores = document.createElement("table");
    subScores.classList.add("sub-scores");
    const scoreHead = document.createElement("tr");
    scoreHead.append((() => {
      const shikona = document.createElement("th");
      shikona.innerText = "Shikona";
      return shikona;
    })());
    scoreHead.append((() => {
      const total = document.createElement("th");
      total.innerText = "Total";
      return total;
    })());
    for (let i = 1; i < 16; i++) {
      scoreHead.append((() => {
        const d = document.createElement("th");
        d.innerText = `D${i}`;
        return d;
      })());
    };
    subScores.append(scoreHead);


    const scoreYOS = document.createElement("tr");
    scoreYOS.append((() => { 
      const rikishi = document.createElement("td");
      rikishi.innerText = stable.YOS.name;
      return rikishi;
    })());
    scoreYOS.append((() => {
      const total = document.createElement("td");
      total.innerText = stable.YOS.total;
      return total;
    })());
    for (const dayScore of stable.YOS.days) {
      scoreYOS.append((() => {
        const day = document.createElement("td");
        day.classList.add("stable-day");
        day.innerText = dayScore;
        return day;
      })());
    }
    subScores.append(scoreYOS);

    const scoreSK = document.createElement("tr");
    scoreSK.append((() => { 
      const rikishi = document.createElement("td");
      rikishi.innerText = stable.SK.name;
      return rikishi;
    })());
    scoreSK.append((() => {
      const total = document.createElement("td");
      total.innerText = stable.SK.total;
      return total;
    })());
    for (const dayScore of stable.SK.days) {
      scoreSK.append((() => {
        const day = document.createElement("td");
        day.classList.add("stable-day");
        day.innerText = dayScore;
        return day;
      })());
    }
    subScores.append(scoreSK);


    const scorem1 = document.createElement("tr");
    scorem1.append((() => { 
      const rikishi = document.createElement("td");
      rikishi.innerText = stable.m1.name;
      return rikishi;
    })());
    scorem1.append((() => {
      const total = document.createElement("td");
      total.innerText = stable.m1.total;
      return total;
    })());
    for (const dayScore of stable.m1.days) {
      scorem1.append((() => {
        const day = document.createElement("td");
        day.classList.add("stable-day");
        day.innerText = dayScore;
        return day;
      })());
    }
    subScores.append(scorem1);

    const scorem5 = document.createElement("tr");
    scorem5.append((() => { 
      const rikishi = document.createElement("td");
      rikishi.innerText = stable.m5.name;
      return rikishi;
    })());
    scorem5.append((() => {
      const total = document.createElement("td");
      total.innerText = stable.m5.total;
      return total;
    })());
    for (const dayScore of stable.m5.days) {
      scorem5.append((() => {
        const day = document.createElement("td");
        day.classList.add("stable-day");
        day.innerText = dayScore;
        return day;
      })());
    }
    subScores.append(scorem5);

    const scorem11 = document.createElement("tr");
    scorem11.append((() => { 
      const rikishi = document.createElement("td");
      rikishi.innerText = stable.m11.name;
      return rikishi;
    })());
    scorem11.append((() => {
      const total = document.createElement("td");
      total.innerText = stable.m11.total;
      return total;
    })());
    for (const dayScore of stable.m11.days) {
      scorem11.append((() => {
        const day = document.createElement("td");
        day.classList.add("stable-day");
        day.innerText = dayScore;
        return day;
      })());
    }
    subScores.append(scorem11);

    const scoreMae = document.createElement("tr");
    scoreMae.append((() => { 
      const rikishi = document.createElement("td");
      rikishi.innerText = stable.maegashira.name;
      return rikishi;
    })());
    scoreMae.append((() => {
      const total = document.createElement("td");
      total.innerText = stable.maegashira.total;
      return total;
    })());
    for (const dayScore of stable.maegashira.days) {
      scoreMae.append((() => {
        const day = document.createElement("td");
        day.classList.add("stable-day");
        day.innerText = dayScore;
        return day;
      })());
    }
    subScores.append(scoreMae);

    const scoreExtra = document.createElement("tr");
    scoreExtra.append(document.createElement("td"));
    scoreExtra.append((() => {
      const totalSum = document.createElement("td");
      const sum = stable.YOS.total
        + stable.SK.total
        + stable.maegashira.total
        + stable.m1.total
        + stable.m5.total
        + stable.m11.total;
      totalSum.innerText = sum;
      return totalSum;
    })());
    subScores.append(scoreExtra);

    subDetails.append(subScores);
    subLi.append(subDetails);
    stables.append(subLi);
  }
}

let rikishiTable;
let stableTable;

async function init() {
  await loadData();
  populateSubmissions();
}

(async () => {
  await init();
})();
