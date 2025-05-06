if (args.opposedTest?.attackerTest?.item?.system?.isRanged) 
{
    let choice = await foundry.applications.api.DialogV2.confirm({window: {title : this.item.name}, content : `<p>Abort damage with <strong>${this.effect.name}</strong>?</p>`})

    if (choice)
    {
        args.abort = `<strong>${this.effect.name}</strong>: Damage cancelled`
    }
}