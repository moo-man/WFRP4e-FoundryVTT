// Remove the miscast if doubles rolled and succeeded
// Decrement the major miscast to minor miscast
if(args.test.succeeded && args.test.result.tables.miscast && args.test.result.roll % 11 == 0)
{
    if (args.test.result.tables.miscast.key == "minormis")
    {
        delete args.test.result.tables.miscast;
    }
    else if (args.test.result.tables.miscast.key == "majormis")
    {
        args.test.result.tables.miscast.key = "minormis"
        args.test.result.tables.miscast.label = game.i18n.localize("ROLL.MinorMis");
    }
}