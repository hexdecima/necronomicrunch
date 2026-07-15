export const API_KEY = "AIzaSyDiRt8r0c2snhdg_63xL-SLay7Z1D7OmQw";
export const SHEET_ID = "1FUrU4olD_55Lf9F7LgYGdqZD8xfObITvLrenmcjSAFI";

export async function getSheetData(sheetId) {
  const fields = "sheets.data(rowData.values.formattedValue),sheets.properties.title";
  const uri = 
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${API_KEY}&fields=${fields}`;

  let data = fetch(uri)
    .then(res => res.json())
    .catch(e => { console.error(`uh-oh: ${e}`) });

  return data;
}

function getTable(raw, title) {
  return raw.sheets.find(item => item.properties.title == title);
}

class Sheet {
  static from(rawSheet, includeFirst) {
    const sheet = new Sheet();

    sheet.items = rawSheet.data[0].rowData
      .splice(includeFirst ? 0 : 1)
      .map(d => d.values)
      .map(row => row.map(cell => cell.formattedValue));

    return sheet;
  }
}

export const fetchSheet = {
  RAW: async function() {
      return getSheetData(SHEET_ID);
  },
  games: async function () {
    const data = await getSheetData(SHEET_ID);

    let played = getTable(data, "PlayedRef").data[0].rowData;
    let planning = getTable(data, "BacklogRef").data[0].rowData;
    let requested = getTable(data, "Req Queue").data[0].rowData;

    played = played
      .slice(1)
      .map(i => i.values.map(v => v.formattedValue))
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
      .slice(1)
      .map(i => i.values.map(v => v.formattedValue))
      .map(v => ({
        name: v[0],
        played: v[1],
        owned: v[2]
      }))
    requested = requested
      .slice(1)
      .map(i => i.values.map(v => v.formattedValue))
      .map(v => ({
        name: v[0],
        requestedBy: v[1]
      }));

    return {
      played, planning, requested
    }
  },
  rounds: async function() {
    function parseRawData(raw) {
      return raw.slice(0, lastRow)
        .map(row => row.slice(0, 4)
          .map(cell => cell.formattedValue)
        )
    }

    const data = await getSheetData(SHEET_ID);
    let rounds = getTable(data, "Rounds").data[0].rowData;
    const lastRow = rounds.findIndex(row => row.values[0].formattedValue == null);
    rounds = rounds.slice(1, lastRow)
      .map(row => row.values.map(v => v.formattedValue))
      .map(v => {
          const [w, l] = v[3].split("-");

          return {
            name: v[0],
            // WARN: This ignores anything but true or false being an option.
            active: v[1] == "TRUE" ? true : false,
            prio: v[2] == "TRUE" ? true : false,
            w, l
          }
        });

    return rounds
  },
  sumo: async function() {
    const data = await fetchSheet.RAW();

    const leaderboard = Sheet.from(getTable(data, "League of Oatus (Leaderboard)"));
    const results = Sheet.from(getTable(data, "Results"));
    const rikishi = Sheet.from(getTable(data, "Rikishi"));
    const sub = Sheet.from(getTable(data, "SumoRef"));
    const detailedStable = Sheet.from(getTable(data, "DetailedStableRef"), true);

    return { leaderboard, results, rikishi, sub, detailedStable }
  }
};
