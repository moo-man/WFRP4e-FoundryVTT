for (const weapon of args.actor.itemTags.weapon) {
  weapon.system.qualities.value.push(
    {name: "impale", value: null},
    {name: "penetrating", value: null},
  );
}