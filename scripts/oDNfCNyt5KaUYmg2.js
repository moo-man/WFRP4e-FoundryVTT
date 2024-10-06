if(args.opposedTest.result.winner == "defender")
{
    let roll = Math.ceil(CONFIG.Dice.randomUniform() * 10)
    let msg = `Rolled ${roll}.`
    if (roll >= 7)
    {
          msg = `Attack hits with an SL of ${roll - 6}.`
    }
    this.script.message(msg, {blind: true,  whisper : ChatMessage.getWhisperRecipients("GM")})
}