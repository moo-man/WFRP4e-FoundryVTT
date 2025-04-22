import NameGenWfrp from "../apps/name-gen.js";
import TravelDistanceWFRP4e from "../apps/travel-distance-wfrp4e.js";
import TableSettings from "../apps/table-settings.js";
import WFRP4eThemeConfig from "../apps/theme.js";
import HomebrewConfig from "../apps/homebrew-settings.js";
import TokenRulerWFRP from "../canvas/token-ruler.js";


let debounceReload = foundry.utils.debounce(() => {
  window.location.reload();
}, 100);

export default function() {
  /**
   * Init function loads tables, registers settings, and loads templates
   */
  Hooks.once("init", () => {

    TravelDistanceWFRP4e.loadTravelData();

    game.settings.register("wfrp4e", "systemMigrationVersion", {
      name: "System Migration Version",
      scope: "world",
      config: false,
      type: String,
      default: 0
    });

    
    game.settings.registerMenu("wfrp4e", "themeConfig", {
      name: "WH.Theme.Config",
      label : "WH.Theme.ConfigButton",
      hint : "WH.Theme.ConfigHint",
      icon: "fa-solid fa-table-layout",
      scope: "user",
      config: true,
      type: WFRP4eThemeConfig
    });


    game.settings.registerMenu("wfrp4e", "homebrewConfig", {
      name: "WFRP4e House Rules",
      label: "Configure Homebrew",
      hint: "Settings for common homebrew/house rules",
      icon: "fa-solid fa-gears",
      type: HomebrewConfig,
      restricted: true
  })

  game.settings.registerMenu("wfrp4e", "tableSettings", {
    name: "WFRP4e Table Settings",
    label: "Configure Table Settings",
    hint: "Configure which tables to roll on when multiple of the same key exist.",
    icon: "fa-solid fa-list",
    type: TableSettings,
    restricted: true
})

    game.settings.register("wfrp4e", "theme", {
      name: "Theme",
      scope: "client",
      config: false,
      type: WFRP4eThemeConfig.schema
    });

    game.settings.register("wfrp4e", "homebrew", {
      name: "Hombrew Settings",
      scope: "client",
      config: false,
      type: HomebrewConfig.schema
    });


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

    // Register Advantage Cap
    game.settings.register("wfrp4e", "advantagemax", {
      name: "SETTINGS.AdvantageMax",
      hint: "SETTINGS.AdvantageMaxHint",
      scope: "world",
      config: true,
      default: 10,
      type: Number
    });

    // Register Advantage cap
    game.settings.register("wfrp4e", "capAdvantageIB", {
      name: "SETTINGS.CapAdvIB",
      hint: "SETTINGS.CapAdvIBHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    // Register Automatic Success threshold
    game.settings.register("wfrp4e", "automaticSuccess", {
      name: "SETTINGS.AutomaticSuccess",
      hint: "SETTINGS.AutomaticSuccessHint",
      scope: "world",
      config: true,
      default: 5,
      type: Number
    });

    // Register Automatic Success threshold
    game.settings.register("wfrp4e", "automaticFailure", {
      name: "SETTINGS.AutomaticFailure",
      hint: "SETTINGS.AutomaticFailureHint",
      scope: "world",
      config: true,
      default: 96,
      type: Number
    });

    // Register Fast SL rule
    game.settings.register("wfrp4e", "SLMethod", {
      name: "SETTINGS.SLMethod",
      hint: "SETTINGS.SLMethodHint",
      scope: "world",
      config: true,
      default: "default",
      choices: {
        "default": "SETTINGS.SLDefault",
        "fast": "SETTINGS.SLFast",
        "dos": "SETTINGS.SLDOS",
      },
      type: String
    });


    // // Register Fast SL rule
    // game.settings.register("wfrp4e", "fastSL", {
    //   name: "SETTINGS.FastSL",
    //   hint: "SETTINGS.FastSLHint",
    //   scope: "world",
    //   config: true,
    //   default: false,
    //   type: Boolean
    // });

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
    game.settings.register("wfrp4e", "uiaCrits", {
      name: "SETTINGS.UIACrits",
      hint: "SETTINGS.UIACritsHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });
    game.settings.register("wfrp4e", "uiaShields", {
      name: "SETTINGS.UIAShields",
      hint: "SETTINGS.UIAShieldsHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "uiaBleeding", {
      name: "SETTINGS.UIABleeding",
      hint: "SETTINGS.UIABleedingHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
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

    game.settings.register("wfrp4e", "useGroupAdvantage", {
      name: "SETTINGS.UseGroupAdvantage",
      hint: "SETTINGS.UseGroupAdvantageHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean, 
      onChange: debounceReload,
    });

    game.settings.register("wfrp4e", "groupAdvantageValues", {
      scope: "world",
      config: false,
      default: {players: 0, enemies : 0},
      type: Object
    });



    game.settings.register("wfrp4e", "useWoMOvercast", {
      name: "SETTINGS.useWoMOvercast",
      hint: "SETTINGS.useWoMOvercastHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "useWoMChannelling", {
      name: "SETTINGS.useWoMChannelling",
      hint: "SETTINGS.useWoMChannellingHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "useWoMInfluences", {
      name: "SETTINGS.useWoMInfluences",
      hint: "SETTINGS.useWoMInfluencesHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    game.settings.register("wfrp4e", "grudges", {
      name: "Grudges",
      scope: "world",
      config: false,
      default: [],
      type: Array
    });

    game.settings.register("wfrp4e", "tableSettings", {
      name: "SETTINGS.TableSettings",
      hint: "SETTINGS.TableSettings",
      scope: "world",
      config: false,
      type: TableSettings.schema

    });

    // Pre-load templates
    loadTemplates([
      "systems/wfrp4e/templates/actors/character/character-main.hbs",
      "systems/wfrp4e/templates/actors/actor-combat.hbs",
      "systems/wfrp4e/templates/actors/actor-effects.hbs",
      "systems/wfrp4e/templates/actors/actor-biography.hbs",
      "systems/wfrp4e/templates/actors/actor-inventory.hbs",
      "systems/wfrp4e/templates/actors/actor-skills.hbs",
      "systems/wfrp4e/templates/actors/actor-magic.hbs",
      "systems/wfrp4e/templates/actors/actor-religion.hbs",
      "systems/wfrp4e/templates/actors/actor-talents.hbs",
      "systems/wfrp4e/templates/actors/actor-notes.hbs",
      "systems/wfrp4e/templates/actors/npc/npc-careers.hbs",
      "systems/wfrp4e/templates/actors/creature/creature-main.hbs",
      "systems/wfrp4e/templates/actors/creature/creature-notes.hbs",
      "systems/wfrp4e/templates/actors/creature/creature-main.hbs",
      "systems/wfrp4e/templates/actors/vehicle/vehicle-main.hbs",
      "systems/wfrp4e/templates/actors/vehicle/vehicle-cargo.hbs",
      "systems/wfrp4e/templates/actors/vehicle/vehicle-description.hbs",
      "systems/wfrp4e/templates/actors/vehicle/vehicle-effects.hbs",
      "systems/wfrp4e/templates/sheets/partials/container-contents.hbs",
      "systems/wfrp4e/templates/partials/armour-location.hbs",
      "systems/wfrp4e/templates/partials/item-container.hbs",
      "systems/wfrp4e/templates/partials/qualities-flaws.hbs",
      "systems/wfrp4e/templates/partials/overcasts.hbs",
      "systems/wfrp4e/templates/partials/wom-overcasts.hbs",
      "systems/wfrp4e/templates/partials/manual-scripts.hbs",
      "systems/wfrp4e/templates/partials/list-effect.hbs",
      "systems/wfrp4e/templates/chat/roll/test-card.hbs",
      "systems/wfrp4e/templates/chat/help/chat-command-display-info.hbs",
      "systems/wfrp4e/templates/items/item-header.hbs",
      "systems/wfrp4e/templates/items/item-description.hbs",
      "systems/wfrp4e/templates/items/item-effects.hbs",
    ]);

    loadTemplates({            
      sheetButtons: "systems/wfrp4e/templates/sheets/partials/sheet-effect-buttons.hbs",
      aspects: "systems/wfrp4e/templates/partials/aspect-list.hbs",
      aspectsV2: "systems/wfrp4e/templates/sheets/partials/aspect-list.hbs",
      meleeWeapons: "systems/wfrp4e/templates/sheets/partials/melee-weapons.hbs",
      rangedWeapons: "systems/wfrp4e/templates/sheets/partials/ranged-weapons.hbs",
      armourLocation: "systems/wfrp4e/templates/sheets/partials/armour-location.hbs",
      creatureArmour: "systems/wfrp4e/templates/sheets/partials/creature-armour.hbs",
      vehicleArmour: "systems/wfrp4e/templates/sheets/partials/vehicle-armour.hbs",
      itemProperties: "systems/wfrp4e/templates/sheets/partials/item-properties.hbs",
      extraOvercast: "systems/wfrp4e/templates/sheets/partials/extra-overcast.hbs",
    });

    // Load name construction from files
    NameGenWfrp._loadNames();

      CONFIG.Morrslieb = new PIXI.filters.AdjustmentFilter({ green: 0.5, red: 0.25, blue: 0.25, morrslieb: true })
      CONFIG.MorrsliebObject = {
        color: { value:"#4cb53a", apply: true },
        gamma: 1.0,
        contrast: 1.0,
        brightness: 1.0,
        saturation: 0.2
    }

    CONFIG.fontDefinitions.CaslonAntique = {editor : true, fonts : []}

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

    // Token Ruler data
    delete CONFIG.Token.movement.actions.burrow;
    delete CONFIG.Token.movement.actions.jump;
    delete CONFIG.Token.movement.actions.climb.getCostFunction;
    delete CONFIG.Token.movement.actions.crawl.getCostFunction;
    CONFIG.Token.movement.actions.climb.canSelect = (token) => token?.actor?.system.canClimb;
    CONFIG.Token.movement.actions.crawl.canSelect = (token) => token?.actor?.system.canCrawl;
    CONFIG.Token.movement.actions.fly.canSelect = (token) => token?.actor?.system.canFly;
    CONFIG.Token.movement.actions.swim.canSelect = (token) => token?.actor?.system.canSwim;
    CONFIG.Token.rulerClass = TokenRulerWFRP;

    loadTemplates({
      aspectDetails: 'systems/wfrp4e/templates/items/partials/item-aspect-details.hbs',
      "chargen.species.preview": 'systems/wfrp4e/templates/apps/chargen/partials/species-preview.hbs'
    });
  });
}
