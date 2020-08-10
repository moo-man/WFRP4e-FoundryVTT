
Hooks.on("popout:renderSheet", (sheet) => {
    sheet.element.css({ width: "610px", height: "740px", padding: "0px" })
})

Hooks.once('diceSoNiceReady', (dice3d) => {
    dice3d.addSystem({ id: "wfrp-black", name: "WFRP Black" }, false);
    dice3d.addSystem({ id: "wfrp-white", name: "WFRP White" }, false);
    dice3d.addSystem({ id: "wfrp-red", name: "WFRP Red" }, false);
    dice3d.addDicePreset({
        type: "d10",
        labels: [
            'systems/wfrp4e/ui/dices/black/d10-1.png',
            'systems/wfrp4e/ui/dices/black/d10-2.png',
            'systems/wfrp4e/ui/dices/black/d10-3.png',
            'systems/wfrp4e/ui/dices/black/d10-4.png',
            'systems/wfrp4e/ui/dices/black/d10-5.png',
            'systems/wfrp4e/ui/dices/black/d10-6.png',
            'systems/wfrp4e/ui/dices/black/d10-7.png',
            'systems/wfrp4e/ui/dices/black/d10-8.png',
            'systems/wfrp4e/ui/dices/black/d10-9.png',
            'systems/wfrp4e/ui/dices/black/d10-0.png'
        ],
        bumpMaps: [
            'systems/wfrp4e/ui/dices/normals/d10-1.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-2.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-3.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-4.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-5.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-6.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-7.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-8.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-9.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-0.jpg'
        ],
        system: "wfrp-black"
    });

    dice3d.addDicePreset({
        type: "d10",
        labels: [
            'systems/wfrp4e/ui/dices/white/d10-1.png',
            'systems/wfrp4e/ui/dices/white/d10-2.png',
            'systems/wfrp4e/ui/dices/white/d10-3.png',
            'systems/wfrp4e/ui/dices/white/d10-4.png',
            'systems/wfrp4e/ui/dices/white/d10-5.png',
            'systems/wfrp4e/ui/dices/white/d10-6.png',
            'systems/wfrp4e/ui/dices/white/d10-7.png',
            'systems/wfrp4e/ui/dices/white/d10-8.png',
            'systems/wfrp4e/ui/dices/white/d10-9.png',
            'systems/wfrp4e/ui/dices/white/d10-0.png'
        ],
        bumpMaps: [
            'systems/wfrp4e/ui/dices/normals/d10-1.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-2.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-3.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-4.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-5.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-6.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-7.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-8.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-9.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-0.jpg'
        ],
        system: "wfrp-white"
    });

    dice3d.addDicePreset({
        type: "d10",
        labels: [
            'systems/wfrp4e/ui/dices/red/d10-1.png',
            'systems/wfrp4e/ui/dices/red/d10-2.png',
            'systems/wfrp4e/ui/dices/red/d10-3.png',
            'systems/wfrp4e/ui/dices/red/d10-4.png',
            'systems/wfrp4e/ui/dices/red/d10-5.png',
            'systems/wfrp4e/ui/dices/red/d10-6.png',
            'systems/wfrp4e/ui/dices/red/d10-7.png',
            'systems/wfrp4e/ui/dices/red/d10-8.png',
            'systems/wfrp4e/ui/dices/red/d10-9.png',
            'systems/wfrp4e/ui/dices/red/d10-0.png'
        ],
        bumpMaps: [
            'systems/wfrp4e/ui/dices/normals/d10-1.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-2.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-3.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-4.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-5.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-6.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-7.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-8.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-9.jpg',
            'systems/wfrp4e/ui/dices/normals/d10-0.jpg'
        ],
        system: "wfrp-red"
    });

    dice3d.addDicePreset({
        type: "d100",
        labels: [
            'systems/wfrp4e/ui/dices/black/d100-10.png',
            'systems/wfrp4e/ui/dices/black/d100-20.png',
            'systems/wfrp4e/ui/dices/black/d100-30.png',
            'systems/wfrp4e/ui/dices/black/d100-40.png',
            'systems/wfrp4e/ui/dices/black/d100-50.png',
            'systems/wfrp4e/ui/dices/black/d100-60.png',
            'systems/wfrp4e/ui/dices/black/d100-70.png',
            'systems/wfrp4e/ui/dices/black/d100-80.png',
            'systems/wfrp4e/ui/dices/black/d100-90.png',
            'systems/wfrp4e/ui/dices/black/d100-00.png'
        ],
        bumpMaps: [
            'systems/wfrp4e/ui/dices/normals/d100-10.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-20.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-30.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-40.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-50.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-60.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-70.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-80.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-90.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-00.jpg'
        ],
        system: "wfrp-black"
    });

    dice3d.addDicePreset({
        type: "d100",
        labels: [
            'systems/wfrp4e/ui/dices/white/d100-10.png',
            'systems/wfrp4e/ui/dices/white/d100-20.png',
            'systems/wfrp4e/ui/dices/white/d100-30.png',
            'systems/wfrp4e/ui/dices/white/d100-40.png',
            'systems/wfrp4e/ui/dices/white/d100-50.png',
            'systems/wfrp4e/ui/dices/white/d100-60.png',
            'systems/wfrp4e/ui/dices/white/d100-70.png',
            'systems/wfrp4e/ui/dices/white/d100-80.png',
            'systems/wfrp4e/ui/dices/white/d100-90.png',
            'systems/wfrp4e/ui/dices/white/d100-00.png'
        ],
        bumpMaps: [
            'systems/wfrp4e/ui/dices/normals/d100-10.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-20.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-30.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-40.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-50.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-60.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-70.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-80.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-90.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-00.jpg'
        ],
        system: "wfrp-white"
    });

    dice3d.addDicePreset({
        type: "d100",
        labels: [
            'systems/wfrp4e/ui/dices/red/d100-10.png',
            'systems/wfrp4e/ui/dices/red/d100-20.png',
            'systems/wfrp4e/ui/dices/red/d100-30.png',
            'systems/wfrp4e/ui/dices/red/d100-40.png',
            'systems/wfrp4e/ui/dices/red/d100-50.png',
            'systems/wfrp4e/ui/dices/red/d100-60.png',
            'systems/wfrp4e/ui/dices/red/d100-70.png',
            'systems/wfrp4e/ui/dices/red/d100-80.png',
            'systems/wfrp4e/ui/dices/red/d100-90.png',
            'systems/wfrp4e/ui/dices/red/d100-00.png'
        ],
        bumpMaps: [
            'systems/wfrp4e/ui/dices/normals/d100-10.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-20.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-30.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-40.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-50.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-60.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-70.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-80.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-90.jpg',
            'systems/wfrp4e/ui/dices/normals/d100-00.jpg'
        ],
        system: "wfrp-red"
    });

});