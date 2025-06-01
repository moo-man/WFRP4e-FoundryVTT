if (this.item.name.includes("("))
{
	let trade = this.item.parenthesesText;
	if (trade?.toLowerCase() != "any")
	    return this.item.updateSource({"system.tests.value" : this.item.system.tests.value.replace("any one", trade)})
}

let index = game.packs
.filter(i => i.metadata.type == "Item")
.reduce((acc, pack) => acc.concat(pack.index.contents), [])
.filter(i => i.type == "skill" && i.name.includes(game.i18n.localize("NAME.Trade")))
.map(i => {
	i.id = i._id
	return i
})

let choice = await ItemDialog.create(index, 1, {text : "Choose a Trade Skill, or select none to enter manually.", title : this.effect.name})
let text;
if (!choice[0])
{
    let custom = await ValueDialog.create({text : "Enter Custom Trade Skill", title : "Custom Trade"});  
    text = custom || ""
}
else 
{
    text = game.wfrp4e.utility.extractParenthesesText(choice[0].name)
}

await this.item.updateSource({name : this.item.name.replace("(Any)", "").replace("(any)", "").trim() + ` (${text})`, "system.tests.value" : this.item.system.tests.value.replace("any one", text)});