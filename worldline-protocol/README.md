# Worldline for Architects

## What is Worldline?

Worldline is a **lifecycle + relationship model** for real-world assets, stablecoins, and CBDC-like balances.

Each serious asset instance is represented as a **worldline**:
- anchored to legal/physical reality,
- described by yield profile, jurisdiction/regime alignment, lifecycle phase,
- and explicitly linked to other assets (collateral, pools, wraps, tranches).

## Why does it exist?

Most digital asset systems today expose:
- tokens,
- balances,
- isolated contracts.

They do **not** expose:
- a unified way to trace an asset through its entire lifecycle, or
- a graph of how assets relate (who backs what, who is collateral for what).

Worldline provides that missing layer.

## What are the main components?

**On-chain**

- `WorldlineRegistryV1`
  - Emits `WorldlineCreated`, `WorldlineUpdated`, `WorldlineEntangled` events.
  - Stores minimal metadata per worldline (`classId`, `anchorRef`, `createdAt`).
  - Called by asset-specific adapters (gold vault, claims, royalties, CBDC reserves).

- `WorldlineClassRegistry`
  - Defines per-class rules: allowed phases, transitions, entanglements.
  - Enables validation and auditability.

- Asset Adapters
  - Small contracts that live next to existing RWA / stablecoin / CBDC contracts.
  - Translate local events (mint, lock, default, redeem) into worldline events.

**Off-chain**

- Worldline Indexer
  - Listens to registry events, resolves IPFS CIDs, stores normalized state.
  - Maintains an asset graph (entanglements) and a time-series per worldline.

- Worldline Explorer
  - UI to search and inspect worldlines: frequency, jurisdiction/regime, phase, graph.

- AI / Policy Layer
  - Agents that reason over the worldline graph for:
    - exposure analysis,
    - compliance checks,
    - opportunity detection,
    - anomaly / broken-wrap detection.

## How does this integrate with our system?

You map each of your core asset types to a **WorldlineClass**:

- e.g. `RWA.GOLD.VAULT_V1`, `RWA.CLAIM.BANKRUPTCY_V1`, `CBDC.RESERVE_POOL_V1`.

For each class:

1. Implement a small adapter contract that:
   - creates a worldline when a new asset instance is originated,
   - updates it on lifecycle changes,
   - records entanglements when assets back, wrap, or pool each other.

2. Deploy the shared `WorldlineRegistryV1` contract once per network.

3. Run the Worldline indexer and Explorer to gain:
   - a graph view of your assets,
   - lifecycle-aware analytics,
   - AI-ready structured data.

## What does this buy us?

- A consistent asset model across heterogeneous contracts.
- A clear story per asset for regulators, auditors, and AI systems.
- The ability to answer questions like:
  - “Show all active, Shariah-compliant, Reg D assets backing this stablecoin pool.”
  - “Trace the full collateral chain behind this CBDC reserve.”
  - “List all worldlines in default that are entangled with Fund X.”

Worldline is not a replacement for your existing contracts or ISO 20022 flows.  
It’s the **asset semantics layer** that sits above them and makes the whole system legible.

## Pilot Plan

To prove direction, run a 3–4 month pilot:

- **Scope**: 1 asset class (gold vault or mining royalty), 2 instruments (note + pool), 1 network, 1 external partner.
- **Deliverables**: Registry deployed, adapter wired, indexer running, Explorer with graph, AI dashboard for queries.
- **Success**: Queries that used to take a week now take 5 seconds.

This justifies the direction with real pain relief, not vibes.
