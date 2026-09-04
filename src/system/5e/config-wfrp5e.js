const WFRP5E = {}

WFRP5E.xpCost = {
    "characteristic": [25, 35, 50, 70, 100, 140, 190, 260, 360, 510, 720, 1005, 1390, 1800, 2250],
    "skill": [10, 15, 20, 30, 50, 80, 120, 170, 170, 340, 500, 700, 950, 1300, 1700]
}

// Difficulty Modifiers
WFRP5E.difficultyModifiers = {
    "veasy": 6,
    "easy": 4,
    "average": 2,
    "challenging": 0,
    "difficult": -1,
    "hard": -2,
    "vhard": -3
}

WFRP5E.difficultyLabels = {

    "veasy": "5e.DIFFICULTY.VEasy",
    "easy": "5e.DIFFICULTY.Easy",
    "average": "5e.DIFFICULTY.Average",
    "challenging": "5e.DIFFICULTY.Challenging",
    "difficult": "5e.DIFFICULTY.Difficult",
    "hard": "5e.DIFFICULTY.Hard",
    "vhard": "5e.DIFFICULTY.VHard"
}


   
export default WFRP5E
