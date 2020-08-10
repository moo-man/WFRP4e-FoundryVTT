
    Hooks.on("closePermissionConfig", () => {
        if (game.permissions["FILES_BROWSE"].length < 4) {
          ui.notifications.warn("WARNING: WFRP4E currently requires users to have \"Browse File Explorer\" Permission", { permanent: true })
          return
        }
      })