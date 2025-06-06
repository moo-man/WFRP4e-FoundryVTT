import WeaponTest from "../../system/rolls/weapon-test";
import AttackDialog from "./attack-dialog";
import CharacteristicDialog from "./characteristic-dialog";
import SkillDialog from "./skill-dialog";

export default class WeaponDialog extends AttackDialog {


    chatTemplate = "systems/wfrp4e/templates/chat/roll/weapon-card.hbs"

    get item()
    {
      return this.data.weapon
    }

    get weapon() 
    {
      return this.item;
    }

    
    static PARTS = {
      fields : {
          template : "systems/wfrp4e/templates/dialog/type/base-dialog.hbs",
          fields: true
      },
      modifiers : {
          template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
          modifiers: true
      },
      specific : {
          template : "systems/wfrp4e/templates/dialog/type/weapon-dialog.hbs",
      },
      footer : {
          template : "templates/generic/form-footer.hbs"
      }
  };


    static async setupData(weapon, actor, context={}, options={})
    {
      if (!weapon.id) 
      {
        weapon = new CONFIG.Item.documentClass(weapon, { parent: actor })
      }
      let skill = weapon.system.getSkillToUse(actor);
      let characteristic = skill?.system.characteristic.key || (weapon.attackType == "ranged" ? "bs" : "ws");
      
      context.title = context.title || game.i18n.localize("WeaponTest") + " - " + weapon.name;
      context.title += context.appendTitle || "";
      delete context.appendTitle;
      
      let dialogData;
      if (skill)
      {
        dialogData = await super.setupData(skill, actor, context, options)
      }
      else 
      {
        dialogData = await CharacteristicDialog.setupData(characteristic, actor, context, options)
      }
      let data = dialogData.data;
      data.weapon = weapon;
      data.hitloc = true;

      data.scripts = data.scripts.concat(data.weapon?.getScripts("dialog").filter(s => !s.options.defending) || [])


      if (weapon.attackType == "ranged") 
      {
        // If Ranged, default to Ballistic Skill, but check to see if the actor has the specific skill for the weapon
        // skillCharList.push({ char: true, key: "bs", name: game.i18n.localize("CHAR.BS") })
        if (weapon.consumesAmmo.value && weapon.ammunitionGroup.value != "none" && weapon.ammunitionGroup.value) 
        {
          // Check to see if they have ammo if appropriate
          if (context.ammo)
            data.ammo = context.ammo.find(a => a.id == weapon.currentAmmo.value)
          if (!data.ammo)
            data.ammo = actor.items.get(weapon.currentAmmo.value)

          if (!data.ammo || !weapon.currentAmmo.value || data.ammo.quantity.value == 0) {
            AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav` }, false)
            ui.notifications.error(game.i18n.localize("ErrorNoAmmo"))
            return
          }

        }
        else if (weapon.consumesAmmo.value && weapon.quantity.value == 0) 
        {
          // If this executes, it means it uses its own quantity for ammo (e.g. throwing), which it has none of
          AudioPlayer.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav` }, false)
          ui.notifications.error(game.i18n.localize("ErrorNoAmmo"))
          return;
        }
        else 
        {
          // If this executes, it means it uses its own quantity for ammo (e.g. throwing)
          data.ammo = weapon;
        }


        if (weapon.loading && !weapon.loaded.value) 
        {
          await actor.rollReloadTest(weapon)
          ui.notifications.notify(game.i18n.localize("ErrorNotLoaded"))
          return ({ abort: true })
        }
      }

      if (weapon.attackType == "melee") {
        data.chargingOption = true;
      }
      data.dualWieldingOption = !weapon.system.offhand.value && actor.has(game.i18n.localize("NAME.DualWielder"), "talent") && !actor.noOffhand

      return dialogData;
    }

  _getSubmissionData()
  {
      let data = super._getSubmissionData();
      data.item = this.data.weapon.id || this.data.weapon.toObject()
      return data;
  }

  computeFields() 
  {
    super.computeFields();

    if (this.actor.flags.useless.rArm && this.item.system.usesHands.includes("rArm") || this.actor.flags.useless.lArm && this.item.system.usesHands.includes("lArm"))
    {
      this.abort = true;
      ui.notifications.error("ERROR.CannotUseArm", {localize : true})
    }

    if (this.item.offhand.value && !this.item.twohanded.value && !(this.item.weaponGroup.value == "parry" && this.item.properties.qualities.defensive)) 
    {
      this.computeAmbidextrous()
    }
  }

  computeAmbidextrous() {
    this.fields.modifier += -20
    this.tooltips.add("modifier", -20, game.i18n.localize("SHEET.Offhand"))

    const ambiMod = Math.min(20, this.actor.flags.ambi * 10) // TODO could be handled by ambidextrous effect 
    this.fields.modifier += ambiMod;
    if (this.actor.flags.ambi) {
      this.tooltips.add("modifier", ambiMod, game.i18n.localize("NAME.Ambi"));
    }
  }

  _computeTargets(target) 
  {
    super._computeTargets(target);
    this._computeRangeModifiers(target)
  }

  _computeRangeModifiers(target) 
  {
    let weapon = this.weapon;

    let token = this.actor.getActiveTokens()[0];

    if (!game.settings.get("wfrp4e", "rangeAutoCalculation") || !token || !weapon.range?.bands)
      return 0

    let distance = canvas.grid.measurePath([{x: token.center.x, y: token.center.y }, { x: target.center.x, y: target.center.y }]).distance;
    let currentBand

    for (let band in weapon.range.bands) 
    {
      if (distance >= weapon.range.bands[band].range[0] && distance <= weapon.range.bands[band].range[1]) 
      {
        currentBand = band;
        this.context.rangeBand = band;
        break;
      }
    }

    let engagedEffect = this.actor.statuses.has("engaged")
    if (engagedEffect) 
    {
      let engagedMod = Math.min(0, weapon.range.bands[currentBand]?.modifier || 0);
      if (engagedMod)
      {
        this.fields.modifier += engagedMod
        this.tooltips.add("modifier", engagedMod, game.i18n.localize("EFFECT.ShooterEngaged"));
      }
    }
    else 
    {
      let rangeMod = weapon.range.bands[currentBand]?.modifier || 0;
      if (rangeMod) 
      {
        this.fields.modifier += rangeMod
        this.tooltips.add("modifier", rangeMod, `${game.i18n.localize("Range")} - ${currentBand}`);
      }
    }
  }

  // Backwards compatibility for effects
  get type() 
  {
    return "weapon";
  }
}