import CombatHelpersWFRP from "../system/combat.js"
import WFRP_Utility from "../system/utility-wfrp4e.js"

export default function() {


  Hooks.on("preCreateCombatant", (combatant, data) => {
    combatant.updateSource({img : warhammer.utility.replacePopoutPath(combatant.token.texture.src)})
  })

  Hooks.on("createCombatant", combatant => {
    if (game.settings.get("wfrp4e", "useGroupAdvantage") && game.user.isGM) {
      let advantage = game.settings.get("wfrp4e", "groupAdvantageValues")
      combatant.actor.update({"system.status.advantage.value" : advantage[combatant.actor.advantageGroup]}, {fromGroupAdvantage : true})
    }
    let mask = combatant.token.hidden
    if (mask && game.user.isGM) {
      let data = {};
      data.img = "systems/wfrp4e/tokens/unknown.png"
      data.name = "???"
      combatant.update(data);
    }
  });

  Hooks.on("updateToken", function(scene, tokenData, diffData, options, userId) {
    if (game.combat?.active && game.user.isGM) {
      let combatant = game.combat.turns.find(x => x.tokenId == tokenData._id);
      let token = game.canvas.tokens.getDocuments().find(x => x._id == tokenData._id);
      if(!token || !combatant) return;
      let mask = token.hidden;
      let data = null;
      if (combatant && mask && !combatant.hidden && combatant.name != "???") {
        data = {};
        data.img = "systems/wfrp4e/tokens/unknown.png"
        data.name = "???"
      }
      else if (combatant && !mask && !combatant.hidden && combatant.name == "???") {
        data = {};
        data.img = token.texture.src;
        data.name = token.name;
      }
      if (data) {
        combatant.update(data);
      }
    }
  });


  /* Custom Combat Carousel */
  Hooks.on('renderCombatCarousel', () => {
    addClassByQuerySelector("wfrp4e", "#combat-carousel")
    let carouselSize = game.settings.get('combat-carousel', 'carouselSize')
    if (carouselSize !== "") {
      addClassByQuerySelector(carouselSize, "#combat-carousel")
    }
  });
  
  function addClassByQuerySelector(className, selector) {
    let navigation = document.querySelector(selector);
    navigation.classList.add(className)
  }

  Hooks.on("renderCombatTracker", (app, html, options) => {
    warhammer.utility.replacePopoutTokens(app.element); // Combat tracker shows tokens, replace popout versions with normal

    if (game.settings.get("wfrp4e", "useGroupAdvantage"))
    {
      let advantage = game.settings.get("wfrp4e", "groupAdvantageValues")
      let element = 
      $(`
      <div class="advantage-groups">
      <div class="advantage-group">
      <label>${game.i18n.localize("Players")}</label>
      <input data-group="players" type="number" value=${advantage.players}>
      </div>

      <div class="advantage-group">
      <label>${game.i18n.localize("Enemies")}</label>
      <input data-group="enemies" ${game.user.isGM ? "" : "disabled"} type="number" value=${advantage.enemies}>
      </div>
      </div>
      `)


      element.find("input").on("focus", ev => {
        ev.target.select();
      })

      element.find("input").on("change", async ev => {
        let group = ev.currentTarget.dataset.group
        let value = Number(ev.currentTarget.value || 0)
        WFRP_Utility.updateGroupAdvantage({[`${group}`] : value})
      })

      element.insertAfter(html.find(".combat-tracker-header"))
    }
  })
}
