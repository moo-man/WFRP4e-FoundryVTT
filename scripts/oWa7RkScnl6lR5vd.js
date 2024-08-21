if (args.test.characteristicKey == "wp") 
{
    if (args.test.failed)
    {
        let item = await fromUuid("Compendium.wfrp4e-core.items.AGcJl5rHjkyIQBPP")
        let data = item.toObject();
        this.actor.createEmbeddedDocuments("Item", [data])
        
        this.script.message(`Willpower Test failed, <b>${this.actor.prototypeToken.name}</b> gains @UUID[Compendium.wfrp4e-core.items.AGcJl5rHjkyIQBPP] for [[1d10]] hours`)
    }
}