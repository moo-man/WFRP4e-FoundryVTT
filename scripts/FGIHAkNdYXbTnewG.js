if (!game.settings.get("wfrp4e", "useGroupAdvantage"))
  return;


await this.actor.modifyAdvantage(1);
this.effect.delete();