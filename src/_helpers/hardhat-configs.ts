import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { Addressable } from 'ethers'
import { extendEnvironment } from 'hardhat/config'
import 'hardhat/types/runtime'
import { Event, EventBeacon, Marketplace, RNGService } from './typechain'

/* ============================================= AUGMENTATION ============================================= */

// Enables easier testing
extendEnvironment(async function (hre) {
    hre.users = await hre.ethers.getNamedSigners()
})

declare module 'hardhat/types/runtime' {
    interface HardhatRuntimeEnvironment {
        users: Record<string, HardhatEthersSigner>
        dataOnDeployment: {
            rngServiceAddr: string | Addressable
            eventImplementationAddr: string | Addressable
            marketplaceAddr: string | Addressable
        }
        Marketplace: Marketplace
        Event: Event
        EventBeacon: EventBeacon
        RNGService: RNGService
    }
}
