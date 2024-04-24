if (args.opposedTest?.attackerTest?.item?.system?.isRanged) 
{
    let choice = await Dialog.wait({
        title: this.effect.name,
        content: `<p>Abort damage with <strong>${this.effect.name}</strong>?`,
        buttons: {
            yes: {
                label: "Yes",
                callback: () => {
                    return true;
                }
            },
            no: {
                label: "No",
                callback: () => {
                    return false;
                }
            }
        }
    })

    if (choice)
    {
        args.abort = `<strong>${this.effect.name}</strong>: Damage cancelled`
    }
}