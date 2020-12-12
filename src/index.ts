import { GameScene } from "./scenes/gameScene";
import { MenuScene } from "./scenes/menuScene";

export function startGame() {
  const config: Phaser.Types.Core.GameConfig = {
    title: "Phaser game",
    render: {
      pixelArt: true
      // roundPixels: true
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      // autoCenter: Phaser.Scale.CENTER_BOTH,
      // zoom: 2,
      // width: 800,
      // height: 600,
    },
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    parent: "game",
    backgroundColor: "#0f0f0f",
    scene: [GameScene],
  };

  return new Phaser.Game(config);
}
