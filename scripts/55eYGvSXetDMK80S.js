const diseaseIds = this.actor.items.filter(i => i.type == "disease").map(i => i.id)
this.actor.deleteEmbeddedDocuments("Item", diseaseIds)