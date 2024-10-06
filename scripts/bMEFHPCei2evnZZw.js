// Victims that take at least 1 Wound from a Fell Dagger
// immediately take a Poisoned Condition 
// resisted with a Difficult (-10) Endurance Test. 

// TODO: Add Venom strength to message

if (args.totalWoundLoss > 0) 
{
  args.actor.addCondition("poisoned")
  this.script.message(`
      <strong>${this.effect.name}</strong>:<br>
      <strong>${args.actor.name}</strong> has been given a @Condition[Poisoned] Condition, which can be resisted with a <strong>Difficult (-10) Endurance</strong> Test.`, 
      {whisper: ChatMessage.getWhisperRecipients("GM")})
}
