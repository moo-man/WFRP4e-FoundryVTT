import NameGenWfrp from "../apps/name-gen.js";
import TravelDistanceWfrp4e from "../apps/travel-distance-wfrp4e.js";
import HomebrewSettings from "../apps/homebrew-settings.js";

export default function() {
  /**
   * Init function loads tables, registers settings, and loads templates
   */
  Hooks.once("init", () => {

    TravelDistanceWfrp4e.loadTravelData();

    game.settings.register("wfrp4e", "systemMigrationVersion", {
      name: "System Migration Version",
      scope: "world",
      config: false,
      type: String,
      default: 0
    });

    game.settings.registerMenu("wfrp4e", "homebrew", {
      name: "WFRP4e House Rules",
      label: "WFRP4e Homebrew",
      hint: "Settings for common homebrew/house rules",
      type: HomebrewSettings,
      restricted: true
  })

    // Register initiative rule
    game.settings.register("wfrp4e", "initiativeRule", {
      name: "SETTINGS.InitRule",
      hint: "SETTINGS.InitHint",
      scope: "world",
      config: true,
      default: "default",
      type: String,
      choices: {
        "default": "SETTINGS.InitDefault",
        "sl": "SETTINGS.InitSL",
        "d10Init": "SETTINGS.InitD10",
        "d10InitAgi": "SETTINGS.InitD10Agi"
      },
      onChange: rule => _setWfrp4eInitiative(rule)
    });
    _setWfrp4eInitiative(game.settings.get("wfrp4e", "initiativeRule"));


    function _setWfrp4eInitiative(initMethod) {
      let formula;
      switch (initMethod) {
        case "default":
          formula = "@characteristics.i.value + @characteristics.ag.value/100";
          break;

        case "sl":
          formula = "(floor(@characteristics.i.value / 10) - floor(1d100/10))"
          break;

        case "d10Init":
          formula = "1d10 + @characteristics.i.value"
          break;

        case "d10InitAgi":
          formula = "1d10 + @characteristics.i.bonus + @characteristics.ag.bonus"
          break;
      }

      let decimals = (initMethod == "default") ? 2 : 0;
      CONFIG.Combat.initiative = {
        formula: formula,
        decimals: decimals
      }
    }


    // Register Advantage cap
    game.settings.register("wfrp4e", "capAdvantageIB", {
      name: "SETTINGS.CapAdvIB",
      hint: "SETTINGS.CapAdvIBHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    // Register Fast SL rule
    game.settings.register("wfrp4e", "fastSL", {
      name: "SETTINGS.FastSL",
      hint: "SETTINGS.FastSLHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    // Register Tests above 100% Rule
    game.settings.register("wfrp4e", "testAbove100", {
      name: "SETTINGS.TestsAbove100",
      hint: "SETTINGS.TestsAbove100Hint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    // Register Criticals/Fumbles on all tests
    game.settings.register("wfrp4e", "criticalsFumblesOnAllTests", {
      name: "SETTINGS.CriticalsFumblesAllTests",
      hint: "SETTINGS.CriticalsFumblesAllTestsHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });


    // Register Extended Tests
    game.settings.register("wfrp4e", "extendedTests", {
      name: "SETTINGS.ExtendedTests",
      hint: "SETTINGS.ExtendedTestsHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "channelingNegativeSLTests", {
      name: "SETTINGS.ChannelingNegativeSL",
      hint: "SETTINGS.ChannelingNegativeSLHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    // Limit Equipped Items
    game.settings.register("wfrp4e", "limitEquippedWeapons", {
      name: "SETTINGS.LimitEquippedWeapons",
      hint: "SETTINGS.LimitEquippedWeaponsHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });

    // Register Test auto-fill
    game.settings.register("wfrp4e", "autoFillAdvantage", {
      name: "SETTINGS.AutoFillAdv",
      hint: "SETTINGS.AutoFillAdvHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });

    // Register default test difficulty
    game.settings.register("wfrp4e", "testDefaultDifficulty", {
      name: "SETTINGS.TestDialogDefaultDifficulty",
      hint: "SETTINGS.TestDialogDefaultDifficultyHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    // Register Round Summary
    game.settings.register("wfrp4e", "displayRoundSummary", {
      name: "SETTINGS.RoundSummary",
      hint: "SETTINGS.RoundSummaryHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });

    // Register Status on Turn Start
    game.settings.register("wfrp4e", "statusOnTurnStart", {
      name: "SETTINGS.StatusTurnStart",
      hint: "SETTINGS.StatusTurnStartHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });


    // Register Focus on Turn Start
    game.settings.register("wfrp4e", "focusOnTurnStart", {
      name: "SETTINGS.FocusTurnStart",
      hint: "SETTINGS.FocusTurnStartHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });

    // Register Hiding Test Data
    game.settings.register("wfrp4e", "hideTestData", {
      name: "SETTINGS.HideTestData",
      hint: "SETTINGS.HideTestDataHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });

    // Register Manual Chat Cards
    game.settings.register("wfrp4e", "manualChatCards", {
      name: "SETTINGS.ManualChatCards",
      hint: "SETTINGS.ManualChatCardsHint",
      scope: "client",
      config: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "weaponLength", {
      name: "SETTINGS.WeaponLength",
      hint: "SETTINGS.WeaponLengthHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });

    game.settings.register("wfrp4e", "rangeAutoCalculation", {
      name: "SETTINGS.RangeAutoCalculation",
      hint: "SETTINGS.RangeAutoCalculationHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });


    game.settings.register("wfrp4e", "playerBrowser", {
      name: "SETTINGS.PlayerBrowser",
      hint: "SETTINGS.PlayerBrowserHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "playerExperienceEditing", {
      name: "SETTINGS.PlayerExperienceEditing",
      hint: "SETTINGS.PlayerExperienceEditingHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });


    // Register Advantage cap
    game.settings.register("wfrp4e", "soundPath", {
      name: "SETTINGS.SoundEffects",
      hint: "SETTINGS.SoundEffectsHint",
      scope: "world",
      config: true,
      default: "systems/wfrp4e/sounds/",
      type: String
    });

    game.settings.register("wfrp4e", "customCursor", {
      name: "SETTINGS.CustomCursor",
      hint: "SETTINGS.CustomCursorHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });


    game.settings.register("wfrp4e", "throwMoney", {
      name: "SETTINGS.ThrowMoney",
      hint: "SETTINGS.ThrowMoneyHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });

    game.settings.register("wfrp4e", "advantageBonus", {
      name: "SETTINGS.AdvantageBonus",
      hint: "SETTINGS.AdvantageBonusHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: 10,
      type: Number
    });

    game.settings.register("wfrp4e", "dangerousCrits", {
      name: "SETTINGS.DangerousCrits",
      hint: "SETTINGS.DangerousCritsHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "dangerousCritsMod", {
      name: "SETTINGS.DangerousCritsMod",
      hint: "SETTINGS.DangerousCritsModHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: 10,
      type: Number
    });

    game.settings.register("wfrp4e", "tables", {
      scope: "world",
      config: false,
      default: {},
      type: Object
    });

    game.settings.register("wfrp4e", "bugReportName", {
      scope: "world",
      config: false,
      default: "",
      type: String
    });

    game.settings.register("wfrp4e", "tableVisibility", {
      scope: "world",
      config: false,
      default: {},
      type: Object
    });

    
    game.settings.register("wfrp4e", "tableRollMode", {
      scope: "client",
      config: false,
      default: {},
      type: Object
    });



    game.settings.register("wfrp4e", "mooAdvantage", {
      name: "SETTINGS.MooAdvantage",
      hint: "SETTINGS.MooAdvantageHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });



    game.settings.register("wfrp4e", "mooDifficulty", {
      name: "SETTINGS.MooDifficulty",
      hint: "SETTINGS.MooDifficultyHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });


    
    // game.settings.register("wfrp4e", "mooCritsFumbles", {
    //   name: "SETTINGS.MooCritsFumbles",
    //   hint: "SETTINGS.MooCritsFumblesHint",
    //   scope: "world",
    //   config: false,
    //   homebrew: true,
    //   default: false,
    //   type: Boolean
    // });


    game.settings.register("wfrp4e", "mooConditions", {
      name: "SETTINGS.MooConditions",
      hint: "SETTINGS.MooConditionsHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "mooConditionTriggers", {
      name: "SETTINGS.MooConditionTriggers",
      hint: "SETTINGS.MooConditionTriggersHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "mooCritModifiers", {
      name: "SETTINGS.MooCritModifiers",
      hint: "SETTINGS.MooCritMOdifiersHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });


    game.settings.register("wfrp4e", "mooSLDamage", {
      name: "SETTINGS.MooSLDamage",
      hint: "SETTINGS.MooSLDamageHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "mooRangedDamage", {
      name: "SETTINGS.MooRangedDamage",
      hint: "SETTINGS.MooRangedDamageHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });


    game.settings.register("wfrp4e", "mooMagicAdvantage", {
      name: "SETTINGS.MooMagicAdvantage",
      hint: "SETTINGS.MooMagicAdvantageHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "mooOvercasting", {
      name: "SETTINGS.MooOvercasting",
      hint: "SETTINGS.MooOvercastingHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "mooCatastrophicMiscasts", {
      name: "SETTINGS.MooCatastrophicMiscasts",
      hint: "SETTINGS.MooCatastrophicMiscastsHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

      
    // Register Partial Channelling
    game.settings.register("wfrp4e", "partialChannelling", {
      name: "SETTINGS.PartialChannelling",
      hint: "SETTINGS.PartialChannellingHint",
      scope: "world",
      homebrew: true,
      config: false,
      default: false,
      type: Boolean
    });


    game.settings.register("wfrp4e", "mooCriticalChannelling", {
      name: "SETTINGS.MooCriticalChannelling",
      hint: "SETTINGS.MooCriticalChannellingHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "mooCastAfterChannelling", {
      name: "SETTINGS.MooCastAfterChannelling",
      hint: "SETTINGS.MooCastAfterChannellingHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "mooPenetrating", {
      name: "SETTINGS.MooPenetrating",
      hint: "SETTINGS.MooPenetratingHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "mooQualities", {
      name: "SETTINGS.MooQualities",
      hint: "SETTINGS.MooQualitiesHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "mooShieldAP", {
      name: "SETTINGS.MooShieldAP",
      hint: "SETTINGS.MooShieldAPHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "mooCriticalMitigation", {
      name: "SETTINGS.MooCriticalMitigation",
      hint: "SETTINGS.MooCriticalMitigationHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });


    game.settings.register("wfrp4e", "mooRangeBands", {
      name: "SETTINGS.MooRangeBands",
      hint: "SETTINGS.MooRangeBandsHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "mooSizeDamage", {
      name: "SETTINGS.MooSizeDamage",
      hint: "SETTINGS.MooSizeDamageHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });

    
    game.settings.register("wfrp4e", "mooHomebrewItemChanges", {
      name: "SETTINGS.MooHomebrewItems",
      hint: "SETTINGS.MooHomebrewItemHint",
      scope: "world",
      config: false,
      homebrew: true,
      default: false,
      type: Boolean
    });





    // Pre-load templates
    loadTemplates([
      "systems/wfrp4e/templates/actors/character/character-main.html",
      "systems/wfrp4e/templates/actors/actor-combat.html",
      "systems/wfrp4e/templates/actors/actor-effects.html",
      "systems/wfrp4e/templates/actors/actor-biography.html",
      "systems/wfrp4e/templates/actors/actor-inventory.html",
      "systems/wfrp4e/templates/actors/actor-skills.html",
      "systems/wfrp4e/templates/actors/actor-magic.html",
      "systems/wfrp4e/templates/actors/actor-religion.html",
      "systems/wfrp4e/templates/actors/actor-talents.html",
      "systems/wfrp4e/templates/actors/actor-notes.html",
      "systems/wfrp4e/templates/actors/npc/npc-careers.html",
      "systems/wfrp4e/templates/actors/creature/creature-main.html",
      "systems/wfrp4e/templates/actors/creature/creature-notes.html",
      "systems/wfrp4e/templates/actors/creature/creature-main.html",
      "systems/wfrp4e/templates/actors/vehicle/vehicle-main.html",
      "systems/wfrp4e/templates/actors/vehicle/vehicle-cargo.html",
      "systems/wfrp4e/templates/actors/vehicle/vehicle-description.html",
      "systems/wfrp4e/templates/actors/vehicle/vehicle-effects.html",
      "systems/wfrp4e/templates/partials/armour-location.html",
      "systems/wfrp4e/templates/partials/item-container.html",
      "systems/wfrp4e/templates/partials/qualities-flaws.html",
      "systems/wfrp4e/templates/partials/overcasts.html",
      "systems/wfrp4e/templates/dialog/dialog-constant.html",
      "systems/wfrp4e/templates/chat/roll/test-card.html",
      "systems/wfrp4e/templates/chat/help/chat-command-display-info.html",
      "systems/wfrp4e/templates/items/item-header.html",
      "systems/wfrp4e/templates/items/item-description.html",
      "systems/wfrp4e/templates/items/item-effects.html"
    ]);

    // Load name construction from files
    NameGenWfrp._loadNames();
    CONFIG.Morrslieb = new PIXI.filters.AdjustmentFilter({ green: 0.7137, red: 0.302, blue: 0.2275 })

    CONFIG.fontFamilies.push("CaslonAntique")

    CONFIG.canvasTextStyle = new PIXI.TextStyle({
      fontFamily: "CaslonAntique",
      fontSize: 36,
      fill: "#FFFFFF",
      stroke: '#111111',
      strokeThickness: 1,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: 0,
      dropShadowDistance: 0,
      align: "center",
      wordWrap: false
    })

    // Keep a list of actors that need to prepareData after 'ready' (generally those that rely on other actor data - passengers/mounts)
    game.wfrp4e.postReadyPrepare = [];

  });
}