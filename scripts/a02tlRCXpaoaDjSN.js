let careers = await warhammer.utility.findAllItems("career", "", true);
careers.forEach(c => {
    if (!c.id)
    {
        c.id = c._id;
    }
});
let choice = await ItemDialog.create(careers, 1, "Choose Double Life Career");
if (choice[0])
{
    let career = await fromUuid(choice[0].uuid);
    let data = career.toObject();
    foundry.utils.setProperty(data, "flags.wfrp4e.doubleLife", true);
    this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})
    this.effect.updateSource({name : this.effect.name + ` (${data.name})`})
}
