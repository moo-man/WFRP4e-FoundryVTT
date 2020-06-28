/**
 * Add Status right click option for combat tracker combatants
 */
Hooks.on("getCombatTrackerEntryContext", (html, options) => {
    options.push(
    {
      name: "Status",
      condition: true,
      icon: '<i class="far fa-question-circle"></i>',
      callback: target => {
        WFRP_Utility.displayStatus(target.attr("data-token-id"));
        $(`#sidebar-tabs`).find(`.item[data-tab="chat"]`).click();
      }
    })
  })