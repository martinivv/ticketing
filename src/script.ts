import hre from 'hardhat'
import { getCurrentBlock, parseAmount } from './_helpers/shared-helpers'
import { Event } from './_helpers/typechain'

// Preconditions 👇
const value = parseAmount('1', 18)

async function main() {
    console.log(`\n${Array(60).join('=')}\n`)

    await hre.deployments.run('all')
    console.log('>>> The marketplace has been successfully deployed')

    const saleStartBlock = (await getCurrentBlock()) + 1
    await hre.Marketplace.createEvent('URI', 'EVENT', 'EVNT', saleStartBlock, saleStartBlock + 2, value)
    console.log('>>> An event has been created')

    const proxy = hre.Event.attach((await hre.Marketplace.getAllProxies())[0]) as Event
    await proxy.connect(hre.users.userOne).buyTicket({ value })
    console.log('>>> A user has purchased a ticket')

    await proxy.connect(hre.users.userTwo).buyTicket({ value })
    console.log('>>> Another user has purchased a ticket')

    await proxy.withdrawFunds()
    console.log('>>> The event creator has withdrawn their funds')

    console.log(`\n${Array(60).join('=')}\n`)
}

main().catch((e) => {
    console.error(e)
    process.exitCode = 1
})
