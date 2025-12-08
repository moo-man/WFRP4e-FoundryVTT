if (args.skill?.name != game.i18n.localize("NAME.Gossip"))
{
	return true;
}
else 
{
	args.data.reversal = {allowed : true, if: "success"}; // Kind of a kludge here, the talent Tests has a specific condition, but the description simply says "any gossip test can be reversed" so check it here instead of submission
}
    