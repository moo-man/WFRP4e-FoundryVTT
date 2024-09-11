if (args.opposedTest.result.differenceSL >= 0 && args.opposedTest.result.differenceSL <= 2 && args.opposedTest.result.winner == "attacker")
{ 
    this.script.message(`Becomes lodged in the armour or flesh of the opponent. See @UUID[${this.item.uuid}]{${this.item.name}}.`, speaker : {alias : this.item.name}, {blind: true, whisper : ChatMessage.getWhisperRecipients("GM")})
}
    