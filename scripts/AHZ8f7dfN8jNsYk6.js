let token = this.actor.getActiveTokens()[0];
let target = args.data.targets[0];
let weapon = args.weapon;

if(!target || !token)
{
    return;
}

let distance = canvas.grid.measureDistances([{ ray: new foundry.canvas.geometry.Ray({ x: token.center.x, y: token.center.y }, { x: target.center.x, y: target.center.y }) }], { gridSpaces: true })[0]
let currentBand

for (let band in weapon.range.bands) 
{
  if (distance >= weapon.range.bands[band].range[0] && distance <= weapon.range.bands[band].range[1]) 
  {
    currentBand = band;
    break;
  }
}

return [game.i18n.localize("Long Range"), game.i18n.localize("Extreme")].includes(currentBand)