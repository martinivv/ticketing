import { TransactionResponse } from '@ethersproject/abstract-provider'
import { expect } from 'chai'
import hre from 'hardhat'
import { fixtures, Test_getSaleDuration, value as ticketPrice } from '../_helpers/shared-helpers'

describe('Marketplace', () => {
    fixtures(['all'])

    /* ============================================ INITIALIZATION ============================================ */

    describe('#State-Initialization', () => {
        it('sets standard initial owner', async function () {
            expect(await hre.Marketplace.owner()).to.be.equal(hre.users.deployer.address)
        })

        it('sets standard beacon address', async function () {
            expect(await hre.Marketplace.BEACON_()).to.be.equal(hre.EventBeacon.address)
        })
    })

    /* ============================================ FUNCTIONALITIES =========================================== */

    describe('#Functionalities', () => {
        let createEventTx: TransactionResponse

        beforeEach(async function () {
            const { saleStart, saleEnd } = await Test_getSaleDuration()
            this.eventParams = ['URI', 'EVENT', 'EVNT', saleStart, saleEnd, ticketPrice]
            // @ts-ignore
            createEventTx = await hre.Marketplace.createEvent(...this.eventParams)
        })

        it('emits an event on every added event', async function () {
            await expect(createEventTx).to.emit(hre.Marketplace, 'ProxyDeployed')
        })

        it('saves the proxy instance', async function () {
            expect(await hre.Marketplace.getAllProxies()).to.not.be.empty
        })
    })

    /* ================================================ ATTACK ================================================ */

    describe('#Attack', () => {
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

    describe('#Attack-CreateEvent', () => {
        beforeEach(async function () {
            const { saleStart, saleEnd } = await Test_getSaleDuration()
            this.eventParams = ['URI', 'EVENT', 'EVNT', saleStart, saleEnd, ticketPrice]
        })

        afterEach(async function () {
            // @ts-ignore
            await expect(hre.Marketplace.createEvent(...this.eventParams)).to.be.revertedWithCustomError(
                hre.Marketplace,
                'InvalidIO'
            )
        })

        it('reverts if the event data is not supplied', function () {
            this.eventParams[0] = ''
        })

        it('reverts if the name is not given', function () {
            this.eventParams[1] = ''
        })

        it('reverts if the symbol is not set', function () {
            this.eventParams[2] = ''
        })

        it('reverts if the `saleStart` is in the past', async function () {
            this.eventParams[3] -= 1n
        })

        it('reverts if the `saleEnd` is in the past', async function () {
            this.eventParams[4] -= 1n
        })

        it('reverts if the `saleEnd` is identical to the `saleStart`', async function () {
            this.eventParams[4] = this.eventParams[3]
        })

        it('reverts if the ticket price is set to 0', function () {
            this.eventParams[5] = 0
        })
    })
})
