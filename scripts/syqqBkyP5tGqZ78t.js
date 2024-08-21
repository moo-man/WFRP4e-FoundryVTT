this.actor.has("Immunity to Psychology")?.delete();

let roll = await new Roll("1d10").roll();

roll.toMessage(this.script.getChatData());

this.script.notification(`Removed Immunity to Psychology, Adding ${roll.total} Broken Conditions`)
this.actor.addCondition("broken", roll.total, {"flags.wfrp4e.blasted-mind" : true})