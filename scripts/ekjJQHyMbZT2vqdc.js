let uses = this.item.getFlag("wfrp4e", "uses") || 0;
uses++;
this.script.notification(`Used ${uses} times`)
this.item.setFlag("wfrp4e", "uses", uses);
if (uses >= 3)
{
	this.effect.update({"system.transferData.type" : "other"})
	this.script.notification(`Used up`);
}
