const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VBModule", (m) => {
  const vBtest = m.contract("VBTest");

  return { vBtest };
});