const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SovereignAILab", function () {
  let sovereignAILab;
  let stableToken;
  let owner, user1, user2, auditor, complianceOfficer;
  let projectId;

  const PLATFORM_FEE = 500; // 5%

  beforeEach(async function () {
    [owner, user1, user2, auditor, complianceOfficer] = await ethers.getSigners();

    // Deploy mock stable token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    stableToken = await MockERC20.deploy("USD Coin", "USDC", ethers.parseEther("1000000"));
    await stableToken.waitForDeployment();

    // Deploy SovereignAILab
    const SovereignAILab = await ethers.getContractFactory("SovereignAILab");
    sovereignAILab = await upgrades.deployProxy(
      SovereignAILab,
      [await stableToken.getAddress(), owner.address, PLATFORM_FEE],
      { initializer: "initialize" }
    );
    await sovereignAILab.waitForDeployment();

    // Setup roles
    await sovereignAILab.connect(owner).setAuthorizedAuditor(auditor.address, true);
    await sovereignAILab.connect(owner).setComplianceOfficer(complianceOfficer.address, true);

    // Mint tokens to users
    await stableToken.connect(owner).transfer(user1.address, ethers.parseEther("10000"));
    await stableToken.connect(owner).transfer(user2.address, ethers.parseEther("10000"));

    // Approve spending
    await stableToken.connect(user1).approve(await sovereignAILab.getAddress(), ethers.parseEther("10000"));
    await stableToken.connect(user2).approve(await sovereignAILab.getAddress(), ethers.parseEther("10000"));
  });

  describe("Initialization", function () {
    it("Should initialize with correct parameters", async function () {
      expect(await sovereignAILab.owner()).to.equal(owner.address);
      expect(await sovereignAILab.stableToken()).to.equal(await stableToken.getAddress());
      expect(await sovereignAILab.platformFee()).to.equal(PLATFORM_FEE);
    });

    it("Should set up emergency operators correctly", async function () {
      expect(await sovereignAILab.emergencyOperators(owner.address)).to.be.true;
    });
  });

  describe("Project Creation", function () {
    it("Should create a project successfully", async function () {
      const tx = await sovereignAILab.connect(user1).createProject(
        "AI Research Project",
        "Revolutionary AI research",
        ethers.parseEther("1000"),
        30 * 24 * 60 * 60, // 30 days
        1 // STANDARD compliance
      );

      await expect(tx).to.emit(sovereignAILab, "ProjectCreated");

      const project = await sovereignAILab.getProject(1);
      expect(project.name).to.equal("AI Research Project");
      expect(project.creator).to.equal(user1.address);
      expect(project.fundingGoal).to.equal(ethers.parseEther("1000"));
      expect(project.isActive).to.be.true;
    });

    it("Should reject project creation with invalid parameters", async function () {
      await expect(
        sovereignAILab.connect(user1).createProject(
          "",
          "Description",
          ethers.parseEther("1000"),
          30 * 24 * 60 * 60,
          1
        )
      ).to.be.revertedWith("Name required");

      await expect(
        sovereignAILab.connect(user1).createProject(
          "Name",
          "Description",
          0,
          30 * 24 * 60 * 60,
          1
        )
      ).to.be.revertedWith("Funding goal must be positive");
    });

    it("Should reject project creation for sanctioned addresses", async function () {
      await sovereignAILab.connect(complianceOfficer).updateSanctions(user1.address, true);

      await expect(
        sovereignAILab.connect(user1).createProject(
          "AI Project",
          "Description",
          ethers.parseEther("1000"),
          30 * 24 * 60 * 60,
          1
        )
      ).to.be.revertedWith("Address is sanctioned");
    });
  });

  describe("Project Funding", function () {
    beforeEach(async function () {
      await sovereignAILab.connect(user1).createProject(
        "AI Research Project",
        "Revolutionary AI research",
        ethers.parseEther("1000"),
        30 * 24 * 60 * 60,
        1
      );
      projectId = 1;
    });

    it("Should fund a project successfully", async function () {
      const fundAmount = ethers.parseEther("500");
      const expectedFee = (fundAmount * BigInt(PLATFORM_FEE)) / BigInt(10000);
      const expectedNet = fundAmount - expectedFee;

      const tx = await sovereignAILab.connect(user2).fundProject(projectId, fundAmount);

      await expect(tx).to.emit(sovereignAILab, "ProjectFunded")
        .withArgs(projectId, user2.address, expectedNet);

      const project = await sovereignAILab.getProject(projectId);
      expect(project.currentFunding).to.equal(expectedNet);

      expect(await sovereignAILab.getUserContribution(projectId, user2.address)).to.equal(expectedNet);
    });

    it("Should collect platform fees correctly", async function () {
      const fundAmount = ethers.parseEther("1000");
      const expectedFee = (fundAmount * BigInt(PLATFORM_FEE)) / BigInt(10000);

      const ownerBalanceBefore = await stableToken.balanceOf(owner.address);
      await sovereignAILab.connect(user2).fundProject(projectId, fundAmount);
      const ownerBalanceAfter = await stableToken.balanceOf(owner.address);

      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(expectedFee);
    });

    it("Should reject funding from sanctioned addresses", async function () {
      await sovereignAILab.connect(complianceOfficer).updateSanctions(user2.address, true);

      await expect(
        sovereignAILab.connect(user2).fundProject(projectId, ethers.parseEther("100"))
      ).to.be.revertedWith("Address is sanctioned");
    });

    it("Should reject funding after deadline", async function () {
      await time.increase(31 * 24 * 60 * 60); // 31 days

      await expect(
        sovereignAILab.connect(user2).fundProject(projectId, ethers.parseEther("100"))
      ).to.be.revertedWith("Project deadline passed");
    });
  });

  describe("Project Completion", function () {
    beforeEach(async function () {
      await sovereignAILab.connect(user1).createProject(
        "AI Research Project",
        "Revolutionary AI research",
        ethers.parseEther("1000"),
        30 * 24 * 60 * 60,
        1
      );
      projectId = 1;

      // Fund the project to goal
      await sovereignAILab.connect(user2).fundProject(projectId, ethers.parseEther("1050")); // Including fee
    });

    it("Should complete a project successfully", async function () {
      const creatorBalanceBefore = await stableToken.balanceOf(user1.address);
      const projectFunding = (await sovereignAILab.getProject(projectId)).currentFunding;

      await sovereignAILab.connect(user1).completeProject(projectId);

      const creatorBalanceAfter = await stableToken.balanceOf(user1.address);
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(projectFunding);

      const project = await sovereignAILab.getProject(projectId);
      expect(project.isActive).to.be.false;
      expect(project.isCompleted).to.be.true;
    });

    it("Should reject completion from non-creator", async function () {
      await expect(
        sovereignAILab.connect(user2).completeProject(projectId)
      ).to.be.revertedWith("Not project creator");
    });

    it("Should reject completion if funding goal not met", async function () {
      // Create a new project with higher goal
      await sovereignAILab.connect(user1).createProject(
        "Big AI Project",
        "Expensive AI research",
        ethers.parseEther("10000"),
        30 * 24 * 60 * 60,
        1
      );

      await expect(
        sovereignAILab.connect(user1).completeProject(2)
      ).to.be.revertedWith("Funding goal not met");
    });
  });

  describe("Governance", function () {
    beforeEach(async function () {
      // Give users voting power
      await sovereignAILab.connect(user1).createProject(
        "AI Project",
        "Description",
        ethers.parseEther("1000"),
        30 * 24 * 60 * 60,
        1
      );
      await sovereignAILab.connect(user2).fundProject(1, ethers.parseEther("1100"));
    });

    it("Should create a proposal", async function () {
      const tx = await sovereignAILab.connect(user2).createProposal(
        "Update platform fee",
        "0x",
        7 * 24 * 60 * 60 // 7 days
      );

      await expect(tx).to.emit(sovereignAILab, "ProposalCreated");

      const proposalCount = await sovereignAILab.getProposalCount();
      expect(proposalCount).to.equal(1);
    });

    it("Should reject proposal from user without voting power", async function () {
      await expect(
        sovereignAILab.connect(auditor).createProposal(
          "Test proposal",
          "0x",
          7 * 24 * 60 * 60
        )
      ).to.be.revertedWith("Insufficient voting power");
    });

    it("Should execute successful proposal", async function () {
      // Create proposal
      await sovereignAILab.connect(user2).createProposal(
        "Test proposal",
        sovereignAILab.interface.encodeFunctionData("setPlatformFee", [300]), // 3%
        7 * 24 * 60 * 60
      );

      // Vote
      await sovereignAILab.connect(user2).vote(0, true);

      // Fast forward time
      await time.increase(8 * 24 * 60 * 60);

      // Execute
      await sovereignAILab.connect(user1).executeProposal(0);

      expect(await sovereignAILab.platformFee()).to.equal(300);
    });
  });

  describe("Compliance and Security", function () {
    it("Should record compliance audit", async function () {
      const tx = await sovereignAILab.connect(auditor).recordComplianceAudit(
        "GDPR",
        true,
        "Evidence hash"
      );

      await expect(tx).to.emit(sovereignAILab, "ComplianceAudit");

      const historyLength = await sovereignAILab.getComplianceHistoryLength();
      expect(historyLength).to.equal(1);
    });

    it("Should update sanctions", async function () {
      const tx = await sovereignAILab.connect(complianceOfficer).updateSanctions(
        user1.address,
        true
      );

      await expect(tx).to.emit(sovereignAILab, "SanctionsUpdated");

      expect(await sovereignAILab.sanctionedAddresses(user1.address)).to.be.true;
    });

    it("Should activate emergency mode", async function () {
      const tx = await sovereignAILab.connect(owner).emergencyPause(true);

      await expect(tx).to.emit(sovereignAILab, "EmergencyActivated");

      expect(await sovereignAILab.emergencyMode()).to.be.true;
      expect(await sovereignAILab.paused()).to.be.true;
    });
  });

  describe("Emergency Controls", function () {
    it("Should pause and unpause in emergency", async function () {
      // Pause
      await sovereignAILab.connect(owner).emergencyPause(true);
      expect(await sovereignAILab.paused()).to.be.true;

      // Unpause
      await sovereignAILab.connect(owner).emergencyPause(false);
      expect(await sovereignAILab.paused()).to.be.false;
    });

    it("Should reject operations during emergency", async function () {
      await sovereignAILab.connect(owner).emergencyPause(true);

      await expect(
        sovereignAILab.connect(user1).createProject(
          "Emergency Project",
          "Description",
          ethers.parseEther("1000"),
          30 * 24 * 60 * 60,
          1
        )
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Access Control", function () {
    it("Should restrict auditor functions", async function () {
      await expect(
        sovereignAILab.connect(user1).recordComplianceAudit("Test", true, "Evidence")
      ).to.be.revertedWith("Not authorized auditor");
    });

    it("Should restrict compliance officer functions", async function () {
      await expect(
        sovereignAILab.connect(user1).updateSanctions(user2.address, true)
      ).to.be.revertedWith("Not compliance officer");
    });

    it("Should restrict emergency functions", async function () {
      await expect(
        sovereignAILab.connect(user1).emergencyPause(true)
      ).to.be.revertedWith("Not emergency operator");
    });
  });
});
