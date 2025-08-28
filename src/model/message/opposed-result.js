import OpposedTest from "../../system/opposed-test";

let fields = foundry.data.fields;
export class OpposedTestMessage extends WarhammerMessageModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.opposedTestData = new fields.ObjectField();
        schema.handlerId = new fields.StringField();
        return schema;
    }

    get opposedTest() 
    {
        return OpposedTest.recreate(this.opposedTestData);
    }

    static async create(opposedTest, options, handler)
    {
      let opposeData = opposedTest.data
      let opposeResult = opposedTest.result

      let html = await foundry.applications.handlebars.renderTemplate("systems/wfrp4e/templates/chat/roll/opposed-result.hbs", opposeResult)
      let chatOptions = {
        user: game.user.id,
        type : "opposed",
        content: html,
        system : {
          opposedTestData: opposeData,
          handlerId: handler.message.id,
        },
        speaker : {alias : "Opposed Result"},
        author : getActiveDocumentOwner(opposedTest.defender)?.id,
        whisper: options.whisper,
        blind: options.blind,
      }
      return await ChatMessage.create(chatOptions);
    }

    async renderMessage()
    {
      let content = await foundry.applications.handlebars.renderTemplate("systems/wfrp4e/templates/chat/roll/opposed-result.hbs", this.opposedTest.result);
      return await this.parent.update({content})
    }

    async onRender(html)
    {
      warhammer.utility.replacePopoutTokens(html);
    }

    static get actions() 
    { 
        return foundry.utils.mergeObject(super.actions, {
            applyDamage : this.onApplyDamage,
            applyHack : this.onApplyHack,
            rollDualWielder : this.onRollDualWielder
        });
    }

    static async onApplyDamage(ev)
    {
      let opposedTest = this.opposedTest;
  
      if (!opposedTest.defenderTest.actor.isOwner)
        return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))
  
      let damageMsg = await opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
      this.updateResultMessage(damageMsg);
    }
  
    static async onApplyHack(ev)
    {
        let opposedTest = this.opposedTest;
        const type = ev.target.innerText;
  
      if (!opposedTest.defenderTest.actor.isOwner)
        return ui.notifications.error("ErrorArmourDamagePermission", {localize : true})
  
      let loc = opposedTest.result.hitloc.value
      let armour = opposedTest.defenderTest.actor.physicalNonDamagedArmourAtLocation(loc);
      if (armour.length)
      {
        let chosen = await ItemDialog.create(armour, 1, {text : "Choose Armour to damage", title : type});
        if (chosen[0])
        {
          chosen[0].system.damageItem(1, [loc])
          ChatMessage.create({content: `<p>1 Damage applied to @UUID[${chosen[0].uuid}]{${chosen[0].name}} (${type})</p>`, speaker : ChatMessage.getSpeaker({actor : opposedTest.attackerTest.actor})})
        }
      }
      else 
      {
        return ui.notifications.error("ErrorNoArmourToDamage", {localize : true})
      }
    }

    static async onRollDualWielder(event)
    {
      let attackerTest = this.opposedTest.attackerTest;
  
      let offHandData = foundry.utils.duplicate(attackerTest.preData)
  
      if (!attackerTest.actor.hasSystemEffect("dualwielder")) 
      {
        await attackerTest.actor.addSystemEffect("dualwielder")
      }
  
      let targets = null;
      if (game.user.targets.size)
      {
        targets = Array.from(game.user.targets)
      }
      else 
      {
        targets = attackerTest.targetTokens.map(i => i.object);
        ui.notifications.info("No Targets - Directing offhand attack at the same target as the primary attack")
      }
  
      let offhandWeapon = attackerTest.actor.itemTags["weapon"].find(w => w.offhand.value);
      if (attackerTest.result.roll % 11 == 0 || attackerTest.result.roll == 100) {
        delete offHandData.roll
      }
      else 
      {
        let offhandRoll = attackerTest.result.roll.toString();
        if (offhandRoll.length == 1)
        {
          offhandRoll = offhandRoll[0] + "0"
        }
        else
        {
          offhandRoll = offhandRoll[1] + offhandRoll[0]
        }
        offHandData.roll = Number(offhandRoll);
      }
  
      attackerTest.actor.setupWeapon(offhandWeapon, { appendTitle: ` (${game.i18n.localize("SHEET.Offhand")})`, dualWieldOffhand: true, offhandReverse: offHandData.roll, targets}).then(test => test.roll());
    }

    // Update starting message with result
    async updateResultMessage(damageConfirmation) {
        this.opposedTestData.opposeResult.confirmation = damageConfirmation;
        await this.parent.update({"system.opposedTestData.opposeResult.confirmation" : damageConfirmation});
        this.renderMessage()
    }
}