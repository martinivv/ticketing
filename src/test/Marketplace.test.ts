import { expect } from 'chai'
import { TransactionResponse, ZeroAddress } from 'ethers'
import hre from 'hardhat'
import { fixtures, getCurrentBlock } from '../_helpers/shared-helpers'

describe('Marketplace', () => {
    fixtures(['all'])

    /* ============================================ INITIALIZATION ============================================ */

    describe('#Initialization', () => {
        it('sets standard initial owner', async function () {
            expect(await hre.Marketplace.owner()).to.be.equal(hre.users.deployer.address)
        })

        it('sets standard Beacon address', async function () {
            expect(await hre.Marketplace.BEACON_()).to.be.equal(hre.EventBeacon.target)
        })
    })

    /* ============================================ FUNCTIONALITIES =========================================== */

    describe('#Functionalities', () => {
        let tx: TransactionResponse

        beforeEach(async function () {
            const saleStart = (await getCurrentBlock()) + 1
            tx = await hre.Marketplace.createEvent('URI', 'EVENT', 'EVNT', saleStart, saleStart + 1, this.value)
        })

        it('emits an event on *EVENT* creation', async function () {
            await expect(tx).to.emit(hre.Marketplace, 'ProxyDeployed')
        })

        it('saves the proxy instance', async function () {
            expect(await hre.Marketplace.getAllProxies()).to.not.be.empty
        })

        it('updates the base implementation', async function () {
            await hre.Marketplace.updateImplementation(hre.RNGService.target) // Address with code size > 0
            expect(await hre.EventBeacon.implementation()).to.equal(hre.RNGService.target)
        })
    })

    /* ================================================ ATTACK ================================================ */

    describe('#Attack-Generalized', () => {
        it('reverts if a user tries to setup the event structure', async function () {
            await expect(
                hre.Marketplace.connect(hre.users.userOne).setupEvents(ZeroAddress)
            ).to.be.revertedWithCustomError(hre.Marketplace, 'OwnableUnauthorizedAccount')
        })

        it('reverts if a user tries to update the base implementation', async function () {
            await expect(
                hre.Marketplace.connect(hre.users.userOne).updateImplementation(ZeroAddress)
            ).to.be.revertedWithCustomError(hre.Marketplace, 'OwnableUnauthorizedAccount')
        })

        it('reverts if a user tries to renounce ownership', async function () {
            await expect(hre.Marketplace.connect(hre.users.userOne).renounceOwnership()).to.be.revertedWithCustomError(
                hre.Marketplace,
                'OwnableUnauthorizedAccount'
            )
        })

        it('reverts if a user tries to transfer the ownership', async function () {
            await expect(
                hre.Marketplace.connect(hre.users.userOne).transferOwnership(hre.users.userOne.address)
            ).to.be.revertedWithCustomError(hre.Marketplace, 'OwnableUnauthorizedAccount')
        })
    })

    describe('#Attack_CreateEvent-Input', () => {
        let currentBlock: number

        beforeEach(async function () {
            currentBlock = await getCurrentBlock()
            this.testArgs = ['URI', 'EVENT', 'EVNT', currentBlock + 1, currentBlock + 2, this.value]
        })

        afterEach(async function () {
            await expect(hre.Marketplace.createEvent(...this.testArgs)).to.be.revertedWithCustomError(
                hre.Marketplace,
                'InvalidIO'
            )
        })

        it('reverts if an event identifier is not supplied', function () {
            this.testArgs[0] = ''
        })

        it('reverts if a name is not given', function () {
            this.testArgs[1] = ''
        })

        it('reverts if a symbol is not set', function () {
            this.testArgs[2] = ''
        })

        it('reverts if the `saleStart` is in the past', function () {
            this.testArgs[3] = currentBlock
        })

        it('reverts if the `saleEnd` is in the past', function () {
            this.testArgs[4] = currentBlock
        })

        it('reverts if the `saleEnd` is identical to the `saleStart`', function () {
            this.testArgs[4] = currentBlock + 1
        })

        it('reverts if the ticket is free', function () {
            this.testArgs[5] = 0
        })
    })
})
