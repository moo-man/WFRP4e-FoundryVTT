if (this.actor.has("Undead") || this.actor.has("Daemonic"))
{
    this.script.notification(`Cannot enter ${this.effect.name}!`);
}