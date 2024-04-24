if (this.actor.system.status.advantage.value >= 3)
{
    this.actor.modifyAdvantage(-3);
    this.script.scriptNotification("Advantage Subtracted")
}
else 
{
    return this.script.scriptNotification("Not enough Advantage!", "error")
}

let test = await this.actor.setupTrait(this.item)
await test.roll();