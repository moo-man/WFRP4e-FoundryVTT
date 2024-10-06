if (args.test.result.SL < 0)
{
    this.script.message(`Gained ${Math.abs(args.test.result.SL)} Corruption points`, {whisper : ChatMessage.getWhisperRecipients("GM")})
    if (args.test.failed && this.actor.type == "character")
    {
        this.actor.update({"system.status.corruption.value" : parseInt(this.actor.status.corruption.value) + Math.abs(args.test.result.SL)})
    }
}