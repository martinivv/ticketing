import hre from 'hardhat'
import { Test_getSaleDuration, Test_value as value } from './_helpers/shared-helpers'
import { Event } from './_helpers/typechain'

async function script() {
    console.log(`\n${Array(60).join('=')}\n`)

    await hre.deployments.run('all')
    console.log('>>> The marketplace has been successfully deployed')

    const { saleStart, saleEnd } = await Test_getSaleDuration()
    await hre.Marketplace.createEvent('URI', 'EVENT', 'EVNT', saleStart, saleEnd + 1n, value)
    console.log('>>> An event has been created')

    const proxy = hre.Event.attach((await hre.Marketplace.getAllEvents())[0]) as Event
    await proxy.connect(hre.users.userOne).buyTicket({ value })
    console.log('>>> A user has purchased a ticket')

    await proxy.connect(hre.users.userTwo).buyTicket({ value })
    console.log('>>> Another user has purchased a ticket')

    await proxy.withdrawFunds()
    console.log('>>> The event creator has withdrawn their funds')

    console.log(`\n${Array(60).join('=')}\n`)
}

script().catch((e) => {
    console.error(e)
    process.exitCode = 1
})
