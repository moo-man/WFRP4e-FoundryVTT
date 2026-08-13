let duration = await new Roll("1d10").roll();
duration.toMessage(this.script.getChatData());
this.effect.updateSource({duration: {value: duration.total, units: "hours"}});