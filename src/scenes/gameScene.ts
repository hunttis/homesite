import { Tilemaps } from "phaser";
import { GameItem, LudumDareGames } from "../data/Data";
import * as ES from "easystarjs";
import * as Loader from "./game/loader";
import "easystarjs";

const EasyStar: new () => ES.js = (ES as any).default.js;

export class GameScene extends Phaser.Scene {
  finder = new EasyStar();
  currentPath!: { x: number; y: number }[] | undefined;
  nextNode!: { x: number; y: number } | undefined;
  pathNodes!: Phaser.GameObjects.Group;

  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  obstacle!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  tilemap!: Tilemaps.Tilemap;
  groundLayer!: Tilemaps.StaticTilemapLayer;
  obstacleLayer!: Tilemaps.StaticTilemapLayer;
  decorationLayer!: Tilemaps.StaticTilemapLayer;
  toiLayer!: Tilemaps.StaticTilemapLayer;
  infoLayer!: Tilemaps.ObjectLayer;
  water!: Phaser.GameObjects.TileSprite;
  waterFrame: number = 0;

  gameItems!: Phaser.GameObjects.Group;
  moveTarget!: Phaser.GameObjects.Sprite;

  ludumDareMonoliths!: Phaser.GameObjects.Group;

  playerSpeed = 100;
  tileSize = 32;

  constructor() {
    super({ active: false, visible: false });
    Phaser.Scene.call(this, { key: "GameScene" });
    console.log("game", this.game);

    (window as any).game = this;
  }

  preload() {
    console.log("Game preload");
    Loader.loadImages(this);
    Loader.loadSpriteSheets(this, this.tileSize);

    this.load.tilemapTiledJSON("tilemap", "assets/map.json");
  }

  create() {
    console.log("Game create");

    Loader.createAnimations(this);

    this.gameItems = this.add.group();
    this.pathNodes = this.add.group();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.player = this.physics.add
      .sprite(100, 100, "goblin-knight")
      .setDepth(1)
      .setName("Player")
      .play("idle")
      .setOrigin(0.5, 0.8)
      .setScale(2, 2);

    this.player.body.setSize(8, 12, true);

    this.moveTarget = this.add.sprite(10, 10, "spell").setDepth(1);
    this.moveTarget.play("spellwobble");
    this.moveTarget.setActive(false);
    this.moveTarget.setVisible(false);

    const ludumDareMonolithLocations: Phaser.Math.Vector2[] = [];

    this.tilemap = this.add.tilemap("tilemap");
    this.tilemap.addTilesetImage("tiles", "tiles", this.tileSize, this.tileSize, 1, 2);

    this.water = this.add.tileSprite(
      0,
      0,
      this.tilemap.width * this.tileSize,
      this.tilemap.height * this.tileSize,
      "water"
    );

    this.groundLayer = this.tilemap.createStaticLayer("Ground", "tiles");

    this.obstacleLayer = this.tilemap.createStaticLayer("Obstacles", "tiles");
    this.obstacleLayer.setCollision(197, true);
    this.obstacleLayer.setVisible(false);

    var grid = [];
    for (var y = 0; y < this.tilemap.height; y++) {
      var col = [];
      for (var x = 0; x < this.tilemap.width; x++) {
        col.push(this.getTileID(x, y, this.obstacleLayer));
      }
      grid.push(col);
    }

    this.finder.setGrid(grid);
    this.finder.setAcceptableTiles([0]);
    this.finder.disableCornerCutting();
    this.finder.enableDiagonals();

    this.decorationLayer = this.tilemap.createStaticLayer("Decoration", "tiles");
    this.decorationLayer.setVisible(true);

    this.toiLayer = this.tilemap.createStaticLayer("TilesOfInterest", "tiles");
    this.toiLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (tile.index != -1) {
        if (tile.index === 80) {
          console.log("Monolith at: ", tile.x, tile.y);
          ludumDareMonolithLocations.push(new Phaser.Math.Vector2(tile.x * tile.width, tile.y * tile.height));
          tile.index = -1;
        } else if (tile.index === 86) {
          console.log("Player at: ", tile.x, tile.y);
          this.player.x = tile.x * tile.width;
          this.player.y = tile.y * tile.height;
          tile.index = -1;
        }
      }
    });

    var monolithIndex = 0;

    LudumDareGames.forEach((item) => {
      const gameItem = this.physics.add
        .staticSprite(
          ludumDareMonolithLocations[monolithIndex].x + 8,
          ludumDareMonolithLocations[monolithIndex].y + 8,
          "sign"
        )
        .setName(item.name)
        .setScale(2, 2)
        .setData(item);

      monolithIndex++;
      this.gameItems.add(gameItem);
    });

    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
    this.cameras.main.setRoundPixels(true);

    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer) => {
        this.moveTarget.setPosition(pointer.worldX, pointer.worldY);
        this.moveTarget.setActive(true);
        this.moveTarget.setVisible(true);
        this.player.play("walk", true);

        this.findPath(this.player, this.moveTarget);

        console.log("Clicked in: ", pointer.position);
      },
      this
    );
  }

  getTileID(x: number, y: number, layer: Tilemaps.StaticTilemapLayer) {
    var tile = layer.getTileAt(x, y);
    return tile && tile.index ? tile.index : 0;
  }

  findPath = (player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, moveTarget: Phaser.GameObjects.Sprite) => {
    const fromX = Math.floor(player.x / this.tileSize);
    const fromY = Math.floor(player.y / this.tileSize);
    const toX = Math.floor(moveTarget.x / this.tileSize);
    const toY = Math.floor(moveTarget.y / this.tileSize);

    console.log(fromX, fromY, toX, toY);

    this.finder.findPath(fromX, fromY, toX, toY, (path: { x: number; y: number }[]) => {
      this.pathNodes.children.each((node) => node.destroy());
      this.currentPath = undefined;
      this.nextNode = undefined;

      if (path === null) {
        console.log("no path found!");
        this.currentPath = undefined;
      } else {
        console.log("path found!", path);
        this.currentPath = path;
        for (var i = 0; i < this.currentPath.length; i++) {
          const pathnode = this.currentPath[i];
          let pathsprite;
          let angleToNext = 0;
          if (this.currentPath[i + 1]) {
            pathsprite = this.physics.add.sprite(
              pathnode.x * this.tileSize + this.tileSize / 2,
              pathnode.y * this.tileSize + this.tileSize / 2,
              "footprints"
            );
            angleToNext = Phaser.Math.Angle.BetweenPoints(pathnode, this.currentPath[i + 1]);
            pathsprite.rotation = angleToNext;
            pathsprite.alpha = 0.5;
          } else {
            pathsprite = this.physics.add.sprite(
              pathnode.x * this.tileSize + this.tileSize / 2,
              pathnode.y * this.tileSize + this.tileSize / 2,
              "target"
            );
            pathsprite.play("targetpulse");
          }
          this.pathNodes.add(pathsprite);
        }
      }
    });

    this.finder.calculate();
  };

  update(time: number, delta: number) {
    this.player.setVelocity(0, 0);

    this.waterFrame += delta / 100;
    this.waterFrame = Phaser.Math.Wrap(this.waterFrame, 0, 14);
    this.water.setFrame(Math.round(this.waterFrame));

    const keyboardMovementThisRound = this.keyboardMovement(delta);
    this.pathMovement(delta);

    this.physics.world.collide(this.player, this.obstacle);
    this.physics.world.collide(this.player, this.gameItems, this.showData);
    if (keyboardMovementThisRound) {
      this.physics.world.collide(this.player, this.obstacleLayer);
    }
    this.physics.world.overlap(this.player, this.decorationLayer);
    this.physics.world.overlap(this.player, this.pathNodes, this.destroyLatter);

    this.gameItems.getChildren().forEach((item) => {
      if (item.state == "show") {
        console.log("ITEM", item);
        const text = this.add.text(item.body.position.x, item.body.position.y, item.name);
        text.x = text.x - text.width / 2;
        text.y = text.y - text.height;
        text.setDepth(10);
        const tweenConfig: Phaser.Types.Tweens.TweenBuilderConfig = {
          targets: text,
          props: {
            alpha: { value: "-=1", duration: 2000 },
          },
        };
        this.tweens.add(tweenConfig);
        item.state = "";
      }
    });
  }

  keyboardMovement(delta: number): boolean {
    let keyPressed = false;
    if (this.cursors.left!.isDown) {
      this.player.setFlipX(false);
      this.player.play("walk", true);
      this.player.setVelocityX(-this.playerSpeed);
      keyPressed = true;
    } else if (this.cursors.right!.isDown) {
      this.player.setFlipX(true);
      this.player.play("walk", true);
      this.player.setVelocityX(this.playerSpeed);
      keyPressed = true;
    }

    if (this.cursors.up!.isDown) {
      this.player.play("walk", true);
      this.player.setVelocityY(-this.playerSpeed);
      keyPressed = true;
    } else if (this.cursors.down!.isDown) {
      this.player.play("walk", true);
      this.player.setVelocityY(this.playerSpeed);
      keyPressed = true;
    }

    if (keyPressed) {
      this.clearPath();
    } else {
      if (!this.currentPath && !this.nextNode) {
        this.player.play("idle", true);
      }
    }

    return keyPressed;
  }

  pathMovement(delta: number) {
    if (this.nextNode) {
      this.physics.moveTo(
        this.player,
        this.nextNode.x * this.tileSize + this.tileSize / 2,
        this.nextNode.y * this.tileSize + this.tileSize / 2,
        this.playerSpeed
      );
      if (
        Phaser.Math.Distance.BetweenPoints(
          new Phaser.Math.Vector2(this.player.x, this.player.y),
          new Phaser.Math.Vector2(
            this.nextNode.x * this.tileSize + this.tileSize / 2,
            this.nextNode.y * this.tileSize + this.tileSize / 2
          )
        ) < 1
      ) {
        this.nextNode = undefined;
        if (!this.currentPath) {
          this.clearPath(true);
        }
      } else {
        this.player.play("walk", true);
        if (this.player.body.velocity.x >= 0) {
          this.player.setFlipX(true);
        } else {
          this.player.setFlipX(false);
        }
      }
    }

    if (this.currentPath && !this.nextNode) {
      this.nextNode = this.currentPath.shift();
      if (this.currentPath.length == 0) {
        this.currentPath = undefined;
      }
    }
  }

  clearPath(force: boolean = false) {
    if (this.currentPath || this.nextNode || force) {
      this.currentPath = undefined;
      this.nextNode = undefined;
      this.pathNodes.children.each((node) => node.destroy());
      this.player.play("idle", true);
      this.moveTarget.setActive(false);
      this.moveTarget.setVisible(false);
    }
  }

  destroyLatter(
    first: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    second: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    if (first.name === "Player") {
      second.destroy();
    } else {
      first.destroy();
    }
  }

  showData(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    monolith: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    console.log("PLAYER", player.name);
    console.log("MONOLITH", monolith.name);
    const itemData: GameItem = monolith.data.getAll() as GameItem;
    monolith.setState("show");
    console.log("DATA", itemData);
  }
}

export default GameScene;
