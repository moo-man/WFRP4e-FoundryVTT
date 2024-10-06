// After consumption, the user gains the Magic Resistance 3 Creature Trait, 
// reducing the SL of any spell affecting it by 3. 
// This effect lasts for one hour.
const hasMagicResistance = this.actor.has("Magic Resistance")

if (hasMagicResistance === undefined) {
  fromUuid("Compendium.wfrp4e-core.items.yrkI7ATjqLPDTFmZ").then(trait => {
    let traitItem = trait.toObject()
    traitItem.system.specification.value = 2
    this.actor.createEmbeddedDocuments("Item", [traitItem], {fromEffect: this.effect.id})
  })
  this.script.message(`<p><strong>${this.actor.prototypeToken.name}</strong> has gained the Magic Resistance Trait. This effect lasts for one hour.</p>`, {whisper: ChatMessage.getWhisperRecipients("GM"), blind: true })   
}

if (hasMagicResistance) {
  // Multiple doses may be consumed at once, with each one adding an additional 1 to the Magic Resistance rating and increasing the duration by one hour.  
  let msg = `<p><strong>${this.actor.prototypeToken.name}</strong> has enhanced their Magic Resistance by 1 to Rating ${parseInt(hasMagicResistance.system.specification.value)}. This effect lasts for one hour.</p>`

  // Resist toxic effect
  this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {
    fields: {difficulty: "challenging"}
  }).then(async test => {
    await test.roll()

    // If they fail ...
    if (!test.succeeded) {
      msg += `<p>However, they begin to ooze the thick, poisonous slime that coats every Dreadmaw.  They have gained 1 Poisoned Condition now and should continue to receive an additional @Condition[Poisoned] Condition at the end of each of the round.</p>
      <p>If they are still alive at the end of 10 rounds, the effect ends and all Poisoned Conditions gained from ${this.effect.name} are removed.</p>`
      this.actor.addCondition("poisoned", 1)
    }
    this.script.message(msg, {whisper: ChatMessage.getWhisperRecipients("GM"), blind: true })
  })
}
