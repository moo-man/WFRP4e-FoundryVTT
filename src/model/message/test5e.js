import { MagicUseMessageModel } from "./magic.js";
import WFRPEffectMessageMixin from "./effect-message.js";
import TestWFRP5e from "../../system/rolls/5e/test-wfrp5e.js";

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
          useMagic: this._onUseMagic
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
      MagicUseMessageModel.create({test: this.test});
    }

    static _onReverse(ev, target)
    {
      this.test.reverse();
    }

}