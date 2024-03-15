import type { HardhatUserConfig } from 'hardhat/types'

/* ================================================ PLUGINS =============================================== */

import '@nomicfoundation/hardhat-chai-matchers'
import '@typechain/hardhat'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'

/* ============================================= AUGMENTATION ============================================= */

import './src/_helpers/hardhat-configs'

/* ================================================ CONFIGS =============================================== */

export default <HardhatUserConfig>{
    paths: {
        sources: './src/contracts',
        deploy: './src/deploy',
        tests: './src/test',
        artifacts: './build/artifacts',
        cache: './build/cache',
    },
    solidity: {
        version: '0.8.20',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1300,
            },
        },
    },
    typechain: {
        target: 'ethers-v5',
        outDir: './src/_helpers/typechain',
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        userOne: {
            default: 1,
        },
        userTwo: {
            default: 2,
        },
    },
}
