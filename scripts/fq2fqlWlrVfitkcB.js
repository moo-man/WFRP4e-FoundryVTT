let characteristics = {
    "ws" : 0,
    "bs" : -200,
    "s" : 20,
    "t" : 20,
    "i" : 0,
    "ag" : -5,
    "dex" : -5,
    "int" : 0,
    "wp" : 0,
    "fel" : 0
}
let traits = [ {name:"Corruption"}, {name:"Painless"}, {name:"Stupid"}, {name:"Swarm"}, {name:"Bestial", disabled : true}, {name:"Regenerate", disabled : true}, {name:"Size", value: "Large", disabled : true}, {name:"Territorial", disabled: true} ];
let items = [];

let updateObj = this.actor.toObject();
for (let ch in characteristics)
{
    updateObj.system.characteristics[ch].modifier += characteristics[ch];
}

for (let trait of traits)
{
    let traitItem = await game.wfrp4e.utility.find(trait.name, "trait")
    if (traitItem)
    {   
        let t = traitItem.toObject();
        t.system.specification.value = trait.value;
        if (trait.disabled)
        {
            t.system.disabled = true;
        }
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

