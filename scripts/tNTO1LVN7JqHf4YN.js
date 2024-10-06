if (args.test.characteristicKey == "wp") 
{
    if (args.test.failed)
    {
        this.actor.createEmbeddedDocuments("ActiveEffect", [game.wfrp4e.config.symptomEffects["malaise"]])
        this.script.message(`Willpower Test failed, <b>${this.actor.prototypeToken.name}</b> gains @Condition[Malaise] for [[1d10]] hours`, {whisper: ChatMessage.getWhisperRecipients("GM")})
    }
}