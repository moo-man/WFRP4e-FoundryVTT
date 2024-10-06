if (args.totalWoundLoss > 0)
{
    this.script.message(`<b>${args.actor.name}</b> must pass an <b>Easy (+40) Endurance</b> Test or gain a @UUID[Compendium.wfrp4e-core.items.kKccDTGzWzSXCBOb]{Festering Wound}`, {whisper: ChatMessage.getWhisperRecipients("GM")})
}