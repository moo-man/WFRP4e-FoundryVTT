let characteristics = {
    "ws" : -10,
    "bs" : 0,
    "s" : 0,
    "t" : 0,
    "i" : -25,
    "ag" : -20,
    "dex" : 0,
    "int" : -200,
    "wp" : -200,
    "fel" : -200
}
let traits = [ {name:"Construct"}, {name:"Dark Vision"}, {name:"Fear", value: 2}, {name:"Painless"},{name:"Undead"},{name:"Unstable"} ];
let items = [];

let updateObj = this.actor.toObject();
for (let ch in characteristics)
{
    updateObj.system.characteristics[ch].modifier += characteristics[ch];
}

updateObj.system.characteristics.int.initial = 0;
updateObj.system.characteristics.wp.initial = 0;
updateObj.system.characteristics.fel.initial = 0;

for (let trait of traits)
{
    let traitItem = await game.wfrp4e.utility.find(trait.name, "trait")
    if (traitItem)
    {   
        let t = traitItem.toObject();
        t.system.specification.value = trait.value;
        items.push(t);
    }
    else 
    {
        ui.notifications.warn(`Could not find ${trait.name}`, {permanent : true})
    }
}


updateObj.name = updateObj.name += " " + this.effect.name

await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);

