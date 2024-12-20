const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotingBlockModule", (m) => {
  const votingBlock = m.contract("VotingBlock");

  return { votingBlock };
});