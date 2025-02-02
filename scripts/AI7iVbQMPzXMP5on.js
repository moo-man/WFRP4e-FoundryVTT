const hours = new Roll("2d10");
await hours.toMessage({flavor: this.effect.name + " (hours)"});

const bonus = new Roll("2d10");
await bonus.toMessage({flavor: this.effect.name + " (bonus)"});


await this.effect.update({
  "duration.seconds": hours.total * 3600
});
await this.effect.setFlag("wfrp4e-tribes", "bonus", bonus.total);