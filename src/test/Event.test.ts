import { MockContract, smock } from '@defi-wonderland/smock'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { mine } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { Test_getSaleDuration, fixtures, value as ticketPrice } from '../_helpers/shared-helpers'
import { Event, Event__factory, RNGService } from '../_helpers/typechain'

describe('Event', () => {
    fixtures(['all'])

    beforeEach(async function () {
        const { saleStart, saleEnd } = await Test_getSaleDuration()
        this.eventParams = ['URI', 'EVENT', 'EVNT', saleStart, saleEnd, ticketPrice]
        // @ts-ignore
        await hre.Marketplace.createEvent(...this.eventParams)
        this.proxy = hre.Event.attach((await hre.Marketplace.getAllProxies())[0])
    })

    /* ========================================= STATE&FUNCTIONALITIES ======================================== */

    describe('#State-Initialization', () => {
        it('sets standard event identifier', async function () {
            expect(await this.proxy.eventIdentifier()).to.equal(this.eventParams[0])
        })

        it('sets standard event name', async function () {
            expect(await this.proxy.name()).to.equal(this.eventParams[1])
        })

        it('sets standard event symbol', async function () {
            expect(await this.proxy.symbol()).to.equal(this.eventParams[2])
        })

        it('sets standard event creator', async function () {
            expect(await this.proxy.eventCreator()).to.equal(hre.users.deployer.address)
        })

        it('sets standart sale start', async function () {
            expect(await this.proxy.saleStart()).to.equal(this.eventParams[3])
        })

        it('sets standard sale end', async function () {
            expect(await this.proxy.saleEnd()).to.equal(this.eventParams[4])
        })

        it('sets standard ticket price', async function () {
            expect(await this.proxy.ticketPrice()).to.equal(this.eventParams[5])
        })

        it('sets the `ticketId` to zero', async function () {
            expect(!!(await this.proxy.ticketId().value)).to.be.false
        })
    })

    describe('#Functionalities', () => {
        let buyTicketTx: TransactionResponse

        beforeEach(async function () {
            buyTicketTx = await this.proxy.connect(hre.users.userOne).buyTicket({ value: this.eventParams[5] })
        })

        describe('#BuyTicket', () => {
            it('changes ether balances', async function () {
                await expect(buyTicketTx).changeEtherBalances(
                    [hre.users.userOne, this.proxy],
                    [-this.eventParams[5], this.eventParams[5]]
                )
            })

            it('mints correct ticket ID', async function () {
                expect(await this.proxy.ownerOf(0n)).to.be.equal(hre.users.userOne.address)
            })

            it('increases accordingly the ticket ID', async function () {
                expect(await this.proxy.ticketId()).to.be.equal(1n)
            })

            it('emits event on every bought ticket', async function () {
                await expect(buyTicketTx).to.emit(this.proxy, 'TicketBought')
            })
        })

        describe('#RequestEventWinner', () => {
            let EVENT_MOCK: MockContract<Event>

            beforeEach(async function () {
                const RNG_FAKE = await smock.fake<RNGService>('RNGService')
                EVENT_MOCK = await (await smock.mock<Event__factory>('Event')).deploy(RNG_FAKE.address)
            })

            it('emits event on every request for an event winner', async function () {
                await expect(EVENT_MOCK.requestEventWinner()).to.emit(EVENT_MOCK, 'EventWinnerRequested')
            })
        })

        describe('#ApplyRewarding', () => {
            it('emits event on every reward applying', async function () {
                const signer = await hre.ethers.getImpersonatedSigner(hre.RNGService.address)
                await hre.users.deployer.sendTransaction({
                    to: signer.address,
                    value: hre.ethers.utils.parseEther('1'),
                })
                await expect(await this.proxy.connect(signer).applyRewarding(12)).to.emit(this.proxy, 'EventWinner')
            })

            /* ... */ // The rest of the tests
        })

        describe('#WithdrawFunds', () => {
            let withdrawFundsTx: TransactionResponse

            beforeEach(async function () {
                withdrawFundsTx = await this.proxy.withdrawFunds()
            })

            it('changes ether balances on withdraw', async function () {
                await expect(withdrawFundsTx).changeEtherBalances(
                    [this.proxy, hre.users.deployer],
                    [-this.eventParams[5], this.eventParams[5]]
                )
            })

            it('emits event on every event withdraw', async function () {
                await expect(withdrawFundsTx).to.emit(this.proxy, 'EventWithdraw')
            })
        })
    })

    /* ================================================ ATTACK ================================================ */

    describe('#Attack', () => {
        it('reverts on proxy reinitialization', async function () {
            await expect(
                this.proxy.initialize('F', 'O', 'O', hre.users.deployer.address, 1, 2, 3)
            ).to.be.revertedWithCustomError(this.proxy, 'InvalidInitialization')
        })

        it('reverts on contract (proxied state) initialization', async function () {
            await expect(
                hre.Event.initialize('F', 'O', 'O', hre.users.deployer.address, 1, 2, 3)
            ).to.be.revertedWithCustomError(this.proxy, 'InvalidInitialization')
        })

        it('reverts if no value is supplied on {buyTicket}', async function () {
            await expect(this.proxy.buyTicket()).to.be.revertedWithCustomError(this.proxy, 'InsufficientBuyValue')
        })

        it('reverts on {buyTicket} when the sale period is over', async function () {
            await mine(1)
            await expect(this.proxy.buyTicket()).to.be.revertedWithCustomError(this.proxy, 'SaleNotActive')
        })

        it('reverts if {requestEventWinner} is called in active sale period', async function () {
            await expect(this.proxy.requestEventWinner()).to.be.revertedWithCustomError(this.proxy, 'SaleIsActive')
        })

        it('reverts if a user tries to call the {applyRewarding}', async function () {
            await expect(this.proxy.connect(hre.users.userOne).applyRewarding(1)).to.be.revertedWithCustomError(
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
