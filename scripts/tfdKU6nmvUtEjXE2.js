let choice = await Dialog.wait({
    title : "Choice",
    content : 
    `<p>
    Select your choice
    </p>
    `,
    buttons : {
        1 : {
            label : "Shield",
            callback : () => {
                return "shield"
            }
        },
        2 : {
            label : "Two-Handed Weapon",
            callback : () => {
                return "twohanded"
            }
        },
    }
})

let weapons = await warhammer.utility.findAllItems("weapon", "Loading Weapons");
let items
if (choice == "shield") 
{
    items = await game.wfrp4e.apps.ItemDialog.create(weapons.filter(i => i.system.properties.qualities.shield), 1, "Choose a Shield");
}
else if (choice == "twohanded")
{
    items = await game.wfrp4e.apps.ItemDialog.create(weapons.filter(i => i.system.weaponGroup.value == "twohanded"), 1, "Choose a Two-Handed Weapon");
}
items = items.map(i => i.toObject())

items.forEach(i => i.system.equipped.value)

this.actor.createEmbeddedDocuments("Item", items);
