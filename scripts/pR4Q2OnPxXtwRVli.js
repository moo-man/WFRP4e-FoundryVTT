let criticals = this.actor.itemTypes.critical;

if (criticals.length)
{
    this.script.scriptNotification("Cannot suffer Critical Wounds");
    this.actor.deleteEmbeddedDocuments("Item", criticals.map(i => i.id))
}

if (getProperty(args.data, "system.status.wounds.value") == 0)
{
    this.script.scriptNotification(`Dormant for ${Math.ceil(CONFIG.Dice.randomUniform() * 10)} Rounds`)
}