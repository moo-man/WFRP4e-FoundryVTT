let roll = await (new Roll(`max(0, 1d10 - ${this.actor.characteristics.wp.bonus})`).roll())
let fatigued = roll.total
roll.toMessage(this.script.getChatData());
if (fatigued > this.actor.characteristics.wp.bonus)
{
    this.actor.addCondition("unconscious")
    this.script.notification(`Fell Unconscious`)
}
else 
{
    fatigued = Math.max(0, fatigued)
    if (fatigued)
        this.actor.addCondition("fatigued", fatigued)
    this.script.notification(`Gained ${fatigued} conditions`)
}