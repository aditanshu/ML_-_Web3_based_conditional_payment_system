const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ConditionalUPI", function () {
    let ConditionalUPI;
    let contract;
    let owner, relayer, payer, payee, other;
    const amount = ethers.parseEther("1.0");
    const metadataURI = "ipfs://QmTest123";
    let futureDeadline;

    beforeEach(async function () {
        [owner, relayer, payer, payee, other] = await ethers.getSigners();

        // Set deadline to 1 day in the future
        futureDeadline = (await time.latest()) + 86400; // 24 hours

        ConditionalUPI = await ethers.getContractFactory("ConditionalUPI");
        contract = await ConditionalUPI.connect(owner).deploy(relayer.address);
        await contract.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct admin role", async function () {
            const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
            expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should set the initial relayer", async function () {
            const RELAYER_ROLE = await contract.RELAYER_ROLE();
            expect(await contract.hasRole(RELAYER_ROLE, relayer.address)).to.be.true;
        });

        it("Should start with zero conditions", async function () {
            expect(await contract.getConditionCount()).to.equal(0);
        });

        it("Should revert if initial relayer is zero address", async function () {
            await expect(
                ConditionalUPI.connect(owner).deploy(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid relayer address");
        });
    });

    describe("Create Condition", function () {
        it("Should create a condition with correct parameters", async function () {
            const tx = await contract.connect(payer).createCondition(
                payee.address,
                futureDeadline,
                metadataURI,
                { value: amount }
            );

            const condition = await contract.getCondition(0);
            expect(condition.id).to.equal(0);
            expect(condition.payer).to.equal(payer.address);
            expect(condition.payee).to.equal(payee.address);
            expect(condition.amount).to.equal(amount);
            expect(condition.deadline).to.equal(futureDeadline);
            expect(condition.metadataURI).to.equal(metadataURI);
            expect(condition.executed).to.be.false;
            expect(condition.refunded).to.be.false;
        });

        it("Should emit ConditionCreated event", async function () {
            await expect(
                contract.connect(payer).createCondition(
                    payee.address,
                    futureDeadline,
                    metadataURI,
                    { value: amount }
                )
            )
                .to.emit(contract, "ConditionCreated")
                .withArgs(0, payer.address, payee.address, amount, futureDeadline, metadataURI);
        });

        it("Should increment condition counter", async function () {
            await contract.connect(payer).createCondition(
                payee.address,
                futureDeadline,
                metadataURI,
                { value: amount }
            );

            expect(await contract.getConditionCount()).to.equal(1);

            await contract.connect(payer).createCondition(
                payee.address,
                futureDeadline,
                metadataURI,
                { value: amount }
            );

            expect(await contract.getConditionCount()).to.equal(2);
        });

        it("Should escrow the funds in contract", async function () {
            const contractAddress = await contract.getAddress();
            const balanceBefore = await ethers.provider.getBalance(contractAddress);

            await contract.connect(payer).createCondition(
                payee.address,
                futureDeadline,
                metadataURI,
                { value: amount }
            );

            const balanceAfter = await ethers.provider.getBalance(contractAddress);
            expect(balanceAfter - balanceBefore).to.equal(amount);
        });

        it("Should revert if amount is zero", async function () {
            await expect(
                contract.connect(payer).createCondition(
                    payee.address,
                    futureDeadline,
                    metadataURI,
                    { value: 0 }
                )
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("Should revert if payee is zero address", async function () {
            await expect(
                contract.connect(payer).createCondition(
                    ethers.ZeroAddress,
                    futureDeadline,
                    metadataURI,
                    { value: amount }
                )
            ).to.be.revertedWith("Invalid payee address");
        });

        it("Should revert if deadline is in the past", async function () {
            const pastDeadline = (await time.latest()) - 3600; // 1 hour ago

            await expect(
                contract.connect(payer).createCondition(
                    payee.address,
                    pastDeadline,
                    metadataURI,
                    { value: amount }
                )
            ).to.be.revertedWith("Deadline must be in the future");
        });
    });

    describe("Trigger Condition", function () {
        let conditionId;
        const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof123"));

        beforeEach(async function () {
            const tx = await contract.connect(payer).createCondition(
                payee.address,
                futureDeadline,
                metadataURI,
                { value: amount }
            );
            conditionId = 0;
        });

        it("Should allow relayer to trigger condition", async function () {
            const payeeBalanceBefore = await ethers.provider.getBalance(payee.address);

            await contract.connect(relayer).triggerCondition(conditionId, proofHash);

            const payeeBalanceAfter = await ethers.provider.getBalance(payee.address);
            expect(payeeBalanceAfter - payeeBalanceBefore).to.equal(amount);

            const condition = await contract.getCondition(conditionId);
            expect(condition.executed).to.be.true;
        });

        it("Should emit ConditionTriggered event", async function () {
            await expect(
                contract.connect(relayer).triggerCondition(conditionId, proofHash)
            )
                .to.emit(contract, "ConditionTriggered")
                .withArgs(conditionId, relayer.address, proofHash);
        });

        it("Should revert if non-relayer tries to trigger", async function () {
            await expect(
                contract.connect(other).triggerCondition(conditionId, proofHash)
            ).to.be.reverted; // AccessControl revert
        });

        it("Should revert if condition doesn't exist", async function () {
            await expect(
                contract.connect(relayer).triggerCondition(999, proofHash)
            ).to.be.revertedWith("Condition does not exist");
        });

        it("Should revert if condition already executed", async function () {
            await contract.connect(relayer).triggerCondition(conditionId, proofHash);

            await expect(
                contract.connect(relayer).triggerCondition(conditionId, proofHash)
            ).to.be.revertedWith("Condition already executed");
        });

        it("Should revert if condition already refunded", async function () {
            // Fast forward past deadline
            await time.increaseTo(futureDeadline + 1);

            // Refund the condition
            await contract.connect(payer).refundCondition(conditionId);

            await expect(
                contract.connect(relayer).triggerCondition(conditionId, proofHash)
            ).to.be.revertedWith("Condition already refunded");
        });

        it("Should transfer exact amount to payee", async function () {
            const contractAddress = await contract.getAddress();
            const contractBalanceBefore = await ethers.provider.getBalance(contractAddress);

            await contract.connect(relayer).triggerCondition(conditionId, proofHash);

            const contractBalanceAfter = await ethers.provider.getBalance(contractAddress);
            expect(contractBalanceBefore - contractBalanceAfter).to.equal(amount);
        });
    });

    describe("Refund Condition", function () {
        let conditionId;

        beforeEach(async function () {
            await contract.connect(payer).createCondition(
                payee.address,
                futureDeadline,
                metadataURI,
                { value: amount }
            );
            conditionId = 0;
        });

        it("Should allow payer to refund after deadline", async function () {
            // Fast forward past deadline
            await time.increaseTo(futureDeadline + 1);

            const payerBalanceBefore = await ethers.provider.getBalance(payer.address);

            const tx = await contract.connect(payer).refundCondition(conditionId);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const payerBalanceAfter = await ethers.provider.getBalance(payer.address);

            // Account for gas costs
            expect(payerBalanceAfter - payerBalanceBefore + gasUsed).to.equal(amount);

            const condition = await contract.getCondition(conditionId);
            expect(condition.refunded).to.be.true;
        });

        it("Should emit ConditionRefunded event", async function () {
            await time.increaseTo(futureDeadline + 1);

            await expect(
                contract.connect(payer).refundCondition(conditionId)
            )
                .to.emit(contract, "ConditionRefunded")
                .withArgs(conditionId, payer.address);
        });

        it("Should revert if deadline not reached", async function () {
            await expect(
                contract.connect(payer).refundCondition(conditionId)
            ).to.be.revertedWith("Deadline not reached");
        });

        it("Should revert if non-payer tries to refund", async function () {
            await time.increaseTo(futureDeadline + 1);

            await expect(
                contract.connect(other).refundCondition(conditionId)
            ).to.be.revertedWith("Only payer can refund");
        });

        it("Should revert if condition already executed", async function () {
            const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof"));
            await contract.connect(relayer).triggerCondition(conditionId, proofHash);

            await time.increaseTo(futureDeadline + 1);

            await expect(
                contract.connect(payer).refundCondition(conditionId)
            ).to.be.revertedWith("Condition already executed");
        });

        it("Should revert if condition already refunded", async function () {
            await time.increaseTo(futureDeadline + 1);
            await contract.connect(payer).refundCondition(conditionId);

            await expect(
                contract.connect(payer).refundCondition(conditionId)
            ).to.be.revertedWith("Condition already refunded");
        });

        it("Should revert if condition doesn't exist", async function () {
            await time.increaseTo(futureDeadline + 1);

            await expect(
                contract.connect(payer).refundCondition(999)
            ).to.be.revertedWith("Condition does not exist");
        });
    });

    describe("Relayer Management", function () {
        it("Should allow admin to add new relayer", async function () {
            await expect(
                contract.connect(owner).addRelayer(other.address)
            ).to.emit(contract, "RelayerAdded").withArgs(other.address);

            const RELAYER_ROLE = await contract.RELAYER_ROLE();
            expect(await contract.hasRole(RELAYER_ROLE, other.address)).to.be.true;
        });

        it("Should allow admin to remove relayer", async function () {
            await expect(
                contract.connect(owner).removeRelayer(relayer.address)
            ).to.emit(contract, "RelayerRemoved").withArgs(relayer.address);

            const RELAYER_ROLE = await contract.RELAYER_ROLE();
            expect(await contract.hasRole(RELAYER_ROLE, relayer.address)).to.be.false;
        });

        it("Should revert if non-admin tries to add relayer", async function () {
            await expect(
                contract.connect(other).addRelayer(other.address)
            ).to.be.reverted; // AccessControl revert
        });

        it("Should revert if adding zero address as relayer", async function () {
            await expect(
                contract.connect(owner).addRelayer(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid relayer address");
        });
    });

    describe("View Functions", function () {
        let conditionId;

        beforeEach(async function () {
            await contract.connect(payer).createCondition(
                payee.address,
                futureDeadline,
                metadataURI,
                { value: amount }
            );
            conditionId = 0;
        });

        it("Should return correct condition details", async function () {
            const condition = await contract.getCondition(conditionId);

            expect(condition.payer).to.equal(payer.address);
            expect(condition.payee).to.equal(payee.address);
            expect(condition.amount).to.equal(amount);
            expect(condition.metadataURI).to.equal(metadataURI);
        });

        it("Should correctly report canTrigger status", async function () {
            expect(await contract.canTrigger(conditionId)).to.be.true;

            const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof"));
            await contract.connect(relayer).triggerCondition(conditionId, proofHash);

            expect(await contract.canTrigger(conditionId)).to.be.false;
        });

        it("Should correctly report canRefund status", async function () {
            expect(await contract.canRefund(conditionId)).to.be.false;

            await time.increaseTo(futureDeadline + 1);

            expect(await contract.canRefund(conditionId)).to.be.true;
        });

        it("Should return correct condition count", async function () {
            expect(await contract.getConditionCount()).to.equal(1);

            await contract.connect(payer).createCondition(
                payee.address,
                futureDeadline,
                metadataURI,
                { value: amount }
            );

            expect(await contract.getConditionCount()).to.equal(2);
        });
    });
});
