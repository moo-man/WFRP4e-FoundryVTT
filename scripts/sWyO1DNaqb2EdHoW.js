if (!this.actor.items.getName(game.i18n.localize("NAME.Frenzy"))) // Either frenzy trait or psychology
{
  // Add Frenzy psychology
  let item = await fromUuid("Compendium.wfrp4e-core.items.DrNUTPeodEgpWTnT")
  let data = item.toObject();
  data.effects[0].disabled = false;
  this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})
}

this.script.message(`<p><strong>By imbibing this potion, ${this.actor.prototypeToken.name}</strong> has becomes subject to Frenzy. This Frenzy lasts [[1d10]] Rounds, and may not be ended sooner.</p>`, 
  {whisper: ChatMessage.getWhisperRecipients("GM"), blind: true })   