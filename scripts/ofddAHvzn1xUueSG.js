args.AP.head.value -= tinDifference(args.AP.head.layers)
args.AP.body.value -= tinDifference(args.AP.body.layers)
args.AP.lArm.value -= tinDifference(args.AP.lArm.layers)
args.AP.rArm.value -= tinDifference(args.AP.rArm.layers)
args.AP.rLeg.value -= tinDifference(args.AP.rLeg.layers)
args.AP.lLeg.value -= tinDifference(args.AP.lLeg.layers)

function tinDifference(layers)
{ 
   let metalAP = layers.filter(i => i.metal).reduce((prev, current) => prev + current.value, 0)

   let tinAP = layers.filter(i => i.metal).reduce((prev, current) => prev + Math.max(0, current.value - 2), 0)

   return metalAP - tinAP;
}