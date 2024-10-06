let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();

if (test.failed)
{
    this.actor.update({"system.status.corruption.value" : parseInt(this.actor.status.corruption.value) + 1})
    this.script.message("Gained a Corruption point", {whisper : ChatMessage.getWhisperRecipients("GM")})
    if (test.result.roll % 11 == 0 || test.result.roll == 100)
    {
        this.script.message(`<strong>Fumble</strong>: immediately gain 1 @Table[mutatemental]{Mental Mutation}, and may not take a Short-term Ambition for the next [[1d10]] weeks.`, {whisper : ChatMessage.getWhisperRecipients("GM")})
    }
}