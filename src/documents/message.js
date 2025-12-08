import MarketWFRP4e from "../apps/market-wfrp4e";
import GenericActions from "../system/actions";
import TradeGenerator from "../system/trade/trade-generator";
import TradeManager from "../system/trade/trade-manager";

export default class ChatMessageWFRP extends WarhammerChatMessage 
{

    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user);
        this.updateSource({"content" : this.constructor.addEffectButtons(data.content)})
    }

    async _onCreate(document, options, user)
    {
        await super._onCreate(document, options, user);
        let test = this.system.test;
        if (test)
        {
          test.postTestGM(document)
        }
    }

    static get actions() 
    { 
        return foundry.utils.mergeObject({
          settlementSize : this._onClickSettlementSize,
          crewTest : this._onCrewTest,
          postProperty : this._onPostProperty,
          placeTemplate : this._onPlaceTemplate,
          conditionScript : this._onConditionScript,
          applyCondition : this._onApplyCondition,
          manageTrade : this._manageTrade,
          buyCargo : this._buyCargo,
          travel : this._onTravelClick
        }, super.actions);
    }

    /** @inheritDoc */
    async renderHTML(options)
    {
        let html = await super.renderHTML(options);
        if (this.getFlag("wfrp4e", "socketResult"))
        {
          html.classList.add("socket-result");
          html.style.display = "none";
        }
        GenericActions.addEventListeners(html, this);
        return html;
    }


    static _manageTrade(ev)
    {
      TradeManager.manageTrade(foundry.utils.deepClone(this.getFlag("wfrp4e", "cargoData")));
    }

    static _buyCargo(ev, target)
    {
      TradeGenerator.buyCargo(this.getFlag("wfrp4e", "cargoData"));
    }

    static _onApplyCondition(ev, target)
    {
      let actors = targetsWithFallback();

      if (canvas.scene) 
      { 
        game.canvas.tokens.setTargets([])
      }
      
      if (actors.length == 0)
      {
        actors.push(game.user.character);
        ui.notifications.notify(`${game.i18n.format("EFFECT.Applied", {name: game.wfrp4e.config.conditions[target.dataset.cond]})} ${game.user.character.name}`)
      }
  
      actors.forEach(a => {
        a.addCondition(target.dataset.cond)
      })
    } 

    static async _onConditionScript(ev, target)
    {
      let condkey = target.dataset.condId
      let combatantId = target.dataset.combatantId
      let combatant = game.combat.combatants.get(combatantId)

      let conditionResult;
  
      let effect = combatant.actor.hasCondition(condkey);
  
      if (combatant.actor.isOwner && effect)
        conditionResult = await effect.scripts[0].execute({suppressMessage : true})
      else
        return ui.notifications.error(game.i18n.localize("CONDITION.ApplyError"))
  
      if (game.user.isGM)
        this.update(conditionResult)
      else
        await SocketHandlers.call("updateMessage", { id: this.id, updateData: conditionResult }, "GM");
    }

    static _onPostProperty(ev, target)
    {
      game.wfrp4e.utility.postProperty(target.text);
    }

    static _onPlaceTemplate(ev, target)
    {
      let actorId = target.dataset.actorId;
      let itemId = target.dataset.itemId;
      let type = target.dataset.type;

      AreaTemplate.fromString(target.text, actorId, itemId, this.id, type=="diameter").drawPreview(ev);
    }

    static _onClickSettlementSize(ev, target)
    {
      let options = {
        name: target.dataset.name,
        settlement: target.dataset.settlement.toLowerCase(),
        rarity: target.dataset.rarity.toLowerCase(),
        modifier: 0
      };
      MarketWFRP4e.testForAvailability(options);
    }

    static async _onCrewTest(ev, target)
    {
      let crewTestUuid = this.getFlag("wfrp4e", "crewTestData")?.uuid;
      let crewTest = await fromUuid(crewTestUuid);
      let roleUuid = target.dataset.uuid;
      let vital = target.dataset.vital == "true";
      let role = await fromUuid(roleUuid);
      if (role)
      {
        let chosenActor = await role.actor.system.passengers.choose(role.name);
        if (chosenActor)
        {
          role.system.roll(chosenActor, {appendTitle : ` - ${vital ? game.i18n.localize("CHAT.CrewTestVital") : game.i18n.localize("CHAT.CrewTest")}`, skipTargets : true, crewTest, crewTestMessage : this.id, roleVital : vital})
        }
      }
    }
    
  // If content includes "@Condition[...]" add a button to apply that effect
  // Optionally provide a set of conditions
  static addEffectButtons(content, conditions = [])
  {
    content = content?.toString()
    // Don't add buttons if already added, or from posted items
    if (content?.includes("apply-conditions") || content?.includes("post-item"))
    {
      return content;
    }

    let regex = /@Condition\[(.+?)\]/gm

    let matches = Array.from(content.matchAll(regex));

    conditions = conditions.concat(matches.map(m => m[1].toLowerCase())).filter(i => game.wfrp4e.config.conditions[i])

    // Dedup
    conditions = conditions.filter((c, i) => conditions.indexOf(c) == i)

    if (conditions.length)
    {
      let html = `<div class="apply-conditions">`
      conditions.forEach(c => 
          html += `<a class="chat-button" data-action="applyCondition" data-cond="${c}">${game.i18n.format("CHAT.ApplyCondition", {condition: game.wfrp4e.config.conditions[c]})}</a>`
      )

      html += `</div>`
      content += html;
    }
    return content
  }
}