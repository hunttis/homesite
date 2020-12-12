export interface GameItem {
    name: string
    gameUrl: string
    postJamGameUrl?: string
    image: string
    theme?: string
    event?: string
    description: string[]
}

export const LudumDareGames: GameItem[] = [

    {
        name: "Barbarians With Cannons",
        gameUrl: "FIXME",
        image: "",
        event: "Ludum Dare 34",
        theme: "Growing/Two Button Controls",
        description: ["FIX THE BUILD"]
    },
    {
        name: "Posthistoric Ooze",
        gameUrl: "https://huntt.is/ld-35/build/",
        image: "",
        event: "Ludum Dare 35",
        theme: "Shapeshift",
        description: [""]
    },
    {
        name: "Crystal Menace",
        gameUrl: "https://huntt.is/ld-39/",
        image: "",
        event: "Ludum Dare 39",
        theme: "Running Out of Power",
        description: [""]
    },
    {
        name: "Astrofarmer",
        gameUrl: "http://huntt.is/ld-40/",
        postJamGameUrl: "http://huntt.is/ld-40-postjam/",
        image: "",
        event: "Ludum Dare 40",
        theme: "The more you have, the worse it is",
        description: [""]
    },
    {
        name: "God Given Gifts - Taken",
        gameUrl: "http://huntt.is/ld-43",
        image: "",
        theme: "Sacrifices Must Be Made",
        event: "Ludum Dare 43",
        description: ["Made for Ludum Dare.", ""]
    },
    {
        name: "Don't Wake a Sleeping Vampire",
        gameUrl: "https://huntt.is/ld-44/",
        image: "",
        theme: "Your Life Is Currency",
        description: [""]
    },
    {
        name: "Crashteroid",
        gameUrl: "https://huntt.is/ld-45/",
        image: "",
        theme: "Start with Nothing",
        description: [""]
    },
    {
        name: "The Last Green",
        gameUrl: "https://huntt.is/ld-46/",
        image: "",
        theme: "Keep It Alive",
        description: [""]
    },
    {
        name: "Crystal Racer",
        gameUrl: "https://huntt.is/ld-47/",
        image: "",
        theme: "Stuck in a Loop",
        description: [""]
    },
]

export const GameList: GameItem[] =
    [
        {
            name: "Battle Matchers",
            gameUrl: "http://huntt.is/bm",
            image: "",
            description: ["Match-three tower defense, made just for fun. Thought of two game genres to mash up and this is the result.", "Quite happy with the unit graphics and animations actually, as I drew all of them myself.", "Need desktop or tablet for this"],
        },

        // {
        //     name: "",
        //     gameUrl: "",
        //     image: "",
        //     theme: "",
        //     description: [""]
        // },

    ]
