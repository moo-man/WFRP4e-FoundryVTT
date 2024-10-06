if (this.actor.system.status.advantage.value >= 3)
{
    this.actor.modifyAdvantage(-3);
    this.script.notification("Advantage Subtracted")
}
else 
{
    return this.script.notification("Not enough Advantage!", "error")
}

let test = await this.actor.setupTrait(this.item)
await test.roll();