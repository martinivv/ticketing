import { expect } from 'chai'
import hre from 'hardhat'
import { fixtures } from '../_helpers/shared-helpers'

describe('EventBeacon', () => {
    fixtures(['all'])

    /* ============================================ INITIALIZATION ============================================ */

    describe('#State', () => {
        it('sets standard implementation', async function () {
            expect(await hre.EventBeacon.implementation()).to.be.equal(hre.Event.address)
        })

        it('sets standard initial owner', async function () {
            expect(await hre.EventBeacon.owner()).to.be.equal(hre.users.deployer.address)
        })
    })

    /* ================================================ ATTACK ================================================ */

    describe('#Attack', () => {
        before(async function () {
            this.Factory = await hre.ethers.getContractFactory('EventBeacon')
        })

        it('reverts on falsy implementation', async function () {
            await expect(
                this.Factory.deploy(hre.ethers.constants.AddressZero, hre.users.deployer.address)
            ).to.be.revertedWithCustomError(hre.EventBeacon, 'BeaconInvalidImplementation')
        })

        it('reverts on falsy initial owner', async function () {
            await expect(
                this.Factory.deploy(hre.Event.address, hre.ethers.constants.AddressZero)
            ).to.be.revertedWithCustomError(hre.EventBeacon, 'OwnableInvalidOwner')
        })

        it('reverts when a non-owner tries to renounce the ownership', async function () {
            await expect(hre.EventBeacon.connect(hre.users.userOne).renounceOwnership()).to.be.revertedWithCustomError(
                hre.EventBeacon,
                'OwnableUnauthorizedAccount'
            )
        })
        it('reverts when a non-owner tries to transfer the ownership', async function () {
            await expect(
                hre.EventBeacon.connect(hre.users.userOne).transferOwnership(hre.users.userTwo.address)
            ).to.be.revertedWithCustomError(hre.EventBeacon, 'OwnableUnauthorizedAccount')
        })

        it('reverts when a non-owner tries to update the base implementation', async function () {
            await expect(
                hre.EventBeacon.connect(hre.users.userOne).upgradeTo(hre.Event.address)
            ).to.be.revertedWithCustomError(hre.EventBeacon, 'OwnableUnauthorizedAccount')
        })
    })
})
