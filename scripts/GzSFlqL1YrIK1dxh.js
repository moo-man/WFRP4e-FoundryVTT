let items = await Promise.all(["Compendium.wfrp4e-wom.items.Item.EjGYZ4CgX2jZW7Ot",
"Compendium.wfrp4e-wom.items.Item.O2v9RQiFf0obskP5",
"Compendium.wfrp4e-wom.items.Item.2cv6hhZ57iV6z5Il",
"Compendium.wfrp4e-wom.items.Item.YgDEUO0G0XcqQJqg",
"Compendium.wfrp4e-wom.items.Item.J6K5TPxI8qIGQKKH",
"Compendium.wfrp4e-wom.items.Item.K9FPtiDLwTkC7FuO",
"Compendium.wfrp4e-wom.items.Item.CkMYRYCLrkMnyVm5",
"Compendium.wfrp4e-wom.items.Item.0Xdm4r7l2EwC4fcg"].map(fromUuid));

let choice = await game.wfrp4e.apps.ItemDialog.create(items, 1, "Select Wind")
//this.actor.createEmbeddedDocuments("Item", items);

this.item.update(choice[0]?.toObject(), {diff: false, recursive : false});

//this.actor.items.getName(this.effect.item.name).delete() // For some reason this.effect.item.delete() throws an error

