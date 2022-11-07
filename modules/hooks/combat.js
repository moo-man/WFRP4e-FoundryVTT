import CombatHelpers from "../system/combat.js"
import WFRP_Utility from "../system/utility-wfrp4e.js"

export default function() {
  Hooks.on("updateCombat", CombatHelpers.updateCombat)
  Hooks.on("preUpdateCombat", CombatHelpers.preUpdateCombat)
  Hooks.on("deleteCombat", CombatHelpers.endCombat)

  Hooks.on("preCreateCombatant", (combatant, data) => {
    let mask = combatant.hidden;
    if (mask)
    {
      data.img = "systems/wfrp4e/tokens/unknown.png"
      data.name = "???"
    }
  })

  Hooks.on("createCombatant", combatant => {
    if (game.settings.get("wfrp4e", "useGroupAdvantage"))
    {
      let advantage = game.settings.get("wfrp4e", "groupAdvantageValues")
      combatant.actor.update({"system.status.advantage.value" : advantage[combatant.actor.advantageGroup]}, {fromGroupAdvantage : true})
    }
  })

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
