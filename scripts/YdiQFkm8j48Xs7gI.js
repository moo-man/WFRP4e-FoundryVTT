if (args.totalWoundLoss > 0 && args.opposedTest.attackerTest.result.critical && args.opposedTest.result.hitloc.value == "head") {
    let brainRot = await fromUuid("Compendium.wfrp4e-lustria.items.Item.IsNQH867Y58pZgq6");
    args.test.targets[0].createEmbeddedDocuments("Item", [brainRot], {fromEffect : this.effect.id});
    this.script.scriptMessage(`${args.test.targets[0].name} has been infected by Brain Rot`);
}