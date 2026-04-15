const qualities = foundry.utils.deepClone(args.item.system.qualities.value);
qualities.push({name:"lightweight"});
args.item?.update({"system.qualities.value": qualities});