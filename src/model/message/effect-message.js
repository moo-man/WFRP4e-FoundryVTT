import TestWFRP from "../../system/rolls/test-wfrp4e.js";
import WFRP_Utility from "../../system/utility-wfrp4e.js";
import ItemWFRP4e from "../../documents/item.js";
import { MagicUseMessageModel } from "./magic.js";

const WFRPEffectMessageMixin = (cls) => class extends cls 
{
    static get actions() 
    { 
        return foundry.utils.mergeObject(super.actions, {
            moveVortex : this.onMoveVortex,
        });
    }

    get canEdit()
    {
      let msg = this.parent
      return msg.isOwner || msg.isAuthor;
    }

  static async onPlaceAreaEffect(event, target) {
    if (!this.canEdit)
      return ui.notifications.error("CHAT.EditError")
    
    let effectUuid = target.dataset.uuid;
    let test = this.test
    let radius;
    if (test?.result.overcast?.usage.target)
    {
      radius = test.result.overcast.usage.target.current;

      if (test.spell)
      {
        radius /= 2; // Spells define their diameter, not radius
      }
    }

    let effect = await fromUuid(effectUuid)
    let effectData = effect.convertToApplied(test);
    if (!(await effect.runPreApplyScript({effectData})))
    {
        return;
    }
    let template = await AreaTemplate.fromEffect(effectUuid, this.parent.id, radius, foundry.utils.diffObject(effectData, effect.convertToApplied(test)));
    await template.drawPreview(event);
  }

  static onMoveVortex(event)
  {
    if (!this.canEdit)
      return ui.notifications.error("CHAT.EditError")
    let test = this.test
    test.moveVortex();
  }
}

export default WFRPEffectMessageMixin