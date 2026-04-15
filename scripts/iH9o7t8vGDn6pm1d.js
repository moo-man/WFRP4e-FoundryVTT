if (args.test.result.misfire && args.test.result.roll % 2 == 1 && args.test.result.roll % 11 == 0) {
  delete args.test.result.misfire
}
else if (args.test.result.misfire)
{
    delete args.test.result.misfire;
  args.test.result.tables.misfire = {
        label : "Misfire",
        class : "fumble-roll",
        modifier : 0,
        key : "artillery-misfires"
      }
}