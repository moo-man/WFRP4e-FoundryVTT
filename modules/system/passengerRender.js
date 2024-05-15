
export default function(token) {
    if (!token.document?.flags.wfrp4e?.hidePassengers && token.actor && token.actor.type == "vehicle")
    {
      if (token.passengers)
      {
        token.passengers.destroy();
      }
      let passengerIconSize = canvas.dimensions.size / 3.3333;
      let rowSize = 3;
      let colSize = 3
      let container = new PIXI.Container();
      let imgCount = 0;
      if (token.actor.system.passengers.list.length > 9)
      {
        passengerIconSize = canvas.dimensions.size / 4;
        rowSize = 4;
        colSize = 4;
      }
      passengerIconSize *= token.document.width
      for (let img of token.actor.system.passengers.list.map(p => p.img))
      {
        if (!img)
        continue
        let sp = PIXI.Sprite.from(img)
        sp.width = passengerIconSize;
        sp.height = passengerIconSize;
        sp.x = passengerIconSize * (imgCount % rowSize)
        sp.y = passengerIconSize * Math.floor(imgCount / colSize)
        container.addChild(sp)
        imgCount++;
        if (imgCount > 9)
        break;
        token.passengers = token.addChild(container)
      }
    }
}