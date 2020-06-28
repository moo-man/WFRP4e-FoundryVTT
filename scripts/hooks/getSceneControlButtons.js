/**
 * Add Status right click option for combat tracker combatants
 */
Hooks.on("getSceneControlButtons", (buttons) => {
    let group = buttons.find(b => b.name == "lighting")
    group.tools.push({
      button: true,
      icon : "fas fa-circle",
      name: "morrslieb",
      title: canvas.scene.getFlag("wfrp4e", "morrslieb") ? "Morrslieb - Currently On " : "Morrslieb - Currently Off",
      onClick : WFRP_Utility.toggleMorrslieb
    })
  })