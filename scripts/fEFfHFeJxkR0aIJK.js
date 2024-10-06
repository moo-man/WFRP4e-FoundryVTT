if (args.opposedTest.result.differenceSL >= 0 && args.opposedTest.result.differenceSL <= 3 && args.opposedTest.result.winner == "attacker")
{ 
    this.script.message(`Everyone within 20 feet loses 1 Wound and makes a <strong>Difficult (-10) Endurance</strong> or gains @Condition[Deafened]`, {blind : true,  whisper : ChatMessage.getWhisperRecipients("GM")})
}
    