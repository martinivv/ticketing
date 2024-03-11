import hre from 'hardhat'

/* ============================================== DEPLOYMENT ============================================== */

export const deployContract = async function (contractName: string, options_ = {}) {
    const deployerAddr = hre.users ? hre.users.deployer.address : (await hre.ethers.getNamedSigners()).deployer.address
    const options = { from: deployerAddr, ...options_ }
    return await hre.deployments.deploy(contractName, options)
}

/* ============================================= SCRIPTS&TESTS ============================================ */

export const Test_LINK_TOKEN = '0x514910771AF9Ca656af840dff83E8264EcF986CA'
export const Test_VRF_WRAPPER = '0x5A861794B927983406fCE1D062e00b9368d97Df6'

export const Test_value = BigInt(hre.ethers.utils.parseEther('1').toString())

export const fixtures = function (fixtureNames: string[]) {
    beforeEach(async function () {
        await hre.deployments.fixture(fixtureNames)
    })
}

export const Test_getSaleDuration = async function () {
    const currentBlock = BigInt(await hre.network.provider.send('eth_blockNumber'))
    const saleStart = currentBlock + 1n
    const saleEnd = currentBlock + 2n
    return { saleStart, saleEnd }
}
