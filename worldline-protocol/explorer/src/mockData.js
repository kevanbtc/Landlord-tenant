const demoWorldlines = [
  {
    "worldlineId": "WL_VAULT_GOLD_42",
    "classId": "RWA.GOLD.VAULT_V1",
    "anchorRef": "0xanchor_vault42",
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
    "phaseHistory": [
      {
        "state": "ORIGINATED",
        "since": "2024-01-15T10:00:00Z"
      },
      {
        "state": "ONCHAIN_ACTIVE",
        "since": "2024-02-01T09:30:00Z"
      },
      {
        "state": "LOCKED",
        "since": "2024-03-15T12:00:00Z"
      },
      {
        "state": "IN_DEFAULT",
        "since": "2024-06-05T08:45:00Z"
      }
    ],
    "currentPhase": "IN_DEFAULT",
    "entanglements": [
      {
        "relType": "BACKS",
        "targetWorldline": "WL_POOL_TGUSD_MAIN"
      },
      {
        "relType": "COLLATERAL_FOR",
        "targetWorldline": "WL_NOTE_SUKUK_01"
      }
    ],
    "extra": {
      "asset": "London Good Delivery Gold Bar",
      "amountOz": 1000,
      "latestAppraisalUsd": 2300000
    }
  },
  {
    "worldlineId": "WL_POOL_TGUSD_MAIN",
    "classId": "FIAT.STABLE.TGUSD_POOL_V1",
    "anchorRef": "0xanchor_tgusd_pool_main",
    "frequency": {
      "yieldBps": 250,
      "cashflowCadence": 3,
      "volatilityBand": 0
    },
    "polarization": {
      "jurisdictions": ["US"],
      "regimes": ["TrustStructure"],
      "ethicsTags": []
    },
    "phaseHistory": [
      {
        "state": "ONCHAIN_ACTIVE",
        "since": "2024-01-20T11:00:00Z"
      }
    ],
    "currentPhase": "ONCHAIN_ACTIVE",
    "entanglements": [
      {
        "relType": "BACKED_BY",
        "targetWorldline": "WL_VAULT_GOLD_42"
      },
      {
        "relType": "BACKED_BY",
        "targetWorldline": "WL_VAULT_GOLD_17"
      }
    ],
    "extra": {
      "tokenSymbol": "TGUSD",
      "circulatingSupply": 1500000,
      "overcollateralizationRatio": 1.25
    }
  },
  {
    "worldlineId": "WL_NOTE_SUKUK_01",
    "classId": "RWA.NOTE.SUKUK_V1",
    "anchorRef": "0xanchor_sukuk01",
    "frequency": {
      "yieldBps": 800,
      "cashflowCadence": 3,
      "volatilityBand": 1
    },
    "polarization": {
      "jurisdictions": ["AE"],
      "regimes": ["ShariahBoardApproved"],
      "ethicsTags": ["HALAL"]
    },
    "phaseHistory": [
      {
        "state": "ONCHAIN_ACTIVE",
        "since": "2024-02-10T09:00:00Z"
      }
    ],
    "currentPhase": "ONCHAIN_ACTIVE",
    "entanglements": [
      {
        "relType": "COLLATERALIZED_BY",
        "targetWorldline": "WL_VAULT_GOLD_42"
      },
      {
        "relType": "HELD_BY",
        "targetWorldline": "WL_FUND_INCOME_X"
      }
    ],
    "extra": {
      "notionalUsd": 1000000,
      "couponBps": 800,
      "maturityDate": "2028-01-01"
    }
  },
  {
    "worldlineId": "WL_FUND_INCOME_X",
    "classId": "RWA.FUND.INCOME_V1",
    "anchorRef": "0xanchor_fund_income_x",
    "frequency": {
      "yieldBps": 900,
      "cashflowCadence": 3,
      "volatilityBand": 1
    },
    "polarization": {
      "jurisdictions": ["US"],
      "regimes": ["RegD506c"],
      "ethicsTags": []
    },
    "phaseHistory": [
      {
        "state": "ONCHAIN_ACTIVE",
        "since": "2024-02-20T10:00:00Z"
      }
    ],
    "currentPhase": "ONCHAIN_ACTIVE",
    "entanglements": [
      {
        "relType": "HOLDS",
        "targetWorldline": "WL_NOTE_SUKUK_01"
      }
    ],
    "extra": {
      "aumUsd": 5000000,
      "investorCount": 23
    }
  }
];

export default demoWorldlines;
