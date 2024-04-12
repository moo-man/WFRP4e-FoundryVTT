if (this.actor.has("Undead") || this.actor.has("Daemonic"))
{
    this.script.scriptNotification(`Cannot enter ${this.effect.name}!`);
}