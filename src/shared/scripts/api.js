export const API_KEY = "AIzaSyDiRt8r0c2snhdg_63xL-SLay7Z1D7OmQw";
export const SHEET_ID = "1FUrU4olD_55Lf9F7LgYGdqZD8xfObITvLrenmcjSAFI";

export async function getSheetData(sheetId) {
  const fields = "sheets.data(rowData.values.formattedValue)";
  const uri = 
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${API_KEY}&fields=${fields}`;
  const start = Date.now();

  const data = fetch(uri)
    .then(res => res.json())
    .catch(e => { console.error(`uh-oh: ${e}`) });

  return data;
}

export const fetchSheet = {
  RAW: async function() {
      return getSheetData(SHEET_ID);
  },
  games: async function () {
    const data = await getSheetData(SHEET_ID);

    let played = data.sheets[1].data[0].rowData
      .slice(1)
      .map(item => item.values);
    let planning = data.sheets[2].data[0].rowData
      .slice(1)
      .map(item => item.values);
    let requested = data.sheets[3].data[0].rowData
      .slice(1)
      .map(item => item.values);

    const lastPlayedRow = played.findIndex(row => row[0].formattedValue == null);
    const lastPlanningRow = planning.findIndex(row => row[0].formattedValue == null);
    const lastRequestedRow = requested.findIndex(row => row[0].formattedValue == null);

    played = played
      .slice(0, lastPlayedRow)
      .map(row => row.slice(0, 8)
        .map(cell => cell.formattedValue)
      )
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
      .map(row => row.slice(0, 5))
      .map(cell => cell.map(v => v.formattedValue))
      .map(v => ({
        name: v[0],
        played: v[1],
        owned: v[2]
      }))
    requested = requested
      .slice(0, lastRequestedRow)
      .map(row => row.slice(0, 2))
      .map(cell => cell.map(v => v.formattedValue))
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
  },
};
