import { expect } from 'chai'
import hre from 'hardhat'
import { LINK_TOKEN, VRF_WRAPPER, fixtures } from '../_helpers/shared-helpers'

describe('RNGService', () => {
    fixtures(['all'])

    describe('#Initialization', () => {
        it('sets standard LINK token address', async function () {
            expect(await hre.RNGService.linkTokenAddr()).to.be.equal(LINK_TOKEN)
        })
    })

    describe('#Attack', () => {
        // Our contract's integrity 👇
        it('reverts on invalid initialization data', async function () {
            const Factory = await hre.ethers.getContractFactory('RNGService')
            await expect(Factory.deploy(hre.ethers.ZeroAddress, VRF_WRAPPER)).to.be.revertedWithCustomError(
                hre.RNGService,
                'InvalidIO'
            )
        })
    })
})
