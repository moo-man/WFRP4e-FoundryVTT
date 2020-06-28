  // Fixes width for roll tables with our custom UI
  Hooks.on("renderRollTableConfig", async (obj, html, data) => {
    html[0].style.width = "730px"
  });
