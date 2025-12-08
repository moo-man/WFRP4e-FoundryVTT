let token = this.actor.getActiveTokens()[0]?.document;
if (!token) {
    token = this.actor.prototypeToken
}
if (args.equipped) {
    this.effect.setFlag("wfrp4e", "lightData", token.light);
    token.update({
        light: {
            "alpha": 0.8,
            "angle": 360,
            "bright": 5,
            "color": "#a33c0f",
            "coloration": 1,
            "dim": 20,
            "attenuation": 0.5,
            "luminosity": 0.5,
            "saturation": 0,
            "contrast": 0,
            "shadows": 0,
            "animation": {
                "type": "torch",
                "speed": 8,
                "intensity": 4,
                "reverse": false
            }
        }
    })
}
else {
    token.update({light: this.effect.getFlag("wfrp4e", "lightData")});
}