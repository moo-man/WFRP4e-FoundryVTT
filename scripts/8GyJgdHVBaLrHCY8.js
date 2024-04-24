let type = this.item.getFlag("wfrp4e", "breath")
let types = {
    none : "None",
    cold : "Cold",
    corrosion : "Corrosion",
    fire : "Fire",
    electricity : "Electricity",
    poison : "Poison",
    smoke : "Smoke",
    various : "Various"
}
if (!type)
{
    type = (await ItemDialog.create(ItemDialog.objectToArray(types, this.item.img), 1, "Choose Breath"))[0]?.id;
    this.item.updateSource({"flags.wfrp4e.breath" : type})
}

if (!this.item.name.includes("(") && types[type] && type != "none")
{
    this.item.updateSource({name : this.item.name += ` (${types[type]})`, "system.specification.value" : this.item.system.specification.value.replace("(Type)", "").trim()})
}