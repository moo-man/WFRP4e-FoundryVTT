

if (!args.opposedTest.attackerTest.item?.system?.isMelee) 
{
    let choice = await foundry.applications.api.DialogV2.confirm({ window: { title: this.effect.name }, content: `<p><strong>${this.effect.name}</strong>: Is this a ranged or magical attack that orignates outside the Dome?</p>` })

    if (choice) 
    {
        args.ward = 6;
    }
}
