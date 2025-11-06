// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PatterstoneCase {
  address owner;
  uint256 public evidenceCount;
  
  constructor() { owner = msg.sender; }
  
  function registerEvidence(string memory id, string memory hash) external {
    evidenceCount++;
  }
}