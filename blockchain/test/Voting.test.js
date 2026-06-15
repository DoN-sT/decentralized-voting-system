const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let voting;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(["Alice", "Bob"]);
    await voting.waitForDeployment();
  });

  it("Should initialize with correct candidates", async function () {
    const count = await voting.candidatesCount();
    expect(count).to.equal(2n);

    const candidate1 = await voting.candidates(1);
    expect(candidate1.name).to.equal("Alice");

    const candidate2 = await voting.candidates(2);
    expect(candidate2.name).to.equal("Bob");
  });

  it("Should allow a user to vote", async function () {
    await voting.connect(addr1).vote(1);
    const candidate1 = await voting.candidates(1);
    expect(candidate1.voteCount).to.equal(1n);

    const hasVoted = await voting.voters(addr1.address);
    expect(hasVoted).to.be.true;
  });

  it("Should prevent double voting", async function () {
    await voting.connect(addr1).vote(1);
    await expect(
      voting.connect(addr1).vote(2)
    ).to.be.revertedWith("You have already voted.");
  });

  it("Should reject invalid candidate IDs", async function () {
    await expect(
      voting.connect(addr1).vote(0)
    ).to.be.revertedWith("Invalid candidate.");
    await expect(
      voting.connect(addr1).vote(99)
    ).to.be.revertedWith("Invalid candidate.");
  });

  it("Should return all candidates via getAllCandidates", async function () {
    const all = await voting.getAllCandidates();
    expect(all.length).to.equal(2);
    expect(all[0].name).to.equal("Alice");
    expect(all[1].name).to.equal("Bob");
  });

  it("Should emit VotedEvent on voting", async function () {
    await expect(voting.connect(addr1).vote(1))
      .to.emit(voting, "VotedEvent")
      .withArgs(1, addr1.address);
  });
});
