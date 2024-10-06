if (args.opposedTest.result.differenceSL >= 0 && args.opposedTest.result.differenceSL <= 2 && args.opposedTest.result.winner == "attacker")
{ 
    this.script.message(`Emits a cloud of foul-smelling blackpowder. Enable the <strong>Fellowship Penalty</strong> Active Effect on @UUID[${this.actor.uuid}].`, {blind : true, whisper : ChatMessage.getWhisperRecipients("GM")})
}