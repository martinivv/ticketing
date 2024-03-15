import hre from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { Test_LINK_TOKEN, Test_VRF_WRAPPER, deployContract } from '../_helpers/shared-helpers'
import { Event, EventBeacon, Marketplace, RNGService } from '../_helpers/typechain'

const all: DeployFunction = async function ({ deployments: { log } }) {
    log('\n#01')

    const rngDeploy = await deployContract('RNGService', { args: [Test_LINK_TOKEN, Test_VRF_WRAPPER] })
    const eventDeploy = await deployContract('Event', { args: [rngDeploy.address] })
    // prettier-ignore
    const eventBeaconDeploy = await deployContract('EventBeacon', { args: [eventDeploy.address, hre.users.deployer.address]})
    await deployContract('Marketplace', { args: [eventBeaconDeploy.address, hre.users.deployer.address] })

    /* =========== USED IN SCRIPTS/TESTS =========== */
    const [Marketplace, Event, EventBeacon, RNGService] = await Promise.all([
        hre.ethers.getContract('Marketplace'),
        hre.ethers.getContract('Event'),
        hre.ethers.getContract('EventBeacon'),
        hre.ethers.getContract('RNGService'),
    ])
    hre.Marketplace = Marketplace as Marketplace
    hre.Event = Event as Event
    hre.EventBeacon = EventBeacon as EventBeacon
    hre.RNGService = RNGService as RNGService
    /* =========== / =========== */

    log('🟢 | The Marketplace has been successfully deployed!\n')
}

all.tags = ['all']
export default all
