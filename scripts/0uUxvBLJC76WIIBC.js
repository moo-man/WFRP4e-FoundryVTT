let species = await ValueDialog.create({text : "Enter Target Species (singular)", title : this.effect.name})

this.effect.updateSource({name : this.effect.setSpecifier(species)});