if ((args.test.result.roll % 11 == 0 || args.test.result.roll == 100) && args.test.failed)
{
  delete args.test.result.misfire;
  args.test.result.tables.misfire = {
        label : "Misfire",
        class : "fumble-roll",
        modifier : 0,
        key : "artillery-misfires"
      }
}