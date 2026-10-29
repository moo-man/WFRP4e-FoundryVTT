let result = await game.wfrp4e.tables.rollTable("gift-of-slaanesh")

if (result.object.documentUuid)
{
    let item = await fromUuid(result.object.documentUuid);
    if (item)
    {  
        let data = item.toObject();
        // Some items need sourceTest for their effects
        foundry.utils.setProperty(data, "flags.wfrp4e.sourceTest", this.effect.sourceTest);
        await this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id});
    }
}

this.script.message(game.wfrp4e.tables.formatChatRoll("gift-of-slaanesh", {lookup : result.roll, hideDSN: true}));