import type { HardhatUserConfig } from 'hardhat/types'

/* ================================================ PLUGINS =============================================== */
import '@nomicfoundation/hardhat-toolbox'

/* ================================================ CONFIGS =============================================== */

export default <HardhatUserConfig>{
    solidity: '0.8.20',
    paths: {
        artifacts: './build/artifacts',
        cache: './build/cache',
    },
    typechain: {
        target: 'ethers-v6',
        outDir: 'types/typechain',
    },
}
