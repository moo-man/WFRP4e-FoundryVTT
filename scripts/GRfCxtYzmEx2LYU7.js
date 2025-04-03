if (args.totalWoundLoss >= 1)
{
    let roll = await new Roll("1d10").roll({allowInteractive : false});
    await roll.toMessage(this.script.getChatData());
    if (roll.total == 9)
    {
        this.script.message(`Two @UUID[Compendium.wfrp4e-eis.actors.iDy8SDTwJSlCzZMl]{Blue Horror of Tzeentch} claw their way out of ${this.actor.name}'s screaming flesh, killing them in the process.`, {whisper : ChatMessage.getWhisperRecipients("GM")})
    }
}