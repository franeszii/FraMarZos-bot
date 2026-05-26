function randomMs(minMs, maxMs) {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
}
function setupLeaveRejoin(bot, createBot) {
    let leaveTimer = null
    let jumpTimer = null
    let jumpOffTimer = null
    let stopped = false
    let reconnectAttempts = 0

    function cleanup() {
        stopped = true
        if (leaveTimer) clearTimeout(leaveTimer)
        if (jumpTimer) clearTimeout(jumpTimer)
        if (jumpOffTimer) clearTimeout(jumpOffTimer)
        leaveTimer = jumpTimer = jumpOffTimer = null
    }

    function scheduleNextJump() {
        if (stopped || !bot.entity) return
        bot.setControlState('jump', true)
        jumpOffTimer = setTimeout(() => {
            bot.setControlState('jump', false)
        }, 300)
        const nextJump = randomMs(20000, 5 * 60 * 1000)
        jumpTimer = setTimeout(scheduleNextJump, nextJump)
    }

    bot.once('spawn', () => {
        reconnectAttempts = 0
        cleanup()
        stopped = false

        // Bot zostaje 1-2 godziny zamiast 1-5 minut
        const stayTime = randomMs(3600000, 7200000)
        console.log(`[AFK] Will leave in ${Math.round(stayTime / 1000 / 60)} minutes`)

        scheduleNextJump()

        leaveTimer = setTimeout(() => {
            if (stopped) return
            console.log('[AFK] Leaving server (timer)')
            cleanup()
            try {
                bot.quit()
            } catch (e) {}
        }, stayTime)
    })

    bot.on('end', () => { cleanup() })
    bot.on('kicked', () => { cleanup() })
    bot.on('error', () => { cleanup() })
}
module.exports = setupLeaveRejoin
