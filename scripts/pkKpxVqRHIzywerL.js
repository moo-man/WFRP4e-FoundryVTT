const ablaze = this.actor.hasCondition("ablaze");

if (ablaze) {
    ablaze.delete();
    this.script.scriptNotification("Resisted Ablaze");
}