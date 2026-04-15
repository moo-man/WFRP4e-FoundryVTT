let fearCounter = this.item.effects.filter(i => i.name == this.effect.name).length;

fearCounter += Number(this.actor.has("Fear")?.system.specification.value) || 0

game.wfrp4e.utility.postFear(fearCounter || 1, this.effect.name)