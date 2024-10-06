let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, context: { failure: "1 Corruption Point Gained" } })
await test.roll();

if (test.failed && args.actor.type == "character") 
{
    let msg = ""
    msg += `<p><b>${this.actor.prototypeToken.name}</b> gained a Corruption point</p>`
    if (test.result.roll % 11 == 0 || test.result.roll == 100)
    {
        msg +=  `<b>${args.actor.prototypeToken.name}</b> gains a mutation (@Table[expandedmutatephys]{Physical} or @Table[expandedmutatemental]{Mental}) and gains @UUID[Compendium.wfrp4e-core.items.hiU7vhBOVpVI8c7C]{Chaos Magic (Tzeentch)}`
    }
    this.script.message(msg, {whisper : ChatMessage.getWhisperRecipients("GM")})
    await this.actor.update({ "system.status.corruption.value": parseInt(args.actor.status.corruption.value) + 1 })
}