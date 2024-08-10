this.actor.getActiveTokens().forEach(t => t.document.update({light : {
      "dim": 0,
      "bright": 0,
      "angle": 360,
      "alpha": 0.5,
      "animation": {
          "speed": 0,
          "intensity": 0,
          "type": "none",
      },
      "color": "",
  }}));