import { mine } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { TransactionResponse } from 'ethers'
import hre from 'hardhat'
import { fixtures, getCurrentBlock } from '../_helpers/shared-helpers'

describe('Event', () => {
    fixtures(['all'])

    let saleStart: number
    beforeEach(async function () {
        saleStart = (await getCurrentBlock()) + 1
        await hre.Marketplace.createEvent('URI', 'EVENT', 'EVNT', saleStart, saleStart + 1, this.value)
        this.proxy = hre.Event.attach((await hre.Marketplace.getAllProxies())[0])
    })

    describe('#Initialization', () => {
        it('sets standard event identifier', async function () {
            expect(await this.proxy.eventIdentifier()).to.be.equal('URI')
        })

        it('sets standard event name', async function () {
            expect(await this.proxy.name()).to.be.equal('EVENT')
        })

        it('sets standard event symbol', async function () {
            expect(await this.proxy.symbol()).to.be.equal('EVNT')
        })

        it('sets standard event creator', async function () {
            expect(await this.proxy.eventCreator()).to.be.equal(hre.users.deployer.address)
        })

        it('sets standart sale start', async function () {
            expect(await this.proxy.saleStart()).to.be.equal(saleStart)
        })

        it('sets standard sale end', async function () {
            expect(await this.proxy.saleEnd()).to.be.equal(saleStart + 1)
        })

        it('sets standard ticket price', async function () {
            expect(await this.proxy.ticketPrice()).to.be.equal(this.value)
        })

        it('sets the `ticketId` to zero', async function () {
            expect(await this.proxy.ticketId()).to.be.equal(0)
        })
    })

    describe('#BuyTicket', () => {
        let tx: TransactionResponse

        beforeEach(async function () {
            tx = await this.proxy.connect(hre.users.userOne).buyTicket({ value: this.value })
        })

        it('changes ether balances', async function () {
            await expect(tx).to.changeEtherBalances(
                [hre.users.userOne.address, this.proxy.target],
                [-this.value, this.value]
            )
        })

        it('mints correct `ticketId`', async function () {
            expect(await this.proxy.ownerOf(0)).to.be.equal(hre.users.userOne.address)
        })

        it('increases `ticketId`', async function () {
            expect(await this.proxy.ticketId()).to.be.equal(1)
        })

        it('emits event', async function () {
            await expect(tx).to.emit(this.proxy, 'TicketBought')
        })

        describe('WithdrawFunds', async function () {
            let withdrawTx: TransactionResponse

            beforeEach(async function () {
                withdrawTx = await this.proxy.withdrawFunds()
            })

            it('changes ether balances on withdraw', async function () {
                await expect(withdrawTx).to.changeEtherBalances(
                    [this.proxy.target, hre.users.deployer.address],
                    [-this.value, this.value]
                )
            })

            it('emits event on withdraw', async function () {
                await expect(withdrawTx).to.emit(this.proxy, 'EventWithdraw')
            })
        })
    })

    /* ================================================ ATTACK ================================================ */

    describe('#Attack', () => {
        it('reverts on proxy reinitialization', async function () {
            await expect(
                this.proxy.initialize('A', 'B', 'C', hre.users.deployer.address, 12, 13, 1) // random args
            ).to.be.revertedWithCustomError(this.proxy, 'InvalidInitialization')
        })

        it('reverts on contract (proxied state) initialization', async function () {
            await expect(
                hre.Event.initialize('A', 'B', 'C', hre.users.deployer.address, 12, 13, 1)
            ).to.be.revertedWithCustomError(hre.Event, 'InvalidInitialization')
        })

        it('reverts if no value is supplied on {buyTicket}', async function () {
            await expect(this.proxy.buyTicket()).to.be.revertedWithCustomError(this.proxy, 'InsufficientBuyValue')
        })

        it('reverts if the active sale period is over on {buyTicket}', async function () {
            await mine(1)
            await expect(this.proxy.buyTicket()).to.be.revertedWithCustomError(this.proxy, 'SaleNotActive')
        })

        it('reverts if {requestEventWinner} is called in active sale period', async function () {
            await expect(this.proxy.requestEventWinner()).to.be.revertedWithCustomError(this.proxy, 'SaleIsActive')
        })

        it('reverts if a user tries to call the {applyRewarding}', async function () {
            await expect(this.proxy.connect(hre.users.userOne).applyRewarding(4)).to.be.revertedWithCustomError(
                this.proxy,
                'NotRNGService'
            )
        })

        it('reverts if not the event creator tries to withdraw the funds', async function () {
            await expect(this.proxy.connect(hre.users.userOne).withdrawFunds()).to.be.revertedWithCustomError(
                this.proxy,
                'MustBeEventCreator'
            )
        })
    })
})
