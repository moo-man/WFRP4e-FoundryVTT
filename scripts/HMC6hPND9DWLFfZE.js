if (this.item.name.includes("("))
{
	return;
}

let index = game.packs
.filter(i => i.metadata.type == "Item")
.reduce((acc, pack) => acc.concat(pack.index.contents), [])
.filter(i => i.type == "skill" && i.name.includes(game.i18n.localize("NAME.Lore")))
.map(i => {
	i.id = i._id
	return i
})

let choice = await ItemDialog.create(index, 1, "Choose a Lore")
let text;
if (!choice[0])
{
    let custom = await ValueDialog.create({text : "Enter Lore", title : this.effect.name});
    text = custom || "";
}
else 
{
    text = game.wfrp4e.utility.extractParenthesesText(choice[0].name)
}

await this.item.updateSource({name : this.item.name + ` (${text})`, "system.tests.value" : this.item.system.tests.value.replace("chosen Lore", text)})
await this.effect.updateSource({name : this.effect.name + ` (${text})`})