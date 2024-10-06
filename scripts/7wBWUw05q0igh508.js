// Imbibing this substance grants the user the Painless Creature Trait.
const hasPainless = this.actor.has("Painless");
if (hasPainless === undefined) 
{
  let item = await fromUuid("Compendium.wfrp4e-core.items.wMwSRDmgiF2IdCJr");
  let data = item.toObject()
  this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})
  
  this.script.message(
  `<p><strong>${this.actor.prototypeToken.name}</strong> has gained the Painless Creature Trait. This
    effect lasts for one hour, after which it dissipates and the full effect
    of all the imbiber's wounds come crashing down at once.</p>
    <p>Note that this does not prevent the user from acquiring a Critical
    Wound or dying from one. It merely allows them to ignore most
    of their effects.</p>`, 
    { whisper: ChatMessage.getWhisperRecipients("GM"), blind: true})
}