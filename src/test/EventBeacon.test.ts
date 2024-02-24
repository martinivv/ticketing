import { expect } from 'chai'
import hre from 'hardhat'
import { fixtures } from '../_helpers/shared-helpers'

describe('EventBeacon', () => {
    fixtures(['all'])

    describe('#Initialization', () => {
        it('sets standard implementation', async function () {
            expect(await hre.EventBeacon.implementation()).to.be.equal(hre.dataOnDeployment.eventImplementationAddr)
        })

        it('sets standard initial owner', async function () {
            expect(await hre.EventBeacon.owner()).to.be.equal(hre.dataOnDeployment.marketplaceAddr)
        })
    })

    describe('#Attack', () => {
        it('reverts on incorrect input', async function () {
            await expect(hre.Marketplace.setupEvents(hre.ethers.ZeroAddress)).to.be.reverted
        })
    })
})
