if (args.item.type != "weapon")
    return

let reach = args.item.reach.value
let reachNum = game.wfrp4e.config.reachNum[reach]
reachNum = Math.min(reachNum + 2, 7)

let key = warhammer.utility.findKey(reachNum, game.wfrp4e.config.reachNum)

args.item.reach.value = key