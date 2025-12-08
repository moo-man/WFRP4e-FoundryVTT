let species = await ValueDialog.create({text : "Enter Target Species", title : this.effect.name})

this.effect.updateSource({name : this.effect.setSpecifier(species)});