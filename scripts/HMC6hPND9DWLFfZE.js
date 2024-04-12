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
    let custom = await Dialog.wait({
        title : "Enter Lore",
        content : "<input type='text'>",
        buttons : {
            confirm : {
                label : game.i18n.localize("Confirm"),
                callback : (dlg) => {
                    return dlg.find("input")[0].value
                }
            }
        },
        default : "confirm",
        close : () => {
            return ""
        }
    })   
    text = custom || ""
}
else 
{
    text = game.wfrp4e.utility.extractParenthesesText(choice[0].name)
}

await this.item.updateSource({name : this.item.name + ` (${text})`, "system.tests.value" : this.item.system.tests.value.replace("chosen Lore", text)})
await this.effect.updateSource({name : this.effect.name + ` (${text})`})