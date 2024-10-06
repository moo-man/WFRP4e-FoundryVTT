if (args.totalWoundLoss > 0) {
  args.opposedTest.result.other.push(
  `@Corruption[minor]{Moderate Exposure to Corruption}`
  )
  this.script.message(`<strong>${this.effect.name}</strong>: 
      @Corruption[moderate]{Moderate Exposure to Corruption} <br/>
      <strong>${args.actor.prototypeToken.name}</strong> must take an 
      <strong>Corruption (Moderate) Test</strong>`, 
      {whisper: ChatMessage.getWhisperRecipients("GM")}
  )
}