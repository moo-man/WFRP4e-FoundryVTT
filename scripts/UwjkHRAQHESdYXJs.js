this.actor.getActiveTokens().forEach(t => t.document.update({light : {
    "dim": 2,
    "bright": 1,
    "alpha": 0.5,
    "animation": {
        "speed": 4,
        "intensity": 4,
        "type": "pulse",
    },
    "color": "#949bff",
}}));