let key = this.item.system.location.key

let lostFingers = this.actor.flags.useless[key] || 0;

lostFingers += 1

this.actor.flags.useless[key] = lostFingers;

if (lostFingers >= 4)
{
	this.actor.flags.useless[key[0] + "Arm"] = true;
}