export const contractAddress = "0xfbc5fbe823f76964de240433ad00651a76c672c8";

export const abi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "caseId",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "result",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      }
    ],
    "name": "CaseCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "caseId",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "seed",
        "type": "uint256"
      }
    ],
    "name": "CaseStarted",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint8", "name": "caseId", "type": "uint8" },
      { "internalType": "uint8", "name": "result", "type": "uint8" }
    ],
    "name": "completeCase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint8", "name": "caseId", "type": "uint8" }],
    "name": "startCase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint8", "name": "", "type": "uint8" }
    ],
    "name": "playerCases",
    "outputs": [
      { "internalType": "uint256", "name": "seed", "type": "uint256" },
      { "internalType": "uint8", "name": "result", "type": "uint8" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bool", "name": "completed", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
