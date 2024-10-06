let choice = await ItemDialog.create(this.actor.itemTypes.critical, (this.effect.sourceTest.result.overcast.usage.other.current || 1), "Choose the Critical Wounds to heal (cannot reattach body parts)")

this.script.message(`Healed <strong>${choice.map(i => i.name).join(`, `)}</strong>`);
this.actor.deleteEmbeddedDocuments("Item", choice.map(i => i.id))