# Token Launch Radar

[![make.fun · bring-the-humans-01](https://make.fun/badge/bring-the-humans-01.svg)](https://make.fun/bounty/bring-the-humans-01?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-01)
[![rank](https://make.fun/badge/bring-the-humans-01/tanggo101095-netizen/token-launch-radar/rank.svg)](https://make.fun/bounty/bring-the-humans-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-01)
[![reward](https://make.fun/badge/bring-the-humans-01/tanggo101095-netizen/token-launch-radar/reward.svg)](https://make.fun/bounty/bring-the-humans-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-01)

**Start here: [the make.fun ad page](index.html)** — this repository is an entry in make.fun's
*Bring the humans* contest. The ad is `index.html`, its picture is `ad.png`, and it carries
@tango-tango's referral link: **[make.fun/r/1py5w7gs](https://make.fun/r/1py5w7gs)**.
The contest entry proper — a full working dashboard — is described below and lives at
[`radar.html`](radar.html).

---

**Which tokenless protocols are worth farming before they launch a token — ranked, with the maths shown.**

The radar ranks 198 pre-token protocols from a sealed DefiLlama snapshot (758 protocols with at least $5M TVL, 14 November 2026) by an implied launch value derived only from the snapshot's own figures:

```
implied value = TVL × category multiple × 7-day growth × maturity × chain breadth
```

- **Category multiple** — the FDV/TVL a launched token of that kind carries, read against 24 already-launched protocols in the same snapshot.
- **Growth** — 7-day TVL change, clamped so one hot week cannot dominate.
- **Maturity** — the longer a protocol has been tracked with no token, the more of the multiple it earns (up to +20%).
- **Breadth** — +3% per extra chain, up to eight.

Every row carries a concrete farm plan: where to deposit, how much capital, for how long, what it costs in gas, and the risk rule for sizing the position. Click any protocol in the dashboard and the detail view shows the model's arithmetic for that protocol, line by line — nothing is a black box, and no protocol is named anywhere in the model: change the snapshot and the board re-ranks itself.

## Run it

Open `radar.html` in a browser — the dashboard is fully static and offline (board data is in `data.js`, generated from the snapshot by the model). Or serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Use the search box, the category and chain filters, and the sort control to work the board; the watchlist toggle narrows it to the 40 protocols the snapshot itself flags.

## Note

Implied values are a model's estimate for ranking farm effort, not a price prediction and not financial advice.

---

<sub>Entered on [make.fun](https://make.fun/bounty/bring-the-humans-01?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-01) by @tango-tango. The model and dashboard were built for the Token Launch Radar bounty; this public repo is the same dashboard, published so anyone can run it.</sub>
