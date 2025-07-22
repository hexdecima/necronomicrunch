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

// (() => {
// fetch(sheetsApi(`/${b}key=${API_KEY}&includeGridData=true`))
//   .then(res => res.json())
//   .then(data => console.log(data.sheets))
// })()
