let test = await this.actor.setupCharacteristic("wp", {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();


let opposedResult = test.opposedMessages[0]?.system.opposedHandler?.resultMessage?.system.opposedTest?.result

if (opposedResult?.winner == "attacker")
{
    let spells = this.actor.itemTypes.spell;
    if (spells.length)
    {
        let chosen = spells[Math.floor(CONFIG.Dice.randomUniform() * spells.length)]
        this.script.message(`Loses access to <strong>${chosen.name}</strong>`)
        chosen.update({name : chosen.name += " (LOST)"})
    }
}


