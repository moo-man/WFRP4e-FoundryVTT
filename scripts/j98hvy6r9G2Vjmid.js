if (args.totalWoundLoss > 0) 
{
  args.opposedTest.result.other.push(
  `@Corruption[minor]{Minor Exposure to Corruption}`
  )
  this.script.message(
  `<strong>${this.effect.name}</strong>: 
    @Corruption[minor]{Minor Exposure to Corruption} <br/>
    <strong>${args.actor.prototypeToken.name}</strong> must take an 
    <strong>Average (+20%) Corruption (Minor) Test</strong>`, 
    {whisper: ChatMessage.getWhisperRecipients("GM")})
}