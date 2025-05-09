import TestWFRP from "../../system/rolls/test-wfrp4e";
import WFRP_Utility from "../../system/utility-wfrp4e";

export class WFRPTestMessageModel extends WarhammerTestMessageModel 
{
    get test() 
    {
        return TestWFRP.recreate(this.testData)   
    }

    static get actions() 
    { 
        return foundry.utils.mergeObject(super.actions, {
            overcastClick : this.onOvercastClick,
            overcastReset : this.onOvercastReset,
            moveVortex : this.onMoveVortex
        });
    }

    get canEdit()
    {
      let msg = this.parent
      return msg.isOwner || msg.isAuthor;
    }

    async getHeaderToken()
    {
      let token = this.test.actor.getActiveTokens()[0]?.document || this.test.actor.prototypeToken;

      let path = token.hidden ? "systems/wfrp4e/tokens/unknown.png" : token.texture.src;

      if (foundry.helpers.media.VideoHelper.hasVideoExtension(path))
      {
        path = await game.video.createThumbnail(path, { width: 50, height: 50 }).then(img => chatOptions.flags.img = img)
      }

      return path;
      
    }

    async onRender(html)
    {
      let header = html.querySelector(".message-header");

      let div = document.createElement("div")
      div.classList.add("message-token");
      let image = document.createElement("img");
      image.src = await this.getHeaderToken();
      image.style.zIndex = 1;
      div.appendChild(image);
      if (this.test.actor.isMounted && this.test.actor.mount)
      {
        div.classList.add("mounted");
        let mount = document.createElement("img");
        mount.src = this.test.actor.mount.getActiveTokens()[0]?.document?.texture.src
        mount.style.zIndex = 0;
        div.appendChild(mount);
    }
      header.insertBefore(div, header.firstChild);

      warhammer.utility.replacePopoutTokens(html);
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
  
      // Respond to overcast button clicks
  static onOvercastClick(event, target) {
    event.preventDefault();
    let msg = this.parent
    if (!this.canEdit)
      return ui.notifications.error("CHAT.EditError")

    let test = msg.system.test
    let overcastChoice = target.dataset.overcast;
    // Set overcast and rerender card
    test._overcast(overcastChoice)
    
    //@HOUSE
    if (game.settings.get("wfrp4e", "homebrew").mooOvercasting)
    {
      game.wfrp4e.utility.logHomebrew("mooOvercasting")
    }
    //@/HOUSE

    
  }

  // Button to reset the overcasts
  static onOvercastReset(event) {
    event.preventDefault();
    let msg = this.parent
    if (!this.canEdit)
      return ui.notifications.error("CHAT.EditError")

    let test = this.test
    // Reset overcast and rerender card
    test._overcastReset()
        
    //@HOUSE
    if (game.settings.get("wfrp4e", "homebrew").mooOvercasting)
    {
      game.wfrp4e.utility.logHomebrew("mooOvercasting")
    }
    //@/HOUSE
  }

  static onMoveVortex(event)
  {
    let msg = this.parent;
    if (!this.canEdit)
      return ui.notifications.error("CHAT.EditError")
    let test = this.test
    test.moveVortex();
  }

}