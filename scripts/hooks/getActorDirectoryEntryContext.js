/**
 * Add right click option to actors to add all basic skills
 */
Hooks.on("getActorDirectoryEntryContext", async (html, options) => {
    options.push( 
    {
      name : "Add Basic Skills",
      condition: true,
      icon: '<i class="fas fa-plus"></i>',
      callback: target => {
        const actor = game.actors.get(target.attr('data-entity-id'));
        actor.addBasicSkills();
      }
      
    })
  })