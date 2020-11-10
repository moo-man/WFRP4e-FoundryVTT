
export default function() {

canvas.tokens.placeables.forEach(token => {
    let passengerIconSize = canvas.dimensions.size / 3.3333;
    if(token.actor.data.type == "vehicle")
    {
      let container = new PIXI.Container();
      let imgCount = 0;
      for (let img of token.actor.data.data.passengers.map(p => game.actors.get(p.id).data.token.img))
      {
        let sp = PIXI.Sprite.from(img)
        sp.width = passengerIconSize;
        sp.height = passengerIconSize;
        sp.x = passengerIconSize * (imgCount % 3)
        sp.y = passengerIconSize * Math.floor(imgCount / 3)
        container.addChild(sp)
        imgCount++;
      }
      token.addChild(container)
    }
  })
}