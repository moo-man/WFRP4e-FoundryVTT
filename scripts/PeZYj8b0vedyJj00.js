// This script needs to be separate because equipTransfer is off on the other effect, and thus won't execute when added to an actor

let mainEffect = this.item.effects.contents[0];
if (mainEffect.name.includes("(Lore)"))
{
    let choice = await ItemDialog.create(ItemDialog.objectToArray({
        beasts : game.wfrp4e.config.magicLores["beasts"],
        death : game.wfrp4e.config.magicLores["death"],
        fire : game.wfrp4e.config.magicLores["fire"],
        heavens : game.wfrp4e.config.magicLores["heavens"],
        metal : game.wfrp4e.config.magicLores["metal"],
        life : game.wfrp4e.config.magicLores["life"],
        light : game.wfrp4e.config.magicLores["light"],
        shadow : game.wfrp4e.config.magicLores["shadow"]
        }, this.item.img), 1, "Choose Lore");
    if (choice.length)
    {
        mainEffect.updateSource({name : mainEffect.name.replace("Lore", choice[0].name)})
        this.item.updateSource({name : this.item.name += ` (${choice[0].name})`})
    }
}

this.effect.delete();