if (this.actor.status.advantage.value && !this.actor.sameSideAs(this.effect.sourceActor))
{
    this.actor.modifyAdvantage(-1);
    this.script.notification(`${this.actor.name} loses 1 Advantage`);
}