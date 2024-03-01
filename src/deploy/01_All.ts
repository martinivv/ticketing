import hre from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { Test_LINK_TOKEN, Test_VRF_WRAPPER, deployContract } from '../_helpers/shared-helpers'

const all: DeployFunction = async function ({ deployments: { log } }) {
    log('\n#1')

    const rngServiceAddr = await deployContract('RNGService', { args: [Test_LINK_TOKEN, Test_VRF_WRAPPER] })
    const eventImplAddr = await deployContract('Event', { args: [rngServiceAddr] })
    const eventBeaconAddr = await deployContract('EventBeacon', { args: [eventImplAddr, hre.users.deployer.address] })
    const marketplaceAddr = await deployContract('Marketplace', { args: [eventBeaconAddr, hre.users.deployer.address] })

    // ========== USED IN TESTS/SCRIPTS ==========
    hre.Marketplace = await hre.ethers.getContractAt('Marketplace', marketplaceAddr)
    hre.Event = await hre.ethers.getContractAt('Event', eventImplAddr)
    hre.RNGService = await hre.ethers.getContractAt('RNGService', rngServiceAddr)
    hre.EventBeacon = await hre.ethers.getContractAt('EventBeacon', eventBeaconAddr)
    // ==========

    log('🟢 | The Marketplace has been successfully deployed!\n')
}

all.tags = ['all']
export default all
