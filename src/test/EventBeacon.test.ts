import { expect } from 'chai'
import hre from 'hardhat'
import { fixtures } from '../_helpers/shared-helpers'

describe('EventBeacon', () => {
    fixtures(['all'])

    describe('#State', () => {
        it('sets standard implementation', async function () {
            expect(await hre.EventBeacon.implementation()).to.be.equal(hre.Event.address)
        })

        it('sets standard initial owner', async function () {
            expect(await hre.EventBeacon.owner()).to.be.equal(hre.Marketplace.address)
        })
    })

    describe('#Attack', () => {
        it('reverts on incorrect input', async function () {
            await expect(hre.Marketplace.setupEvents(hre.ethers.constants.AddressZero)).to.be.reverted
        })
    })
})
