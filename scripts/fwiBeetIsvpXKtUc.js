scatter = await game.wfrp4e.tables.rollTable("scatter");

if (scatter.roll == 9 || scatter.roll == 10)
{
  this.script.message(`<strong>${scatter.roll}</strong>: Failed to Scatter`);
}
else 
{
  this.script.message(scatter.result);
}