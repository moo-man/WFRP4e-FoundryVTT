// Imbibing this substance grants the user the Painless Creature Trait.
const hasColdBlooded = this.actor.has("Cold Blooded")
if (hasColdBlooded === undefined) 
{
  let item = await fromUuid("Compendium.wfrp4e-core.items.mCh1KK9jomwFZcLB")
  let data = item.toObject()
  this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})
  
  this.script.message(`<p><strong>${this.actor.prototypeToken.name}</strong> has gained the Cold Blooded Creature Trait and may reverse any failed Willpower based Tests.</p>
  <p>If they gain a Surprised Condition, this Condition is not lost the first time it should be (which is typically at the end of the Round or if they victim is attacked).</p>`, 
  {whisper: ChatMessage.getWhisperRecipients("GM"), blind: true })   
}