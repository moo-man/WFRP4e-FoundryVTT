if (this.actor.system.status.advantage.value > 0)
{
    await this.actor.modifyAdvantage(-1);
    this.script.notification("Advantage Subtracted")
}
else 
{
    return this.script.notification("Not enough Advantage!", "error")
}

let test = await this.actor.setupTrait(this.item)
await test.roll();