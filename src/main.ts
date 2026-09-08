import Phaser from "phaser";
import "./style.css";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { TopikMapScene } from "./scenes/TopikMapScene";
import { MateriScene } from "./scenes/MateriScene";
import { QuizScene } from "./scenes/QuizScene";
import { ResultScene } from "./scenes/ResultScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#fdf6e8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 600,
  },
  scene: [MainMenuScene, TopikMapScene, MateriScene, QuizScene, ResultScene],
};

new Phaser.Game(config);
