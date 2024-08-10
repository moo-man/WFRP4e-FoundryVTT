let rating = parseInt(this.effect.name.match(/\d+/)?.[0]) || 1;
let holed = this.actor.flags.holed || {holed: 0};
holed.holed += rating;
this.actor.flags.holed = holed;
