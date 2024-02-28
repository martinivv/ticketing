import hre from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { Test_LINK_TOKEN, Test_VRF_WRAPPER, deployContract } from '../_helpers/shared-helpers'

const all: DeployFunction = async function ({ deployments: { log } }) {
    log('\n#1')

    const rngServiceAddr = await deployContract('RNGService', { args: [Test_LINK_TOKEN, Test_VRF_WRAPPER] })
    const eventImplAddr = await deployContract('Event', { args: [rngServiceAddr] })
    const marketplaceAddr = await deployContract('Marketplace', { args: [hre.users.deployer.address] })

    const marketplaceContract = await hre.ethers.getContractAt('Marketplace', marketplaceAddr)
    await marketplaceContract.setupEvents(eventImplAddr)

    // ========== USED IN TESTS/SCRIPTS ==========
    hre.Marketplace = marketplaceContract
    hre.Event = await hre.ethers.getContractAt('Event', eventImplAddr)
    hre.RNGService = await hre.ethers.getContractAt('RNGService', rngServiceAddr)
    hre.EventBeacon = await hre.ethers.getContractAt('EventBeacon', await marketplaceContract.BEACON_())
    // ==========

    log('🟢 | The Marketplace has been successfully deployed!\n')
}

all.tags = ['all']
export default all
