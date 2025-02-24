export default function() {
    Hooks.on("updateSetting", (setting) => {


        // Centralized handling of group advantage updates
        // If group advantage is updated, update advantage of all combatants in the current combat
        // Then, make sure that change is reflected in the counter on the combat tracker (if the update was made by a different user)
        if (setting.key == "wfrp4e.groupAdvantageValues")
        {
            ui.notifications.notify(game.i18n.format("GroupAdvantageUpdated", {players : setting.value.players, enemies : setting.value.enemies}))
            if (game.user.isGM && game.combat)
            {
                // This sorta sucks because there isn't a way to update both actors and synthetic actors in one call
                game.combat.combatants.forEach(c => {
                    if (c.actor.status.advantage.value != setting.value[c.actor.advantageGroup])
                        c.actor.update({"system.status.advantage.value" : setting.value[c.actor.advantageGroup]}, {fromGroupAdvantage : true})
                })
            }
            // Update counter values, can't just use ui.combat because there might be popped out combat trackers
            [ui.combat].concat(Object.values(ui.windows).filter(w => w instanceof CombatTracker)).forEach(tracker => {
                tracker.element.find(".advantage-group input").each((index, input) => {
                    let group = input.dataset.group
                    input.value = setting.value[group]
                })
            })
        }
    })

  
}