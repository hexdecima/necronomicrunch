export class Rikishi {
  static from(row) {
    const r = new Rikishi();
    r.basho = row[0];
    r.division = row[1];
    r.rank = row[2];
    r.shikona = row[3];
    r.rikishiId = row[4];
    r.side = row[5];
    r.tier = row[6];

    return r;
  }
}

export class RikishiTable {
  static from(list) {
    const table = new RikishiTable();
    table.items = {};
    list.forEach(row => {
      table.items[row[4]] = Rikishi.from(row);
    });

    return table;
  }

  getFromId(id) {
    return this.items[id];
  }
}

export class Submission {
  static from(row) {
    const sub = new Submission();
    sub.username = row[0];
    sub.yosPick = row[1]; // Yokozuna, Ozeki, Sekiwake
    sub.skPick = row[2]; // Sekiwake, Komusubi
    sub.m1 = row[3];
    sub.m5 = row[4];
    sub.m11 = row[5];
    sub.maegashira = row[6];

    return sub;
  }
}

export class SubmissionTable {
  static from(list) {
    const table = new SubmissionTable();
    table.items = list.map(Submission.from);

    return table;
  }
}

export class Result {
  static from(row) {
    const res = new Result();
    res.basho = row[0];
    res.day = row[1];
    res.matchNo = row[2];
    res.east = row[3];
    res.eastId = row[4]; // Probably redundant?
    res.west = row[5];
    res.westId = row[6];
    res.winner = row[7] ?? null;
    res.winnerId = row[8];
    res.kimarite = row[9];

    return res;
  }
}

export class ResultTable {
  static from(list) {
    const table = new ResultTable();
    table.items = list.map(Result.from);

    return table;
  }
}

// visibly holding myself from naming these Leaderboard and LeaderboardTable.
export class Standing {
  static from(row) {
    const item = new Standing();
    item.username = row[0];
    item.total = row[1];
    item.days = row.slice(2, 17);

    return item;
  }
}

export class Leaderboard {
  static from(list) {
    const table = new Leaderboard();
    table.items = list.map(Standing.from);

    return table;
  }
}

export class StableScore {
  static from(rows) {
    const mkScore = (row) => {
      return {
        id: rows[row][0],
        total: rows[row][1] ? Number(rows[row][1]) : 0,
        days: rows[row].splice(2, 18).map(Number)
      };
    };
    const score = new StableScore();
    score.username = rows[0][0];
    score.YOS = mkScore(1);
    score.SK = mkScore(2);
    score.m1 = mkScore(3);
    score.m5 = mkScore(4);
    score.m11 = mkScore(5);
    score.maegashira = mkScore(6);

    return score;
  }
}

// heh, hehehe, heh
export class StableTable {
  static from(raw) {
    const STEP = 7;
    const table = new StableTable();
    table.items = [];

    for (let i = 1; i < raw.length; i += STEP) {
      const score = StableScore.from(raw.slice(i - 1, i + STEP));
      table.items.push(score);
    }

    return table;
  }
}
