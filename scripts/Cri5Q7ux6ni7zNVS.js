// Cannot be Surprised in combat.

if (this.actor.hasCondition("surprised"))
{
    this.actor.removeCondition("surprised")
    ui.notifications.notify(`<strong>${this.effect.name}</strong>: Cannot be surprised`);
}