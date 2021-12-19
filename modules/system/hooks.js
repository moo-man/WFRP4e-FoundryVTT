import * as initHooks from "../hooks/init.js"
import * as readyHooks from "../hooks/ready.js"
import * as canvasHooks from "../hooks/canvas.js"
import * as chatHooks from "../hooks/chat.js"
import * as combatHooks from "../hooks/combat.js"
import * as controlButtonHooks from "../hooks/getSceneControlButtons.js"
import * as hotbarHooks from "../hooks/hotbarDrop.js"
import * as actorHooks from "../hooks/actor.js"
import * as itemHooks from "../hooks/item.js"
import * as effectHooks from "../hooks/activeEffects.js"
import * as journalHooks from "../hooks/journal.js"
import * as sidebarHooks from "../hooks/sidebar.js"
import * as rolltableHooks from "../hooks/rolltable.js"
import * as contextHooks from "../hooks/entryContext.js"
import * as tokenHooks from "../hooks/token.js"
import * as moduleHooks from "../hooks/moduleHooks.js"
import * as setupHooks from "../hooks/setup.js"
import * as handlebarsHelpers from "../hooks/handlebars.js"
import * as keepId from "../hooks/keepId.js"

export default function registerHooks() {
    initHooks.default()
    readyHooks.default()
    canvasHooks.default()
    chatHooks.default()
    combatHooks.default()
    controlButtonHooks.default()
    hotbarHooks.default()
    actorHooks.default()
    itemHooks.default()
    effectHooks.default()
    journalHooks.default()
    sidebarHooks.default()
    rolltableHooks.default()
    contextHooks.default()
    tokenHooks.default()
    moduleHooks.default()
    setupHooks.default();
    handlebarsHelpers.default();
    keepId.default();
}