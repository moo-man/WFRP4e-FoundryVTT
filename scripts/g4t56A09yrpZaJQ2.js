    let amberTalons = foundry.utils.deepClone(game.wfrp4e.config.systemItems.unarmed);
    amberTalons.name = "Amber Talons";
    amberTalons.img = this.effect.img;
    amberTalons.system.damage.value = "SB + WPB"
    amberTalons.system.equipped = true;
    amberTalons.system.qualities.value.push({name : "magical"})
    amberTalons.effects.push({
        label : "Amber Talons",
        transfer: false,
        icon : "modules/wfrp4e-core/icons/spells/amber-talons.png" ,
        flags : {
          wfrp4e : {
              applicationData : {
                  documentType : "Item"
              },
              scriptData : [{
                  trigger : "applyDamage",
                  script : "if (args.totalWoundLoss >= 1)\n{ \n    args.actor.addCondition(\"bleeding\")\n}"
              }]
          }
        }
      })
    this.actor.createEmbeddedDocuments("Item", [amberTalons], {fromEffect: this.effect.id})