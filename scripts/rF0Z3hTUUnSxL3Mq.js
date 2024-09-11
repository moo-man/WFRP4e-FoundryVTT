let armour = (await fromUuid("Compendium.wfrp4e-core.items.VUJUZVN3VYhOaPjj")).toObject()
let bite = (await fromUuid("Compendium.wfrp4e-core.items.pLW9SVX0TVTYPiPv")).toObject()
let fear = (await fromUuid("Compendium.wfrp4e-core.items.pTorrE0l3VybAbtn")).toObject()
let nightVision = (await fromUuid("Compendium.wfrp4e-core.items.FmHDbCOy3pH8yKhm")).toObject()
let tracker = (await fromUuid("Compendium.wfrp4e-core.items.ClOlztW6hH8rslbp")).toObject()
let weapon = (await fromUuid("Compendium.wfrp4e-core.items.AtpAudHA4ybXVlWM")).toObject()

armour.name = "Armour (Hide)"
armour.system.specification.value = 2
bite.system.specification.value = 3
fear.system.specification.value = 2
weapon.system.specification.value = 4
let items = [armour, bite, fear, nightVision, tracker, weapon]


let belligerent = (await fromUuid("Compendium.wfrp4e-core.items.GbDyBCu8ZjDp6dkj")).toObject()//{Belligerent}
let bestial = (await fromUuid("Compendium.wfrp4e-core.items.AGcJl5rHjkyIQBPP")).toObject()//{Bestial}
let big = (await fromUuid("Compendium.wfrp4e-core.items.a8MC97PLzl10WocT")).toObject()//{Big}
let blessed = (await fromUuid("Compendium.wfrp4e-core.items.5muSFXd6oc760uVj")).toObject()//{Blessed (Ulric)}
let champion = (await fromUuid("Compendium.wfrp4e-core.items.4mF5Sp3t09kZhBYc")).toObject()//{Champion}
let die = (await fromUuid("Compendium.wfrp4e-core.items.UsJ2uIOOtHA7JqD5")).toObject()//{Die Hard}
let fast = (await fromUuid("Compendium.wfrp4e-core.items.9MjH4xyVrd3Inzak")).toObject()//{Fast}
let frenzy = (await fromUuid("Compendium.wfrp4e-core.items.yRhhOlt18COq4e1q")).toObject()//{Frenzy}
let immunity = (await fromUuid("Compendium.wfrp4e-core.items.IAWyzDfC286a9MPz")).toObject()//{Immunity to Psychology}
let regenerate = (await fromUuid("Compendium.wfrp4e-core.items.SfUUdOGjdYpr3KSR")).toObject()//{Regenerate}
let size = (await fromUuid("Compendium.wfrp4e-core.items.8slW8CJ2oVTxeQ6q")).toObject()//{Size (Large)}

blessed.system.specification.value = "Ulric"
size.system.specification.value = "Large"

let optional = [belligerent, bestial, big, blessed, champion, die, fast, frenzy, immunity, regenerate, size];

let chosen = await ItemDialog.create(optional, "unlimited", "Choose Optional Traits");

items = items.concat(chosen || [])
this.script.notification(`Adding ${items.map(i => i.name).join(", ")}`);
this.actor.createEmbeddedDocuments("Item", items, {fromEffect : this.effect.id})
