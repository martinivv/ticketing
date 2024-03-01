import hre from 'hardhat'

export const Test_LINK_TOKEN = '0x514910771AF9Ca656af840dff83E8264EcF986CA'
export const Test_VRF_WRAPPER = '0x5A861794B927983406fCE1D062e00b9368d97Df6'

export const deployContract = async (contractName: string, options_ = {}) => {
    const [deployer] = await hre.ethers.getSigners()
    const options = { from: deployer.address, ...options_ }
    return (await hre.deployments.deploy(contractName, options)).address
}

export const Test_getSaleDuration = async () => {
    const currentBlock = BigInt(await hre.network.provider.send('eth_blockNumber'))
    const saleStart = currentBlock + 1n
    const saleEnd = currentBlock + 2n
    return { saleStart, saleEnd }
}

export const value = BigInt(hre.ethers.utils.parseEther('1').toString())

export const fixtures = function (fixtureNames: string[]) {
    beforeEach(async function () {
        await hre.deployments.fixture(fixtureNames)
    })
}
