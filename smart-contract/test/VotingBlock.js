const { ethers } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("VotingBlock", function () {
  async function deployVotingBlockFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

    const VotingBlock = await ethers.getContractFactory("VotingBlock");
    const votingBlock = await VotingBlock.deploy();
    await votingBlock.waitForDeployment();

    return { votingBlock, owner, user1, user2, user3 };
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { votingBlock } = await loadFixture(deployVotingBlockFixture);

      expect(await votingBlock.getAddress()).to.properAddress;
    });

    it("Should start with a session count of 0", async function () {
      const { votingBlock } = await loadFixture(deployVotingBlockFixture);

      expect(await votingBlock.votingSessionCount()).to.equal(0);
    });
  });

  describe("createVotingSession", function () {
    it("Should create a new voting session successfully", async function () {
      const { votingBlock } = await loadFixture(deployVotingBlockFixture);

      const title = "Best fruit";
      const candidates = ["Banana", "Watermelon"];
      const duration = 60;

      const tx = await votingBlock.createVotingSession(title, candidates, duration);
      const receipt = await tx.wait();

      const event = receipt.logs.map((log) =>
        votingBlock.interface.parseLog(log)
      ).find((parsed) => parsed.name === "VotingSessionCreated");

      expect(event).to.not.be.undefined;

      const sessionId = event.args.sessionId;
      expect(event.args.sessionId).to.equal(0);

      expect(await votingBlock.votingSessionCount()).to.equal(1);

      const sessionInfo = await votingBlock.getSessionInfo(sessionId);
      expect(sessionInfo.title).to.equal(title);
      expect(sessionInfo.candidates[0]).to.equal("Banana");
      expect(sessionInfo.candidates[1]).to.equal("Watermelon");
      expect(sessionInfo.isActive).to.equal(true);
      expect(sessionInfo.resultsCalculated).to.equal(false);
      expect(sessionInfo.startTimestamp).to.be.gt(0);
      expect(sessionInfo.endTimestamp).to.be.gt(sessionInfo.startTimestamp);
    });

    it("Should revert if less than two candidates are provided", async function () {
      const { votingBlock } = await loadFixture(deployVotingBlockFixture);

      await expect(
        votingBlock.createVotingSession("Best fruits", ["Banana"], 60)
      ).to.be.revertedWith("Need at least two candidates.");
    });

    it("Should revert if duration is 0", async function () {
      const { votingBlock } = await loadFixture(deployVotingBlockFixture);

      await expect(
        votingBlock.createVotingSession("Best fruit", ["Banana", "Watermelon"], 0)
      ).to.be.revertedWith("Duration must be greater than zero.");
    });

    it("Should revert if duplicate candidates are provided", async function () {
      const { votingBlock } = await loadFixture(deployVotingBlockFixture);

      await expect(
        votingBlock.createVotingSession("Best fruit", ["Banana", "Banana"], 60)
      ).to.be.revertedWith("Duplicate candidate found.");
    });
  });

  describe("vote", function () {
    async function createSessionFixture() {
      const fixtureData = await deployVotingBlockFixture();
      const { votingBlock } = fixtureData;

      const title = "Best fruit";
      const candidates = ["Banana", "Watermelon", "Papaya"];
      const duration = 60;

      await votingBlock.createVotingSession(title, candidates, duration);

      return { ...fixtureData, sessionId: 0, title, candidates };
    }

    it("Should allow a user to vote for a candidate", async function () {
      const { votingBlock, user1, sessionId } = await loadFixture(createSessionFixture);

      await expect(votingBlock.connect(user1).vote(sessionId, 1))
        .to.emit(votingBlock, "VoteCast")
        .withArgs(sessionId, user1.address, 1);

      const hasVoted = await votingBlock.hasVoted(sessionId, user1.address);
      expect(hasVoted).to.be.true;

      const tally = await votingBlock.getTally(sessionId);
      expect(tally[0]).to.equal(0);
      expect(tally[1]).to.equal(1);
      expect(tally[2]).to.equal(0);
    });

    it("Should revert if the session is not active", async function () {
      const { votingBlock, user1 } = await loadFixture(deployVotingBlockFixture);

      await expect(votingBlock.connect(user1).vote(0, 0)).to.be.revertedWith("Voting session is not active.");
    });

    it("Should revert if the voting period has ended", async function () {
      const { votingBlock, user1, sessionId } = await loadFixture(createSessionFixture);

      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);

      await expect(votingBlock.connect(user1).vote(sessionId, 0)).to.be.revertedWith("Voting session has ended.");
    });

    it("Should revert if user already voted", async function () {
      const { votingBlock, user1, sessionId } = await loadFixture(createSessionFixture);

      await votingBlock.connect(user1).vote(sessionId, 1);
      await expect(votingBlock.connect(user1).vote(sessionId, 2)).to.be.revertedWith("You have already voted.");
    });

    it("Should revert if the candidate index is invalid", async function () {
      const { votingBlock, user1, sessionId, candidates } = await loadFixture(createSessionFixture);

      await expect(
        votingBlock.connect(user1).vote(sessionId, candidates.length)
      ).to.be.revertedWith("Invalid candidate index.");
    });
  });

  describe("calculateResults", function () {
    async function createEndedSessionFixture() {
      const fixtureData = await deployVotingBlockFixture();
      const { votingBlock, user1, user2 } = fixtureData;

      const title = "Best fruit";
      const candidates = ["Watermelon", "Papaya"];
      const duration = 60;

      await votingBlock.createVotingSession(title, candidates, duration);

      const sessionId = 0;

      await votingBlock.connect(user1).vote(sessionId, 0);
      await votingBlock.connect(user2).vote(sessionId, 1);

      return { ...fixtureData, sessionId, candidates };
    }

    it("Should calculate the results and emit the event", async function () {
      const { votingBlock, sessionId } = await loadFixture(createEndedSessionFixture);

      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);

      const tx = await votingBlock.calculateResults(sessionId);
      const receipt = await tx.wait();

      const event = receipt.logs.map((log) =>
        votingBlock.interface.parseLog(log)
      ).find((parsed) => parsed.name === "ResultsCalculated");
      
      expect(event).to.not.be.undefined;
      expect(event.args.sessionId).to.equal(sessionId);

      const sessionInfo = await votingBlock.getSessionInfo(sessionId);
      expect(sessionInfo.isActive).to.be.false;
      expect(sessionInfo.resultsCalculated).to.be.true;
    });

    it("Should revert if the session does not exist", async function () {
      const { votingBlock } = await loadFixture(deployVotingBlockFixture);

      await expect(votingBlock.calculateResults(999)).to.be.revertedWith("Invalid session ID.");
    });

    it("Should revert if the session is already finalized", async function () {
      const { votingBlock, sessionId } = await loadFixture(createEndedSessionFixture);

      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);

      await votingBlock.calculateResults(sessionId);

      await expect(votingBlock.calculateResults(sessionId)).to.be.revertedWith("Session already finalized.");
    });

    it("Should revert if the voting period is still active", async function () {
      const { votingBlock, sessionId } = await loadFixture(createEndedSessionFixture);

      await expect(votingBlock.calculateResults(sessionId)).to.be.revertedWith("Voting period is still active.");
    });
  });

  describe("getWinners", function () {
    async function endSessionWithVotesFixture() {
      const fixtureData = await deployVotingBlockFixture();
      const { votingBlock, user1, user2, user3 } = fixtureData;

      const title = "Best fruit";
      const candidates = ["Banana", "Watermelon", "Papaya"];
      const duration = 60;

      await votingBlock.createVotingSession(title, candidates, duration);
      const sessionId = 0;

      await votingBlock.connect(user1).vote(sessionId, 0);
      await votingBlock.connect(user2).vote(sessionId, 1);
      await votingBlock.connect(user3).vote(sessionId, 1);

      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);
      await votingBlock.calculateResults(sessionId);

      return { ...fixtureData, sessionId, candidates };
    }

    it("Should return the correct single winner", async function () {
      const { votingBlock, sessionId } = await loadFixture(endSessionWithVotesFixture);

      const winners = await votingBlock.getWinners(sessionId);
      expect(winners.length).to.equal(1);
      expect(winners[0]).to.equal("Watermelon");
    });

    it("Should revert if results are not calculated yet", async function () {
      const { votingBlock } = await loadFixture(deployVotingBlockFixture);

      const candidates = ["Banana", "Papaya"];
      await votingBlock.createVotingSession("Best fruit", candidates, 60);

      await expect(votingBlock.getWinners(0)).to.be.revertedWith("Results not calculated yet.");
    });

    it("Should return multiple winners in a tie", async function () {
      const fixtureData = await deployVotingBlockFixture();
      const { votingBlock, user1, user2 } = fixtureData;

      const candidates = ["Banana", "Watermelon", "Papaya"];
      await votingBlock.createVotingSession("Best fruit", candidates, 60);
      const sessionId = 0;

      await votingBlock.connect(user1).vote(sessionId, 0);
      await votingBlock.connect(user2).vote(sessionId, 1);

      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);
      await votingBlock.calculateResults(sessionId);

      const winners = await votingBlock.getWinners(sessionId);
      expect(winners).to.deep.equal(["Banana", "Watermelon"]);
    });
  });

  describe("getSessionInfo", function () {
    it("Should return the correct session info", async function () {
      const { votingBlock } = await loadFixture(deployVotingBlockFixture);

      const title = "Best fruit";
      const candidates = ["Banana", "Mango"];
      const duration = 100;

      const tx = await votingBlock.createVotingSession(title, candidates, duration);
      const receipt = await tx.wait();

      const event = receipt.logs.map((log) =>
        votingBlock.interface.parseLog(log)
      ).find((parsed) => parsed.name === "VotingSessionCreated");
      const sessionId = event.args.sessionId;

      const sessionInfo = await votingBlock.getSessionInfo(sessionId);
      expect(sessionInfo.title).to.equal("Best fruit");
      expect(sessionInfo.candidates).to.deep.equal(["Banana", "Mango"]);
      expect(sessionInfo.isActive).to.be.true;
      expect(sessionInfo.resultsCalculated).to.be.false;
      expect(sessionInfo.startTimestamp).to.be.gt(0);
      expect(sessionInfo.endTimestamp).to.be.gt(sessionInfo.startTimestamp);
    });
  });

  describe("getTally", function () {
    async function tallyFixture() {
      const fixtureData = await deployVotingBlockFixture();
      const { votingBlock, user1, user2 } = fixtureData;

      await votingBlock.createVotingSession("Best fruit", ["Mango", "Custard Apple"], 60);
      const sessionId = 0;

      await votingBlock.connect(user1).vote(sessionId, 0);
      await votingBlock.connect(user2).vote(sessionId, 1);

      return { ...fixtureData, sessionId };
    }

    it("Should return the correct tally array", async function () {
      const { votingBlock, sessionId } = await loadFixture(tallyFixture);

      const tally = await votingBlock.getTally(sessionId);
      expect(tally.length).to.equal(2);
      expect(tally[0]).to.equal(1);
      expect(tally[1]).to.equal(1);
    });
  });

  describe("hasVoted", function () {
    it("Should correctly return if an address has voted in a session", async function () {
      const { votingBlock, user1 } = await loadFixture(deployVotingBlockFixture);

      await votingBlock.createVotingSession("Best fruit", ["Watermelon", "Papaya"], 60);
      const sessionId = 0;

      expect(await votingBlock.hasVoted(sessionId, user1.address)).to.be.false;

      await votingBlock.connect(user1).vote(sessionId, 0);
      expect(await votingBlock.hasVoted(sessionId, user1.address)).to.be.true;
    });
  });
});