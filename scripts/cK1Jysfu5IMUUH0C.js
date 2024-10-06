if (!args.ward)
{
	args.ward = (this.effect.getFlag("wfrp4e", "ward") || 0);
	if (args.wardRoll >= args.ward && args.ward > 3)
    {
        let newWard = Math.max(3, args.ward - 1)
        this.script.message("<strong>Ward</strong> improved to " + newWard)
        this.effect.setFlag("wfrp4e", "ward", newWard)
    }

}