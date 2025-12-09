const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConditionalPayment", function () {
    let ConditionalPayment;
    let contract;
    let payer, payee, other;
    const amount = ethers.parseEther("1.0");
    const condition = "Payment after project completion";

    beforeEach(async function () {
        [payer, payee, other] = await ethers.getSigners();

        ConditionalPayment = await ethers.getContractFactory("ConditionalPayment");
        contract = await ConditionalPayment.connect(payer).deploy(
            payee.address,
            amount,
            condition,
            { value: amount }
        );
        await contract.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct payer", async function () {
            expect(await contract.payer()).to.equal(payer.address);
        });

        it("Should set the correct payee", async function () {
            expect(await contract.payee()).to.equal(payee.address);
        });

        it("Should set the correct amount", async function () {
            expect(await contract.amount()).to.equal(amount);
        });

        it("Should set the correct condition", async function () {
            expect(await contract.condition()).to.equal(condition);
        });

        it("Should start with isPaid as false", async function () {
            expect(await contract.isPaid()).to.equal(false);
        });

        it("Should hold the escrowed amount", async function () {
            const contractBalance = await ethers.provider.getBalance(await contract.getAddress());
            expect(contractBalance).to.equal(amount);
        });

        it("Should revert if msg.value doesn't match amount", async function () {
            await expect(
                ConditionalPayment.connect(payer).deploy(
                    payee.address,
                    amount,
                    condition,
                    { value: ethers.parseEther("0.5") }
                )
            ).to.be.revertedWith("Must send exact amount");
        });
    });

    describe("Release Payment", function () {
        it("Should allow payer to release payment", async function () {
            const payeeBalanceBefore = await ethers.provider.getBalance(payee.address);

            await contract.connect(payer).releasePayment();

            const payeeBalanceAfter = await ethers.provider.getBalance(payee.address);
            expect(payeeBalanceAfter - payeeBalanceBefore).to.equal(amount);
            expect(await contract.isPaid()).to.equal(true);
        });

        it("Should revert if non-payer tries to release", async function () {
            await expect(
                contract.connect(other).releasePayment()
            ).to.be.revertedWith("Only payer can release");
        });

        it("Should revert if trying to release twice", async function () {
            await contract.connect(payer).releasePayment();

            await expect(
                contract.connect(payer).releasePayment()
            ).to.be.revertedWith("Already paid");
        });

        it("Should transfer correct amount to payee", async function () {
            const contractAddress = await contract.getAddress();
            const contractBalanceBefore = await ethers.provider.getBalance(contractAddress);

            await contract.connect(payer).releasePayment();

            const contractBalanceAfter = await ethers.provider.getBalance(contractAddress);
            expect(contractBalanceBefore - contractBalanceAfter).to.equal(amount);
        });
    });

    describe("Get Details", function () {
        it("Should return correct details", async function () {
            const details = await contract.getDetails();

            expect(details[0]).to.equal(payer.address);
            expect(details[1]).to.equal(payee.address);
            expect(details[2]).to.equal(amount);
            expect(details[3]).to.equal(condition);
            expect(details[4]).to.equal(false);
        });

        it("Should return updated isPaid after release", async function () {
            await contract.connect(payer).releasePayment();
            const details = await contract.getDetails();

            expect(details[4]).to.equal(true);
        });
    });
});
