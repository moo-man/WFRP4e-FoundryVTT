import WeaponTest from "../../system/rolls/weapon-test";
import AttackDialog from "./attack-dialog";
import SkillDialog from "./skill-dialog";

export default class WeaponDialog extends AttackDialog {


    subTemplate = "systems/wfrp4e/templates/dialog/weapon-dialog.hbs";
    chatTemplate = "systems/wfrp4e/templates/chat/roll/weapon-card.hbs"
    testClass = WeaponTest;


    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["weapon-roll-dialog"]);
        return options;
    }

    get item()
    {
      return this.data.weapon
    }

    get weapon() 
    {
      return this.item;
    }

    static async setup(fields={}, data={}, options={})
    {
        if (!data.weapon.id)
        {
            data.weapon = new CONFIG.Item.documentClass(data.weapon, { parent: data.actor })
        }
        let weapon = data.weapon;
        data.skill = weapon.system.getSkillToUse(data.actor);
        data.characteristic = data.skill?.system.characteristic.key || (weapon.attackType == "ranged" ? "bs" : "ws");

        options.title = options.title || game.i18n.localize("WeaponTest") + " - " + weapon.name;
        options.title += options.appendTitle || "";

      if (weapon.attackType == "ranged") {
        // If Ranged, default to Ballistic Skill, but check to see if the actor has the specific skill for the weapon
        // skillCharList.push({ char: true, key: "bs", name: game.i18n.localize("CHAR.BS") })
        if (weapon.consumesAmmo.value && weapon.ammunitionGroup.value != "none" && weapon.ammunitionGroup.value) {
          // Check to see if they have ammo if appropriate
          if (options.ammo)
            data.ammo = options.ammo.find(a => a.id == weapon.currentAmmo.value)
          if (!data.ammo)
            data.ammo = data.actor.items.get(weapon.currentAmmo.value)
  
          if (!data.ammo || !weapon.currentAmmo.value || data.ammo.quantity.value == 0) {
            AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav` }, false)
            ui.notifications.error(game.i18n.localize("ErrorNoAmmo"))
            return
          }
  
        }
        else if (weapon.consumesAmmo.value && weapon.quantity.value == 0) {
          // If this executes, it means it uses its own quantity for ammo (e.g. throwing), which it has none of
          AudioPlayer.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav` }, false)
          ui.notifications.error(game.i18n.localize("ErrorNoAmmo"))
          return;
        }
        else {
          // If this executes, it means it uses its own quantity for ammo (e.g. throwing)
          data.ammo = weapon;
        }
  
  
        if (weapon.loading && !weapon.loaded.value) {
          await data.actor.rollReloadTest(weapon)
          ui.notifications.notify(game.i18n.localize("ErrorNotLoaded"))
          return ({ abort: true })
        }
      }

      if (weapon.attackType == "melee")
      {
        data.chargingOption = true;
      }
      
      data.hitLocationTable = game.wfrp4e.tables.getHitLocTable(data.targets[0]?.actor?.details?.hitLocationTable?.value || "hitloc");
      data.dualWieldingOption = !weapon.system.offhand.value && data.actor.has(game.i18n.localize("NAME.DualWielder"), "talent") && !data.actor.noOffhand

      data.scripts = data.scripts.concat(data.weapon?.getScripts("dialog"), data.skill?.getScripts("dialog") || []);
      data.scripts = data.scripts.concat(data.actor.system.vehicle?.getScripts("dialog") || [])


      return new Promise(resolve => {
        let dlg = new this(data, fields, options, resolve)
        if (options.bypass)
        {
            dlg.bypass()
        }
        else 
        {
            dlg.render(true);
        }
    })
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
        this.options.rangeBand = band;
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