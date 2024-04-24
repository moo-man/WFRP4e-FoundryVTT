if (args.totalWoundLoss >= 1)
{
    let roll = await new Roll("1d10").roll();
    await roll.toMessage(this.script.getChatData());
    if (roll.total == 9)
    {
        this.script.scriptMessage(`Two @UUID[Compendium.wfrp4e-eis.actors.cLOGeMqUty61nYB9]{Blue Horror of Tzeentch} claw their way out of ${this.actor.name}'s screaming flesh, killing them in the process.`, {whisper : ChatMessage.getWhisperRecipients("GM")})
    }
}