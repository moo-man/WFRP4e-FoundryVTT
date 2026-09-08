import AttackDialog5e from "./attack-dialog5e";
import CharacteristicDialog5e from "./characteristic-dialog5e";

export default class WeaponDialog5e extends AttackDialog5e
{
    get item()
    {
      return this.data.weapon
    }

    get weapon() 
    {
      return this.item;
    }

    get ammo() 
    {
        return this.data.ammo;
    }

    static PARTS = {
        fields : {
            template : "systems/wfrp4e/templates/dialog/type/5e/default-fields.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        specific : {
          template : "systems/wfrp4e/templates/dialog/type/5e/attack-dialog.hbs",
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
      context.hitloc = true; // Weapons should always have a hit location
      
      let dialogData;
      if (skill)
      {
        dialogData = await super.setupData(skill, actor, context, options)
      }
      else 
      {
        dialogData = await CharacteristicDialog5e.setupData(characteristic, actor, context, options)
      }
      let data = dialogData.data;
      data.weapon = weapon;
      data.item = weapon;
      data.hitloc = true;

      data.scripts = data.scripts.concat(data.weapon?.getScripts("dialog").filter(s => !s.options.defending) || [])
      dialogData.fields.damage = weapon.system.Damage;


      if (weapon.attackType == "ranged") 
      {
        dialogData.fields.range = "normal"; // TODO

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
            foundry.audio.AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav` }, false)
            ui.notifications.error("ErrorNoAmmo", {localize: true})
            return
          }

        }
        else if (weapon.consumesAmmo.value && weapon.quantity.value == 0) 
        {
          // If this executes, it means it uses its own quantity for ammo (e.g. throwing), which it has none of
          AudioPlayer.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav` }, false)
          ui.notifications.error("ErrorNoAmmo", {localize: true})
          return;
        }
        else 
        {
          // If this executes, it means it uses its own quantity for ammo (e.g. throwing)
          data.ammo = weapon;
        }

        if (weapon.loading && !weapon.loaded.value) 
        {
        //   await actor.rollReloadTest(weapon)
          ui.notifications.notify("ErrorNotLoaded", {localize: true})
          return ({ abort: true })
        }
      }

      context.messageTemplate = "systems/wfrp4e/templates/chat/roll/5e/weapon-test.hbs";

      return dialogData;
    }


    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        return context;
    }

    computeFields()
    {
        super.computeFields();
    }

    _computeDefending(attacker) 
    {
        super._computeDefending(attacker);
    }

    _computeTargets(target)
    {

    }
}