this.actor.getActiveTokens().forEach(t => t.document.update({light : {
      "dim": 30,
      "bright": 20,
      "angle": 90,
      "alpha": 0.6,
      "animation": {
          "speed": 3,
          "intensity": 3,
          "type": "torch",
      },
      "color": "#ffcc66",
  }}));