let properties = {
    ugly : "Ugly",
    shoddy : "Shoddy",
    unreliable : "Unreliable"
};

let choice = await ItemDialog.create(ItemDialog.objectToArray(properties), 1, {title: this.effect.name, text: "Select Property"});

if (choice[0])
{
    this.effect.updateSource({"flags.wfrp4e.property" : choice[0].id, name : this.effect.setSpecifier(choice[0].name)});
}