import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { extendEnvironment } from 'hardhat/config'
import 'hardhat/types/runtime'
import { Event, EventBeacon, Marketplace, RNGService } from './typechain'

/* ============================================= AUGMENTATION ============================================= */

// For an easier testing
extendEnvironment(async function (hre) {
    hre.users = await hre.ethers.getNamedSigners()
})

declare module 'hardhat/types/runtime' {
    interface HardhatRuntimeEnvironment {
        users: Record<string, SignerWithAddress>
        Marketplace: Marketplace
        Event: Event
        EventBeacon: EventBeacon
        RNGService: RNGService
    }
}
