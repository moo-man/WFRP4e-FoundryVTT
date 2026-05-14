let qualities = {
    fast : "Fast",
    hack : "Hack",
    impale : "Impale",
    penetrating : "Penetrating",
    precise : "Precise"
}

let choice = await ItemDialog.create(ItemDialog.objectToArray(qualities, this.item.img), 1, {text: "Select Quality", title: this.effect.name});

if (choice[0])
{
    this.script.message(choice[0].name);
    this.effect.setFlag("wfrp4e", "quality", choice[0].id);
}