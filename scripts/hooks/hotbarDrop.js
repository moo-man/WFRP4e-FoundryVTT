/**
 * Create a macro when dropping an entity on the hotbar
 * Item      - open roll dialog for item
 * Actor     - open actor sheet
 * Journal   - open journal sheet
 */
Hooks.on("hotbarDrop", async (bar, data, slot) => 
{
  // Create item macro if rollable item - weapon, spell, prayer, trait, or skill
  if (data.type == "Item")
  {
    if (data.data.type != "weapon" && data.data.type != "spell" && data.data.type != "prayer" && data.data.type != "trait" && data.data.type != "skill")
      return
    let item = data.data
    let command = `WFRP_Utility.rollItemMacro("${item.name}", "${item.type}");`;
    let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
    if (!macro)
    {
      macro = await Macro.create({
        name: item.name,
        type : "script",
        img: item.img,
        command : command
      }, {displaySheet: false})
    }
    game.user.assignHotbarMacro(macro, slot);
  }
  // Create a macro to open the actor sheet of the actor dropped on the hotbar
  else if (data.type == "Actor")
  {
    let actor = game.actors.get(data.id);
    command = `game.actors.get("${data.id}").sheet.render(true)`
    let macro = game.macros.entities.find(m => (m.name === actor.name) && (m.command === command));
    if (!macro)
    {
      macro = await Macro.create({
        name: actor.data.name,
        type : "script",
        img: actor.data.img,
        command : command
      }, {displaySheet: false})
      game.user.assignHotbarMacro(macro, slot);
    }
  }
  // Create a macro to open the journal sheet of the journal dropped on the hotbar
  else if (data.type == "JournalEntry")
  {
    let journal = game.journal.get(data.id);
    command = `game.journal.get("${data.id}").sheet.render(true)`
    let macro = game.macros.entities.find(m => (m.name === journal.name) && (m.command === command));
    if (!macro)
    {
      macro = await Macro.create({
      name: journal.data.name,
      type : "script",
      img: "systems/wfrp4e/icons/buildings/scroll.png",
      command : command
      }, {displaySheet: false})
      game.user.assignHotbarMacro(macro, slot);
    }
  }
  return false;
});
