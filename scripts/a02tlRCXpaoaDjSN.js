let careers = await warhammer.utility.findAllItems("career", "Loading Careers", true);
careers.forEach(c => {
    if (!c.id)
    {
        c.id = c._id;
    }
});
let choice = await ItemDialog.create(careers, 1, {text : "Choose Double Life Career", title : this.effect.name, indexed : true});
if (choice[0])
{
    let career = choice[0];
    let data = career.toObject();
    foundry.utils.setProperty(data, "flags.wfrp4e.doubleLife", true);
    this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})
    this.effect.updateSource({name : this.effect.setSpecifier(data.name)})
}
