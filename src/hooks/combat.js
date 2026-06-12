import CombatHelpersWFRP from "../system/combat.js"
import WFRP_Utility from "../system/utility-wfrp4e.js"
import EngagementTracker from "../system/engagement.js"

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

  // Auto-engage both combatants when a melee weapon or trait test has targets
  function onMeleeAttackRolled(test) {
    if (!game.user.isUniqueGM) return;
    if (!game.combat?.active) return;
    if (!game.settings.get("wfrp4e", "autoEngaged")) return;
    if (test.item.attackType != "melee") return;

    let attacker = test.actor;
    let targets = test.targetTokens.map(t => t?.actor).filter(Boolean);
    for (let target of targets) {
      EngagementTracker.engage(attacker, target);
    }
  }

  Hooks.on("wfrp4e:rollWeaponTest", onMeleeAttackRolled);
  Hooks.on("wfrp4e:rollTraitTest", onMeleeAttackRolled);

  // Disengage when a character becomes dead or unconscious
  Hooks.on("createActiveEffect", (effect, options, userId) => {
    if (!game.user.isUniqueGM) return;
    if (EngagementTracker._clearing) return;
    if (!game.combat?.active) return;
    if (!game.settings.get("wfrp4e", "autoEngaged")) return;

    let actor = effect.parent;
    if (!(actor instanceof Actor)) return;
    if (effect.statuses.has("dead") || effect.statuses.has("unconscious")) {
      EngagementTracker.disengage(actor);
    }
  });

  // Detect manual removal of the Engaged condition and run cascade check
  Hooks.on("deleteActiveEffect", (effect, options, userId) => {
    if (!game.user.isUniqueGM) return;
    if (EngagementTracker._clearing) return;
    if (!game.combat?.active) return;
    if (!game.settings.get("wfrp4e", "autoEngaged")) return;

    let actor = effect.parent;
    if (!(actor instanceof Actor)) return;
    if (effect.statuses.has("engaged")) {
      // suppressConditionRemoval=true because the effect is already being deleted.
      // disengage will no-op if this actor is already being processed (_disengaging guard).
      EngagementTracker.disengage(actor, {suppressConditionRemoval: true});
    }
  });

  // Trigger disengage when the "Flee from Harm" group advantage action is used
  Hooks.on("wfrp4e:useGroupAdvantageAction", (actor, action) => {
    if (!game.user.isUniqueGM) return;
    if (!game.combat?.active) return;
    if (!game.settings.get("wfrp4e", "autoEngaged")) return;
    if (action.name !== "Flee from Harm") return;
    EngagementTracker.flee(actor);
  });

  Hooks.on("renderCombatTracker", (app, html, options) => {
    warhammer.utility.replacePopoutTokens(app.element); // Combat tracker shows tokens, replace popout versions with normal

    if (game.settings.get("wfrp4e", "useGroupAdvantage") && !html.querySelector(".advantage-groups"))
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

      element.insertAfter(html.querySelector(".combat-tracker-header"))
    }
  })
}
