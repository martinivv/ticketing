import { FakeContract, smock } from '@defi-wonderland/smock'
import { expect } from 'chai'
import hre from 'hardhat'
import linkTokenInterface from '../../build/artifacts/@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol/LinkTokenInterface.json'
import { Test_LINK_TOKEN, Test_VRF_WRAPPER, fixtures, value } from '../_helpers/shared-helpers'
import { LinkTokenInterface, RNGService__factory } from '../_helpers/typechain'

describe('RNGService', () => {
    fixtures(['all'])

    /* ============================================ INITIALIZATION ============================================ */

    describe('#State-Initialization', () => {
        it('sets standard LINK token address', async function () {
            expect(await hre.RNGService.linkTokenAddr()).to.be.equal(Test_LINK_TOKEN)
        })
    })

    /* ============================================ FUNCTIONALITIES =========================================== */

    describe('#Functionalities', () => {
        describe('#Funding', () => {
            it('receives funds', async function () {
                await expect(
                    hre.users.deployer.sendTransaction({
                        to: hre.RNGService.address,
                        value,
                    })
                ).to.changeEtherBalances([hre.users.deployer, hre.RNGService.address], [-value, value])
            })
        })

        describe('#FundVrfConsumer', () => {
            let LINK_TOKEN: FakeContract<LinkTokenInterface>

            beforeEach(async function () {
                LINK_TOKEN = await smock.fake<LinkTokenInterface>({ abi: linkTokenInterface.abi })
                this.RNGSERVICE_MOCK = await (
                    await smock.mock<RNGService__factory>('RNGService')
                ).deploy(LINK_TOKEN.address, Test_VRF_WRAPPER)
            })

            it('funds the `RNGService` successfully in order to perform a VRF request', async function () {
                LINK_TOKEN.transferFrom
                    .whenCalledWith(
                        hre.users.deployer.address,
                        this.RNGSERVICE_MOCK.address,
                        BigInt(hre.ethers.utils.parseEther('0.25').toString())
                    )
                    .returns(true)

                await expect(this.RNGSERVICE_MOCK.fundVrfConsumer()).to.not.be.reverted
            })
        })
    })

    /* ================================================ ATTACK ================================================ */

    describe('#Attack', () => {
        it('reverts on invalid initialization data', async function () {
            const Factory = await hre.ethers.getContractFactory('RNGService')
            await expect(
                Factory.deploy(hre.ethers.constants.AddressZero, Test_VRF_WRAPPER)
            ).to.be.revertedWithCustomError(hre.RNGService, 'InvalidIO')
        })
    })
})
