let roll = await new Roll("1d10").roll();
roll.toMessage(this.script.getChatData());
this.effect.updateSource({"duration" : {value: roll.total, units: "rounds"}})