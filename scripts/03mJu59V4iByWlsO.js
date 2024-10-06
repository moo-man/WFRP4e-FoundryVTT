// The imbiber immediately
// takes 3 Poisoned Conditions that cannot be resisted at first,
await this.actor.addCondition("poisoned", 3)

// recovers a number of Wounds equal to their Toughness Bonus, 
await this.actor.modifyWounds(this.actor.system.characteristics.t.bonus)

// and acquires the Regenerate Creature Trait.
const hasRegenerate = this.actor.has("Regenerate")
if (hasRegenerate === undefined) {
  fromUuid("Compendium.wfrp4e-core.items.SfUUdOGjdYpr3KSR").then(trait => {
    let traitItem = trait.toObject()
    this.actor.createEmbeddedDocuments("Item", [traitItem], {fromEffect: this.effect.id})
  })
}

this.script.message(`<p><strong>${this.actor.prototypeToken.name}</strong> has 
    <ul>
      <li>gained 3 Poisoned Conditions that cannot be resisted at first</li>
      <li>recovered ${this.actor.system.characteristics.t.bonus} Wounds</li>
      <li>acquired the Regenerate Creature Trait.</li>
    </ul>
    It’s up to Ranald if their regenerating can outpace their poisoning.</p>
    <p>When all Poisoned Conditions are lost, so too is Regenerate.</p>`, 
    { whisper: ChatMessage.getWhisperRecipients("GM"), blind: true })   
