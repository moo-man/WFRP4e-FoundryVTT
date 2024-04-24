this.actor.getActiveTokens().forEach(t => t.document.update({light : {
      "dim": 20,
      "bright": 10,
      "angle": 360,
      "alpha": 0.4,
      "animation": {
          "speed": 3,
          "intensity": 3,
          "type": "torch",
      },
      "color": "#ffcc66",
  }}));