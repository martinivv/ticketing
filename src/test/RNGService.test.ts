import { expect } from 'chai'
import hre from 'hardhat'
import { Test_LINK_TOKEN, Test_VRF_WRAPPER, fixtures } from '../_helpers/shared-helpers'

describe('RNGService', () => {
    fixtures(['all'])

    describe('#State-Initialization', () => {
        it('sets standard LINK token address', async function () {
            expect(await hre.RNGService.linkTokenAddr()).to.be.equal(Test_LINK_TOKEN)
        })
    })

    describe('#Attack', () => {
        it('reverts on invalid initialization data', async function () {
            const Factory = await hre.ethers.getContractFactory('RNGService')
            await expect(
                Factory.deploy(hre.ethers.constants.AddressZero, Test_VRF_WRAPPER)
            ).to.be.revertedWithCustomError(hre.RNGService, 'InvalidIO')
        })
    })
})
