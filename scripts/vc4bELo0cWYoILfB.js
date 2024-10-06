let choice = await ItemDialog.create(this.actor.itemTypes.disease, 1, "Choose a disease to heal (must be naturally occuring)")

this.script.message(`Cured <strong>${choice[0]?.name}</strong>`);
choice[0].delete()