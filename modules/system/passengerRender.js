
export default function() {

canvas.tokens.placeables.forEach(token => {
    let passengerIconSize = canvas.dimensions.size / 3.3333;
    let rowSize = 3;
    let colSize = 3
    if(token.actor.data.type == "vehicle")
    {
      let container = new PIXI.Container();
      let imgCount = 0;
      if (token.actor.data.data.passengers.length > 9)
      {
        passengerIconSize = canvas.dimensions.size / 4;
        rowSize = 4;
        colSize = 4;
      }
      for (let img of token.actor.data.data.passengers.map(p => game.actors.get(p.id).data.token.img))
      {
        let sp = PIXI.Sprite.from(img)
        sp.width = passengerIconSize;
        sp.height = passengerIconSize;
        sp.x = passengerIconSize * (imgCount % rowSize)
        sp.y = passengerIconSize * Math.floor(imgCount / colSize)
        container.addChild(sp)
        imgCount++;
        if (imgCount > 9)
          break;
      }
      token.addChild(container)
    }
  })
}