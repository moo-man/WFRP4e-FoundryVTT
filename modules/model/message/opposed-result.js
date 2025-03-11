import OpposedHandler from "../../system/opposed-handler";
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

      let html = await renderTemplate("systems/wfrp4e/templates/chat/roll/opposed-result.hbs", opposeResult)
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
      let content = await renderTemplate("systems/wfrp4e/templates/chat/roll/opposed-result.hbs", this.opposedTest.result);
      return await this.parent.update({content})
    }


    static get actions() 
    { 
        return foundry.utils.mergeObject(super.actions, {
            applyDamage : this.onApplyDamage,
            applyHack : this.onApplyHack
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
  
      if (!opposedTest.defenderTest.actor.isOwner)
        return ui.notifications.error("ErrorHackPermission", {localize : true})
  
      let loc = opposedTest.result.hitloc.value
      let armour = opposedTest.defenderTest.actor.itemTypes.armour.filter(i => i.system.isEquipped && i.system.protects[loc] && i.system.currentAP[loc] > 0)
      if (armour.length)
      {
        let chosen = await ItemDialog.create(armour, 1, "Choose Armour to damage");
        if (chosen[0])
        {
          chosen[0].system.damageItem(1, [loc])
          ChatMessage.create({content: `<p>1 Damage applied to @UUID[${chosen[0].uuid}]{${chosen[0].name}} (Hack)</p>`, speaker : ChatMessage.getSpeaker({actor : opposedTest.attackerTest.actor})})
        }
      }
      else 
      {
        return ui.notifications.error("ErrorNoArmourToDamage", {localize : true})
      }
    }

    // Update starting message with result
    async updateResultMessage(damageConfirmation) {
        this.opposedTestData.opposeResult.confirmation = damageConfirmation;
        await this.parent.update({"system.opposedTestData.opposeResult.confirmation" : damageConfirmation});
        this.renderMessage()
    }
}