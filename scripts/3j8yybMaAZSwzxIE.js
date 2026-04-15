let weaponData = await this.effect.setFlag("wfrp4e", "weaponData", this.item.system.toObject());

try {


  await this.item.update({
    system: {
      "weaponGroup.value": "throwing",
      "qualities.value": this.item.system.qualities.value.concat([{ name: "accurate" }]),
      "range.value": "SB * 3",
      "consumesAmmo.value" : false
    }
  })

  let test = await this.actor.setupWeapon(this.item, {}, {resolveClose : true});
  await test?.roll();
    this.item.update({ system: this.effect.getFlag("wfrp4e", "weaponData") })
}
catch (e) {
  this.item.update({ system: this.effect.getFlag("wfrp4e", "weaponData") })
}