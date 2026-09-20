import WFRPEffectMessageMixin from "./effect-message.js";
import TestWFRP5e from "../../system/rolls/5e/test-wfrp5e.js";
import { MagicUseMessageModel5e } from "./magic5e.js";

export class WFRP5eTestMessageModel extends WFRPEffectMessageMixin(WarhammerTestMessageModel)
{
    get test() 
    {
        return TestWFRP5e.recreate(this.toObject())   
    }

    static get actions() 
    { 
        return foundry.utils.mergeObject(super.actions, {
          reverse: this._onReverse,
          useMagic: this._onUseMagic,
          overcastClick : this.onOvercastClick,
          overcastReset : this.onOvercastReset,
          dispel: this.onDispel,
          executeAction: this.onExecuteAction
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
        path = await game.video.createThumbnail(path, { width: 50, height: 50 });
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
      let test = this.test;
      if (test.actor.isMounted && test.actor.mount)
      {
        div.classList.add("mounted");
        let mount = document.createElement("img");
        mount.src = test.actor.mount.getActiveTokens()[0]?.document?.texture.src
        mount.style.zIndex = 0;
        div.appendChild(mount);
    }
      header.insertBefore(div, header.firstChild);

      warhammer.utility.replacePopoutTokens(html);
    }

    static _onUseMagic(ev, target)
    {
      MagicUseMessageModel5e.create({test: this.test});
    }

    static _onReverse(ev, target)
    {
      this.test.reverse();
    }

          // Respond to overcast button clicks
  static onOvercastClick(event, target) {
    event.preventDefault();
    if (!this.canEdit)
      return ui.notifications.error("CHAT.EditError", {localize: true})

    let test = this.test
    let overcastChoice = target.dataset.overcast;
    // Set overcast and rerender card
    test.overcast(overcastChoice)
  }

  // Button to reset the overcasts
  static onOvercastReset(event) {
    event.preventDefault();
    if (!this.canEdit)
      return ui.notifications.error("CHAT.EditError", {localize: true})

    let test = this.test
    test.resetOvercasts()
  }

  static async onDispel(ev, target)
  {
    let actor = selectedWithFallback()[0];

    if (!actor)
    {
      return ui.notifications.warn("No character assigned or Token selected")
    }


    try {
      let test = await actor.setupDispel(this.test)
      test.roll();

    }
    catch(e)
    {
      ui.notifications.error(e.message);
    }
  }

  static async onExecuteAction(ev, target)
  {
    this.test.executeAction(target.dataset)
  }


}