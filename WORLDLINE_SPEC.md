# WORLDLINE_SPEC.md
_Unykorn Worldline v1 – Asset Physics for a Very Human Universe_

---

## 0. Spirit of the System

At ground level, money looks like:  
- balances,  
- ledgers,  
- contracts,  
- lawyers,  
- regulators,  
- and a lot of stressed-out humans.

At a higher zoom, it’s just:

> **state changes in a field** – bits flipping, energy moving, stories being updated.

In this spec, we treat every serious asset as a **worldline**:

- Not just a token, not just a balance,
- but a **continuous story** of a single thing moving through time:
  - its anchors in reality,
  - its risk and yield “frequency,”
  - its legal and ethical “polarization,”
  - its lifecycle “phase,”
  - and its “entanglements” with other things.

We borrow language from quantum physics not to be cute, but because it’s **structurally useful**:

- There is no “unique photon object” – only configurations of the field.
- Likewise, there is no mystical “one true asset” – only:
  - what we can anchor,  
  - what we can track,  
  - and what we can consistently reason about.

**Worldline** is Unykorn’s way to say:

> “If it matters, it has a twin.  
> If it has a twin, it has a worldline.  
> If it has a worldline, we can see and govern its entire path.”

This document is the **v1 spec** for that.

It has two moods:

- **Narrative** – to align humans, investors, and regulators.
- **Mechanical** – to align Solidity, indexers, AI agents, and bridges.

Both are intentional. Both are part of the same worldline.

---

## 1. Core Narrative Concepts

These are conceptual, but we’ll map them directly into code fields in later sections.

### 1.1 Class vs Worldline

- **Class** = what *kind* of thing this is.  
  - “Gold-backed vault position”
  - “Bankruptcy claim”
  - “Mining royalty”
  - “CBDC reserve pool”
  - “Stablecoin liability bucket”

- **Worldline** = the *one particular instance* of that class across time.  
  - This exact vault lot.  
  - This specific claim NFT.  
  - This particular pool of CBDC reserves.

A token is a **frame**.  
A worldline is the **full movie**.

---

### 1.2 The Four Quantum Attributes (Mapped to Finance)

We mirror four quantum-ish ideas:

1. **Frequency (Energy)**  
   - How does this worldline “vibrate” economically?
   - Yield, cashflow cadence, volatility profile.

2. **Polarization (Orientation)**  
   - Which legal / regulatory / ethical fields does it align with?
   - Jurisdictions, regimes, Shariah / ESG / etc.

3. **Phase (Lifecycle Position)**  
   - Where in its life-cycle is it right now?
   - Originated? Active? Locked? Defaulted? Redeemed?

4. **Entanglement (Relationships)**  
   - What other worldlines is it bound to?
   - Collateral, pools, wraps, tranches, derivatives.

This becomes the **state vector** of a worldline.

You don’t have a unique “object” in the metaphysical sense.  
You have a **unique configuration of the field plus history.**

Worldline v1 says: *let’s make that configuration explicit, machine-readable, and indexable.*

---

### 1.3 Anchors: Staying on Earth

We **refuse** to float off into pure abstraction.

Every serious worldline must be rooted in at least one **anchor**:

- SKR + vault certificate + appraisal (for gold).
- Court docket + claim number + assignment agreements (for bankruptcy claims).
- Land deed + survey + corporate docs (for real estate).
- Central bank statements + node attestations (for CBDC reserves).

Without an anchor, it’s not a worldline. It’s just lore.

---

## 2. Formal Definitions

Now we flip into **senior engineer mode**.

### 2.1 Identifiers

#### 2.1.1 ClassId

```text
classId: bytes32 = keccak256(utf8("RWA.GOLD.VAULT_V1"))
````

Convention:

* Namespace: `Domain.Subdomain.Type_Version`

  * `RWA.GOLD.VAULT_V1`
  * `RWA.CLAIM.BANKRUPTCY_V1`
  * `RWA.ROYALTY.MINING_V1`
  * `FIAT.STABLE.TGUSD_V1`
  * `CBDC.RESERVE_POOL_V1`

Each class defines what’s allowed for that type of worldline.

---

#### 2.1.2 AnchorRef

```text
anchorRef: bytes32 = keccak256(canonical_anchor_blob)
```

Canonical anchor blob SHOULD include:

* Human identifiers (claim #, SKR #, deed #).
* Off-chain pointers (IPFS CIDs, URLs).
* Optional notarization / PGP signatures.
* Version string of the anchor format.

---

#### 2.1.3 WorldlineId

```text
worldlineId: bytes32
```

Recommended derivation:

```text
worldlineId = keccak256(
  abi.encodePacked(
    classId,
    anchorRef,
    originChainId,   // e.g. 7777 for Unykorn L1
    originNonce      // per-class increment or random
  )
)
```

Requirement: **globally unique** and stable.

---

### 2.2 Worldline State Vector

The state vector is the compact representation of:

> Frequency + Polarization + Phase + Entanglements.

In pseudotype:

```ts
WorldlineState {
  frequency:    Frequency;
  polarization: Polarization;
  phase:        Phase;
  entanglements: EntanglementRef[];
}
```

---

#### 2.2.1 Frequency (Economic Energy)

```ts
Frequency {
  yieldBps:        uint32; // 100 = 1.00%, 800 = 8.00%
  cashflowCadence: uint8;  // 0=NONE,1=DAILY,2=WEEKLY,3=MONTHLY,4=QUARTERLY,5=ANNUAL,9=EVENT_DRIVEN
  volatilityBand:  uint8;  // 0=LOW,1=MEDIUM,2=HIGH,3=EXTREME
}
```

Interpretation:

* `yieldBps` – indicative “energy level.”
* `cashflowCadence` – rhythm of outgoing value.
* `volatilityBand` – rough shock potential.

This is **not** legal promise language; it’s a **signal layer** for AI, routers, and dashboards.

---

#### 2.2.2 Polarization (Regulatory / Ethical Orientation)

```ts
Polarization {
  jurisdictions: bytes32[]; // keccak256("US"), "EU", "AE", etc.
  regimes:       bytes32[]; // keccak256("RegD506c"), "RegS", "MiCA", "Shariah"
  ethicsTags:    bytes32[]; // keccak256("ESG+"), "FOSSIL", "HALAL", etc.
}
```

Use-cases:

* Route only between compatible polarizations (e.g., US RegD only → US RegD/RegS-compatible pools).
* Screen out assets conflicting with an investor’s ethical filters.
* Identify what can / cannot be offered in specific jurisdictions.

---

#### 2.2.3 Phase (Lifecycle Stage)

```ts
enum PhaseState {
  ORIGINATED,
  ONCHAIN_ACTIVE,
  LOCKED,
  IN_DEFAULT,
  LITIGATION,
  RESTRUCTURING,
  SETTLED,
  REDEEMED,
  ARCHIVED
}

Phase {
  state: PhaseState;
  since: uint64;   // unix timestamp
}
```

Each **WorldlineClass** should define its own **phase state machine**, e.g.:

* `RWA.GOLD.VAULT_V1`:

  * `ORIGINATED → ONCHAIN_ACTIVE → LOCKED → REDEEMED → ARCHIVED`

* `RWA.CLAIM.BANKRUPTCY_V1`:

  * `ORIGINATED → ONCHAIN_ACTIVE → LITIGATION → SETTLED → REDEEMED → ARCHIVED`

Phase is what tells your system: “can this move, yield, be pledged, or is it spiritually stuck?”

---

#### 2.2.4 Entanglements (Graph Relationships)

```ts
EntanglementRef {
  relType:         bytes32; // keccak256("COLLATERAL_FOR"), "POOL_MEMBER", "WRAP_OF", etc.
  targetWorldline: bytes32; // worldlineId of the partner
}
```

Standard `relType` values:

* `COLLATERAL_FOR` – this worldline secures another.
* `SECURED_BY` – inverse of collateral_for.
* `POOL_MEMBER` – member of a fund / pool.
* `POOL_PARENT` – the pool itself.
* `WRAP_OF` – wrapped representation of another worldline.
* `TRANCHE_OF` – tranche relationship from a base worldline.
* `DERIVED_FROM` – generic split/merge/derivative.

The **entanglement graph** is where the fun lives:
collateral chains, capital stacks, wrapped assets, fund memberships – all explicit.

---

## 3. On-Chain Interface: Worldline Registry v1

We keep the on-chain interface **minimal but precise**. Heavy lifting can live off-chain.

### 3.1 Solidity Interface

```solidity
pragma solidity ^0.8.0;

interface IWorldlineRegistryV1 {
    event WorldlineCreated(
        bytes32 indexed worldlineId,
        bytes32 indexed classId,
        bytes32 indexed anchorRef,
        bytes   initialStateCid
    );

    // fieldMask bit flags:
    // 1 = frequency, 2 = polarization, 4 = phase, 8 = entanglements
    event WorldlineUpdated(
        bytes32 indexed worldlineId,
        uint8   fieldMask,
        bytes   newStateCid
    );

    event WorldlineEntangled(
        bytes32 indexed sourceWorldline,
        bytes32 indexed targetWorldline,
        bytes32 relType
    );

    struct MinimalWorldlineMeta {
        bytes32 classId;
        bytes32 anchorRef;
    }

    function getWorldlineMeta(bytes32 worldlineId)
        external
        view
        returns (MinimalWorldlineMeta memory);
}
```

Asset contracts (vaults, claims, stablecoins, CBDC bridges) **should** call into this registry when:

* Creating new worldlines,
* Updating states,
* Adding entanglements.

---

## 4. Off-Chain Canonical State

Each `initialStateCid` / `newStateCid` should resolve to a blob like:

```json
{
  "version": "worldline-state-v1",
  "worldlineId": "0x...",
  "classId": "0x...",
  "anchorRef": "0x...",
  "frequency": {
    "yieldBps": 800,
    "cashflowCadence": 3,
    "volatilityBand": 1
  },
  "polarization": {
    "jurisdictions": ["0x..."],
    "regimes": ["0x..."],
    "ethicsTags": ["0x..."]
  },
  "phase": {
    "state": "ONCHAIN_ACTIVE",
    "since": 1730518992
  },
  "entanglements": [
    {
      "relType": "0x...",
      "targetWorldline": "0x..."
    }
  ],
  "timestamp": 1730518992,
  "chainId": 7777,
  "txHash": "0x..."
}
```

The **Worldline Indexer** is responsible for:

* Validating CIDs.
* Building the latest state per worldline.
* Maintaining the entanglement graph.

---

## 5. Outside Snippets: Real Asset Examples

### 5.1 Gold Vault Backing Stablecoin & Sukuk

**Class**: `RWA.GOLD.VAULT_V1`
**Anchor**: SKR + vault certificate + appraisal + KYC hash.

```json
{
  "frequency": {
    "yieldBps": 0,
    "cashflowCadence": 0,
    "volatilityBand": 0
  },
  "polarization": {
    "jurisdictions": ["US", "AE"],
    "regimes": ["RegD506c", "RegS"],
    "ethicsTags": ["HALAL"]
  },
  "phase": {
    "state": "ONCHAIN_ACTIVE",
    "since": 1730518992
  },
  "entanglements": [
    {
      "relType": "COLLATERAL_FOR",
      "targetWorldline": "worldline_FTHSUKUK_01"
    },
    {
      "relType": "BACKS",
      "targetWorldline": "worldline_TGUSD_POOL_01"
    }
  ]
}
```

Story view:

> “This specific bar of gold sits in a vault in the real world, is Shariah-compliant, and backs both a sukuk and a stablecoin pool.”

---

### 5.2 Bankruptcy Claim

**Class**: `RWA.CLAIM.BANKRUPTCY_V1`
**Anchor**: court docket + claim forms + assignment.

```json
{
  "frequency": {
    "yieldBps": 0,
    "cashflowCadence": 9,
    "volatilityBand": 2
  },
  "phase": {
    "state": "LITIGATION",
    "since": 1730518992
  },
  "entanglements": [
    {
      "relType": "POOL_MEMBER",
      "targetWorldline": "worldline_CLAIMPOOL_FTX_01"
    },
    {
      "relType": "COLLATERAL_FOR",
      "targetWorldline": "worldline_CREDIT_LINE_07"
    }
  ]
}
```

Story view:

> “This specific claim is in litigation, belongs to an FTX claim pool, and is pledged as collateral on a credit line.”

---

### 5.3 Mining Royalty

**Class**: `RWA.ROYALTY.MINING_V1`
**Anchor**: NI 43-101 style report + royalty agreements + SPV docs.

```json
{
  "frequency": {
    "yieldBps": 1500,
    "cashflowCadence": 3,
    "volatilityBand": 1
  },
  "polarization": {
    "jurisdictions": ["CL", "US"],
    "regimes": ["RegD506c"],
    "ethicsTags": ["ESG-"]
  },
  "phase": {
    "state": "ONCHAIN_ACTIVE",
    "since": 1730518992
  },
  "entanglements": [
    {
      "relType": "POOL_MEMBER",
      "targetWorldline": "worldline_FUND_KINGFISHER_I"
    },
    {
      "relType": "COLLATERAL_FOR",
      "targetWorldline": "worldline_NOTE_2027_01"
    }
  ]
}
```

Story view:

> “A live mining royalty feeding a fund, which in turn backs a note. Every step visible, not mystical.”

---

### 5.4 CBDC Reserve Pool

**Class**: `CBDC.RESERVE_POOL_V1`
**Anchor**: central bank statements + node attestations.

Used as:

* Worldline representing reserve pool backing digital liabilities,
* Bridge between ISO 20022 messages and Unykorn’s field model.

---

## 6. ISO 20022 / CBDC Integration

Worldline doesn’t replace ISO 20022; it **wraps it with meaning**.

Pattern:

* ISO messages (`pacs.008`, `pacs.009`, etc.) carry:

  * debtor/creditor accounts,
  * amounts,
  * references.

We add:

* `worldlineId(s)` in structured remittance or extension fields.

The **Worldline ISO Bridge**:

1. Reads ISO messages from banks / RTGS / CBDC systems.
2. Maps accounts → worldlines (liability and asset worldlines).
3. Emits `WorldlineUpdated` and `WorldlineEntangled` as needed.

From your POV:

> ISO is the **wire protocol**.
> Worldline is the **physics and narrative**.

---

## 7. Product Stack

Worldline v1 is meant to be implemented as a full stack:

1. **Worldline Registry (On-Chain)**

   * Implements `IWorldlineRegistryV1`.
   * Enforces who can mint / update which classes.
   * Optionally stores minimal metadata.

2. **Worldline Indexer (Off-Chain)**

   * Consumes registry & asset contract events.
   * Resolves CIDs to full state.
   * Maintains:

     * latest state per worldline,
     * entanglement graph,
     * time series for phase transitions.

3. **Worldline Explorer (UI)**

   * Search by `worldlineId`, anchor attributes, class, polarization, etc.
   * Show:

     * state vector,
     * lifecycle timeline,
     * entanglement graph (neighbors).

4. **Worldline AI Layer**

   * Agents that reason over:

     * frequency (yield / cadence / risk),
     * polarization (jurisdiction/regime fit),
     * phase (lifecycle, distress),
     * entanglements (collateral, pools, wraps).
   * Use-cases:

     * portfolio construction,
     * compliance screening,
     * opportunity detection,
     * anomaly / broken-wrap detection.

5. **Worldline ISO/CBDC Bridge**

   * Binds ISO 20022 / CBDC message flows into worldline events.

---

## 8. Guardrails & Discipline

To keep this “spiritually aligned but not unhinged”:

1. **Anchor Required**

   * Every worldline MUST have at least one AnchorRef.
   * No anchor = no serious worldline.

2. **Explainable State Changes**

   * Every `WorldlineUpdated` should map to:

     * a transaction,
     * a doc/oracle event,
     * or a clear class-defined process.

3. **Phase Discipline**

   * Phase transitions MUST follow each class’s defined state machine.

4. **Explicit Entanglements**

   * No hidden magic; all relationships are typed and visible.

5. **Stable WorldlineId**

   * Once minted, a worldlineId is immutable and tracks the whole story.

---

## 9. Implementation Roadmap

Short version of what comes next:

1. Implement `WorldlineRegistryV1` on Unykorn L1 (Chain ID 7777).
2. Add worldlines to:

   * one hard-asset RWA (e.g., gold or energy),
   * one claim/credit (e.g., bankruptcy or structured note).
3. Build a **Worldline Indexer** (Node/TS + DB or The Graph).
4. Ship **Worldline Explorer v0.1**.
5. Add a simple **AI Worldline Agent**:

   * filter by frequency/polarization,
   * flag inconsistent entanglements/phase.
6. Wire a pilot **ISO 20022 / CBDC test harness** into the bridge.

This is v1. It’s meant to be stable and boring under the hood,
so you can go as wild as you want with underdog-rocky-billionaire strategies on top.

---

## 10. Implementation Guide (Senior Engineer Mode)

This section provides a concrete path to ship Worldline v1 as a proper SR-level architecture, not just a spec.

### 10.1 Map the Worldline Infrastructure Stack

Think in **layers**. At SR level you want a clean mental model, not a blob of Solidity.

#### Layer 0 – Existing Asset Contracts (what you already have)

This is your current universe:

* VaultProofNFT / vault contracts (gold, energy, land, etc.)
* Stablecoins (TGUSD / FTHUSD / whatever)
* Sukuk / notes / claim NFTs
* Any CBDC-like reserve contracts or bridges

We **do not** throw these away. We wrap and extend.

#### Layer 1 – Worldline Core Contracts

This is the new “physics layer” on-chain:

1. **WorldlineRegistryV1**

   * Canonical emitter of:

     * `WorldlineCreated`
     * `WorldlineUpdated`
     * `WorldlineEntangled`
   * Stores minimal metadata: `classId`, `anchorRef`.
   * Ownable / AccessControlled so only approved contracts can register.

2. **WorldlineClassRegistry (optional, but SR-level nice)**

   * Registry for **class definitions**:

     * `classId -> allowed phase transitions`
     * allowed entanglement types
     * version info
   * Makes things auditable: “what does RWA.GOLD.VAULT_V1 mean, formally?”

3. **WorldlineAdapters**

   * Per-asset-type adapter contracts that sit next to existing logic:

     * E.g. `GoldVaultWorldlineAdapter`
     * `ClaimWorldlineAdapter`
     * `MiningRoyaltyWorldlineAdapter`
   * They translate “local events” (mint, deposit, transfer, default, payout) into:

     * worldline state updates
     * entanglement events

Either:

* Asset contracts call adapters on key events, or
* Adapters subscribe via pattern / indexer, but on-chain is cleaner.

#### Layer 2 – Off-Chain Indexers & Graph

1. **Worldline Indexer**

   * A service (Node/TS, Rust, whatever) that:

     * Listens to `WorldlineRegistry` events
     * Resolves IPFS/Arweave CIDs for state blobs
     * Stores normalized worldline states in a DB (Postgres/Clickhouse)
     * Builds the entanglement graph (edge table)

2. **Class / Policy Store**

   * Holds:

     * per-class rules (phases, valid entanglements)
     * jurisdiction/regime dictionaries
   * Used by AI & policy engines.

#### Layer 3 – APIs & Explorer

1. **Worldline API**

   * REST/GraphQL endpoints:

     * `GET /worldlines/:id`
     * `GET /worldlines?classId=...&phase=...`
     * `GET /worldlines/:id/entanglements`
   * This is what other systems and your own frontend hit.

2. **Worldline Explorer UI**

   * React/Tailwind frontend:

     * Search bar
     * Worldline detail page (frequency, polarization, phase, entanglement graph)
     * Filter views (by asset type, jurisdiction, risk)

#### Layer 4 – AI + ISO/CBDC Bridges

1. **Worldline AI Agents**

   * Microservices / jobs that:

     * query the Worldline API,
     * infer risk, opportunities, anomalies,
     * write recommended actions or flags back (not on-chain; as metadata, dashboards, alerts).

2. **ISO/CBDC Bridge Service**

   * Listens to:

     * ISO 20022 messages (pacs.008, etc.) from sims or partner banks
   * Maps:

     * account IDs → worldline IDs
   * Updates worldlines:

     * marking cashflows, phase changes, entanglements.

This mapping shows: Worldline is **not “just more contracts”**. It’s an entire asset-model layer with observability and AI hooks.

### 10.2 How to Implement It Cleanly

#### Step 1 – Treat WORLDLINE_SPEC as the RFC

You already have `WORLDLINE_SPEC.md`.

At SR level, you treat it like an **RFC**:

* Version it (`v1.0.0`)
* Include:

  * Problem statement
  * Vocabulary
  * Data model
  * Event interface
  * Backwards compatibility notes
* Commit it at the root of a new repo: `worldline-protocol`.

This becomes the doc you send to other engineers / labs.

#### Step 2 – Core Solidity Interfaces

Create a small Solidity package:

**`contracts/interfaces/IWorldlineRegistryV1.sol`**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IWorldlineRegistryV1 {
    event WorldlineCreated(
        bytes32 indexed worldlineId,
        bytes32 indexed classId,
        bytes32 indexed anchorRef,
        bytes   initialStateCid
    );

    // bitmask: 1=frequency,2=polarization,4=phase,8=entanglements
    event WorldlineUpdated(
        bytes32 indexed worldlineId,
        uint8   fieldMask,
        bytes   newStateCid
    );

    event WorldlineEntangled(
        bytes32 indexed sourceWorldline,
        bytes32 indexed targetWorldline,
        bytes32 relType
    );

    struct MinimalWorldlineMeta {
        bytes32 classId;
        bytes32 anchorRef;
    }

    function getWorldlineMeta(bytes32 worldlineId)
        external
        view
        returns (MinimalWorldlineMeta memory);
}
```

**`contracts/WorldlineRegistryV1.sol`** implements that, with:

* `mapping(bytes32 => MinimalWorldlineMeta)`
* `onlyOwner`-style access control for `createWorldline` and `updateWorldline` (or a Role-based via AccessControl).

#### Step 3 – Adapters for Existing Assets

Pick **one vertical slice** first. Example: gold vault backing stablecoin + sukuk.

Create:

`GoldVaultWorldlineAdapter.sol`

Responsibilities:

* `function registerVaultWorldline(...)` – called when a new vault position is created:

  * calculates `classId = keccak256("RWA.GOLD.VAULT_V1")`
  * computes `anchorRef` from SKR/doc hash
  * derives `worldlineId`
  * calls `WorldlineRegistry.createWorldline(...)`

* `function updatePhase(...)` – called on events:

  * `LOCKED` when collateralized
  * `REDEEMED` when closed
  * builds new state JSON → pins to IPFS → passes CID into `WorldlineUpdated`

* `function entangleWithStablecoinPool(...)` – called when vault is linked to stablecoin reserve:

  * triggers `WorldlineEntangled(vaultWorldlineId, poolWorldlineId, keccak256("BACKS"))`

You don’t have to IPFS from inside Solidity; you can:

* Emit a minimal on-chain event with a “pending state hash” and let an off-chain signer/relayer finalize and call `WorldlineUpdated` with the CID. Lots of patterns there.

#### Step 4 – Testing Like an Adult

Use **Foundry** or Hardhat, but SR-level testing should include:

* Unit tests:

  * `WorldlineRegistry`:

    * creation, updates, entanglement events,
    * permission checks.
  * Adapters:

    * correct `worldlineId` derivation,
    * fieldMask correct on updates.

* Invariant tests:

  * worldlineId uniqueness
  * classId immutability per worldline
  * no illegal phase transitions (enforce via class rules if stored on-chain)

* Scenario tests:

  * full “gold vault → sukuk + stablecoin” lifecycle:

    * origin → entangle → phase changes → redeem → archive.

If you show a CBDC lab a repo with `WORLDLINE_SPEC.md + contracts/ + test/` and clean invariants, they know you’re not just vibing.

#### Step 5 – Indexer + Explorer MVP

**Indexer**:

* Start a simple Node/TypeScript service:

  * Uses `ethers.js` or `viem` to subscribe to `WorldlineRegistry` events;
  * Resolves `initialStateCid` / `newStateCid` (IPFS HTTP gateway);
  * Stores:

    * `worldlines` table
    * `states` table (history)
    * `entanglements` table

Schema sketch:

```sql
worldlines(
  worldline_id  bytea primary key,
  class_id      bytea,
  anchor_ref    bytea,
  created_at    timestamptz
);

worldline_states(
  id           serial primary key,
  worldline_id bytea references worldlines,
  state_cid    text,
  raw_json     jsonb,
  created_at   timestamptz
);

worldline_edges(
  id                 serial primary key,
  source_worldline   bytea,
  target_worldline   bytea,
  rel_type           bytea,
  created_at         timestamptz
);
```

**Explorer**:

* React/Tailwind SPA:

  * `/worldline/:id` page:

    * summary (class, anchor snippet)
    * frequency panel
    * polarization badges
    * lifecycle timeline (phase history)
    * entanglement graph (neighbor list, simple d3/force).

Don’t overbuild; just one vertical slice working end-to-end is enough to impress.

### 10.3 How to Get Senior Engineers / Labs to Pay Attention

You don’t get them with “worldline is like spacetime.”
You get them with **pain relief** and **differentiated capability**.

#### A. Frame Their Pain First

For CBDC/RWA/infra teams, the problems are:

* Assets are scattered across contracts with no unified model.
* Hard to answer questions like:

  * “Show me all Reg D, Shariah-compliant assets in phase ‘in_default’ entangled with Fund X.”
  * “Trace the full collateral chain behind this stablecoin pool.”
* Their data is:

  * not AI-ready,
  * not graph-modeled,
  * not lifecycle-aware.

You position Worldline as:

> “An asset model + event standard that gives you lifecycle & relationship traceability across all your on-chain RWA/stablecoin/CBDC objects.”

That’s very senior-engineer / architect-bait.

#### B. Show a Vertical Slice That’s Impossible Today

Best way to justify direction: **demo something they *can’t* do right now without a huge data team**.

Example demo:

* Seed your testnet with:

  * 3 gold vault worldlines
  * 1 sukuk worldline
  * 1 stablecoin reserve pool worldline
  * 1 mining royalty worldline
  * 1 claim pool worldline

Then show:

* In the Explorer:

  * Click on a stablecoin pool worldline → see:

    * which vault worldlines it’s backed by,
    * their jurisdictions & regimes,
    * their phase status.
* Run a query (via Explorer or CLI):

  * “List all active, Shariah-compliant worldlines with yield > 8%, in AE/US, that are collateral for any note maturing after 2027.”
* Show an AI agent summary:

  * “Summarize the exposure of Fund X to defaulted claims and list the entangled worldlines.”

This is the “holy ****, that’s actually useful” moment.

#### C. Package It Like a Standard + SDK, Not Just “Our Thing”

Senior folks are allergic to “proprietary weirdness.”
So:

* Publish `WORLDLINE_SPEC.md` as a protocol doc (even if only you implement it at first).
* Make a small SDK:

  * `@worldline-protocol/contracts` (npm package with interfaces)
  * `@worldline-protocol/client` (API/TS client)

Now you’re not just some random infra: you’re:

> “Worldline v1 – an open asset lifecycle & relationship model for RWA, stablecoins, and CBDCs.”

#### D. Who you target inside institutions

You don’t pitch this to “marketing” or “generic product.” You aim for:

* **Lead architect / head of digital assets**
* **CBDC / RWA project tech lead**
* **Innovation lab architect**

They care about:

* clean models,
* composable contracts,
* observability & traceability,
* “how do we explain this to regulators.”

Your pitch deck / README should be basically:

* Slide 1: “Assets as worldlines – one consistent model for RWA/stablecoins/CBDC.”
* Slide 2: “What a worldline looks like (fields).”
* Slide 3: “Current mess vs. worldline graph.”
* Slide 4: “Reference implementation (Unykorn), already live.”
* Slide 5: “How your system integrates (adapters, events, APIs).”

### 10.4 Concrete Next Moves

If I were you, I’d do this in order:

1. **New repo:** `worldline-protocol`

   * Add `WORLDLINE_SPEC.md`
   * Add Solidity interfaces + minimal `WorldlineRegistryV1.sol`
   * Add Foundry tests

2. **New repo or folder:** `worldline-gold-demo`

   * Import protocol package
   * Adapter for `RWA.GOLD.VAULT_V1`
   * End-to-end tests:

     * create vault worldline
     * entangle with sukuk and stablecoin pool
     * phase transitions

3. **Simple Indexer + Explorer**

   * One small service + one small UI
   * Hardcode a fake dataset if needed at first, then wire on-chain

4. **One-page “Worldline for Architects” PDF/README**

   * No metaphysics, just:

     * problem → model → events → demo.

5. **Then you go hunting**

   * When you talk to FIs / labs / RWA partners, you don’t say:

     * “I have a vibe.”
   * You say:

     * “We’ve defined a lifecycle + entanglement standard for RWAs/stablecoins/CBDCs. We have a working reference on-chain, indexer, and explorer. Let me show you how your product maps into worldlines in 15 minutes.”

That’s the gap between cosmic vision and “SR architect nodding and forwarding your doc to their team.”

You already have the narrative. This is the skeleton that makes it undeniable.
