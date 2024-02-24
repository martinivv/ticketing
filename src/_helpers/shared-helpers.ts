import { Numeric } from 'ethers'
import hre, { deployments, network } from 'hardhat'

/* ============================================== PARAMETERS ============================================== */

export const LINK_TOKEN = '0x514910771AF9Ca656af840dff83E8264EcF986CA'
export const VRF_WRAPPER = '0x5A861794B927983406fCE1D062e00b9368d97Df6'

/* ============================================= DEPLOYMENT/SCRIPTS/TESTS ============================================ */

export const deployContract = async (contractName: string, options_ = {}) => {
    const [deployer] = await hre.ethers.getSigners()
    const options = { from: deployer.address, ...options_ }
    return (await deployments.deploy(contractName, options)).address
}

export const getCurrentBlock = async () => Number(await network.provider.send('eth_blockNumber'))
export const parseAmount = (value: string, unit: string | Numeric | undefined) => hre.ethers.parseUnits(value, unit)

export const fixtures = function (fixtureNames: string[]) {
    beforeEach(async function () {
        await hre.deployments.fixture(fixtureNames)

        this.value = parseAmount('1', 18)
    })
}
