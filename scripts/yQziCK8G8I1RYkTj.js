let add;
if (args.opposedTest?.attackerTest?.weapon?.isRanged && args.opposedTest?.result.hitloc?.value === "head") {
    add = await foundry.applications.api.DialogV2.confirm({window : {title : this.effect.name}, content : "Add 1 AP? Bascinet provides 4 AP instead of 3 against missile attacks from the front"})
}

if (add) {

    args.modifiers.ap.metal++;
    args.modifiers.ap.used++;
    args.modifiers.ap.value++;
    args.modifiers.ap.details.push("+1 AP against missile attacks to the front");
}