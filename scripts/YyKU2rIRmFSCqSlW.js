let newEffect = this.effect.sourceItem.effects?.contents[1]

if (newEffect)
{
    this.actor.createEmbeddedDocuments("ActiveEffect", [newEffect.convertToApplied()]);
}