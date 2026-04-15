const qualities = foundry.utils.deepClone(args.item.system.qualities.value);
qualities.push({name:"fine", value: 1});
args.item?.update({"system.qualities.value": qualities});