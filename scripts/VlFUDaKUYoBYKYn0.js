let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, context : {failure: "1 Corruption Point Gained"}})
await test.roll();
if (test.failed && this.actor.type == "character")
{
    this.actor.update({"system.status.corruption.value" : parseInt(this.actor.status.corruption.value) + 1})
    this.script.message("Gained a Corruption point", {whisper : ChatMessage.getWhisperRecipients("GM")})
}