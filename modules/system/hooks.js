import controlButtons from "../hooks/getSceneControlButtons.js"
import keepId from "../hooks/keepId.js"
import settings from "../hooks/settings.js"
import notes from "../hooks/note.js"
import WFRP_Utility from "./utility-wfrp4e.js"
import i18n from "../hooks/i18n.js"
import init from "../hooks/init.js"
import ready from "../hooks/ready.js"
import canvas from "../hooks/canvas.js"
import chat from "../hooks/chat.js"
import combat from "../hooks/combat.js"
import hotbarDrop from "../hooks/hotbarDrop.js"
import actor from "../hooks/actor.js"
import item from "../hooks/item.js"
import activeEffects from "../hooks/activeEffects.js"
import journal from "../hooks/journal.js"
import sidebar from "../hooks/sidebar.js"
import rolltable from "../hooks/rolltable.js"
import entryContext from "../hooks/entryContext.js"
import token from "../hooks/token.js"
import handlebars from "../hooks/handlebars.js"

export default function registerHooks() {
    init()
    ready()
    canvas()
    chat()
    combat()
    controlButtons()
    hotbarDrop()
    actor()
    item()
    activeEffects()
    journal()
    sidebar()
    rolltable()
    entryContext()
    token()
    handlebars();
    i18n();
    settings();
    keepId();
    notes();


    // #if _ENV === "development"
    Hooks.on("renderApplication", (app, html, data) => {
        WFRP_Utility.log(`Rendering ${app.constructor.name}: `, undefined, data)
    })
    //#endif

}