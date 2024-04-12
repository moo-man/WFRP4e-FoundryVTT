// Each time the blade is used, the GM should secretly roll a d10.
// On a 1, its poison has run dry, 
// and the next time it is employed it will shatter.

if (Math.ceil(CONFIG.Dice.randomUniform() * 10) == 1) {
  this.item.setFlag("wfrp4e", "brittle", true)
  ChatMessage.create({
    content: `
      <strong>${this.item.name}</strong> has run out of poison. It will shatter the next time it is used.`, 
    whisper: ChatMessage.getWhisperRecipients("GM"),
    blind: true
  })
}
