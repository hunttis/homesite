import { Tilemaps } from "phaser";
import { LudumDareGames, GameItem } from "../data/Data";

export class GameScene extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  obstacle!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  groundLayer!: Tilemaps.StaticTilemapLayer;
  obstacleLayer!: Tilemaps.StaticTilemapLayer;
  decorationLayer!: Tilemaps.StaticTilemapLayer;
  toiLayer!: Tilemaps.StaticTilemapLayer;
  water!: Phaser.GameObjects.TileSprite;
  waterFrame: number = 0;

  gameItems!: Phaser.GameObjects.Group;
  moveTarget!: Phaser.GameObjects.Sprite;

  ludumDareMonoliths!: Phaser.GameObjects.Group;

  playerSpeed = 100;
  zoomLevel = 2;
  tileSize = 16;

  constructor() {
    super({ active: false, visible: false });
    Phaser.Scene.call(this, { key: "GameScene" });
    console.log("game", this.game);
  }

  preload() {
    console.log("Game preload");
    this.load.spritesheet("goblin-knight", "assets/images/goblin-knight.png", {
      frameWidth: 32,
      frameHeight: 32,
      endFrame: 3,
    });

    this.load.spritesheet("spell", "assets/images/spell.png", {
      frameWidth: 11,
      frameHeight: 12,
    });
    this.load.image("sign", "assets/images/sign.png");
    this.load.image("box", "assets/images/box.png");
    this.load.image("box2", "assets/images/box2.png");

    this.load.spritesheet("water", "assets/water.png", { frameWidth: this.tileSize, frameHeight: this.tileSize });

    this.load.image("tiles", "assets/tilemap_packed_extruded.png");
    this.load.tilemapTiledJSON("tilemap", "assets/map.json");
  }

  create() {
    console.log("Game create");

    this.createAnimations();

    this.gameItems = this.add.group();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.player = this.physics.add
      .sprite(100, 100, "goblin-knight")
      .setDepth(1)
      .setName("Player")
      .play("idle")
      .setScale(this.zoomLevel, this.zoomLevel);

    this.player.body.setSize(8, 12, true);

    this.moveTarget = this.add.sprite(10, 10, "spell").setDepth(1);
    this.moveTarget.play("spellwobble");
    this.moveTarget.setActive(false);
    this.moveTarget.setVisible(false);

    const ludumDareMonolithLocations: Phaser.Math.Vector2[] = [];

    const map = this.add.tilemap("tilemap");
    map.addTilesetImage("tiles", "tiles", this.tileSize, this.tileSize, 1, 2);

    this.water = this.add.tileSprite(
      0,
      0,
      map.width * this.tileSize * this.zoomLevel,
      map.height * this.tileSize * this.zoomLevel,
      "water"
    );
    this.water.setScale(this.zoomLevel, this.zoomLevel);

    this.groundLayer = map.createStaticLayer("Ground", "tiles");
    this.groundLayer.setScale(this.zoomLevel, this.zoomLevel);

    this.obstacleLayer = map.createStaticLayer("Obstacles", "tiles");
    this.obstacleLayer.setCollision(197, true);
    this.obstacleLayer.setVisible(false);
    this.obstacleLayer.setScale(this.zoomLevel, this.zoomLevel);

    this.decorationLayer = map.createStaticLayer("Decoration", "tiles");
    this.decorationLayer.setVisible(true);
    this.decorationLayer.setScale(this.zoomLevel, this.zoomLevel);

    this.toiLayer = map.createStaticLayer("TilesOfInterest", "tiles");
    this.toiLayer.setScale(this.zoomLevel, this.zoomLevel);
    this.toiLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (tile.index != -1) {
        if (tile.index === 80) {
          console.log("Monolith at: ", tile.x, tile.y);
          ludumDareMonolithLocations.push(
            new Phaser.Math.Vector2(tile.x * tile.width * this.zoomLevel, tile.y * tile.height * this.zoomLevel)
          );
          tile.index = -1;
        } else if (tile.index === 86) {
          console.log("Player at: ", tile.x, tile.y);
          this.player.x = tile.x * tile.width * this.zoomLevel;
          this.player.y = tile.y * tile.height * this.zoomLevel;
          tile.index = -1;
        }
      }
    });

    var monolithIndex = 0;

    LudumDareGames.forEach((item) => {
      const gameItem = this.physics.add
        .staticSprite(
          ludumDareMonolithLocations[monolithIndex].x + 8 * this.zoomLevel,
          ludumDareMonolithLocations[monolithIndex].y + 8 * this.zoomLevel,
          "sign"
        )
        .setName(item.name)
        .setData(item)
        .setScale(this.zoomLevel, this.zoomLevel);

      monolithIndex++;
      this.gameItems.add(gameItem);
    });

    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setRoundPixels(true);

    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer) => {
        console.log("down");
        console.log("Scroll: ", this.cameras.main.scrollX, this.cameras.main.scrollY);

        this.moveTarget.setPosition(
          pointer.position.x / this.cameras.main.zoom + this.cameras.main.scrollX,
          pointer.position.y / this.cameras.main.zoom + this.cameras.main.scrollY
        );
        this.moveTarget.setActive(true);
        this.moveTarget.setVisible(true);
        this.player.play("walk", true);

        console.log("Clicked in: ", pointer.position);
      },
      this
    );
  }

  update(time: number, delta: number) {
    this.player.setVelocity(0, 0);

    this.waterFrame += delta / 100;
    this.waterFrame = Phaser.Math.Wrap(this.waterFrame, 0, 14);
    this.water.setFrame(Math.round(this.waterFrame));

    if (this.cursors.left!.isDown) {
      this.player.setFlipX(false);
      this.player.play("walk", true);
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right!.isDown) {
      this.player.setFlipX(true);
      this.player.play("walk", true);
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up!.isDown) {
      this.player.play("walk", true);
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down!.isDown) {
      this.player.play("walk", true);
      this.player.setVelocityY(this.playerSpeed);
    }

    if (this.moveTarget.active) {
      this.physics.moveTo(this.player, this.moveTarget.x, this.moveTarget.y, this.playerSpeed);
      this.player.play("walk", true);

      if (this.moveTarget.x > this.player.x) {
        this.player.setFlipX(true);
      } else {
        this.player.setFlipX(false);
      }
    } else {
      if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
        this.player.play("idle", true);
      }
    }

    if (
      this.moveTarget.active &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, this.moveTarget.x, this.moveTarget.y) < 5
    ) {
      this.player.body.stop();
      this.moveTarget.setActive(false);
      this.moveTarget.setVisible(false);
      this.player.play("idle", true);
      this.player.debugShowVelocity = true;
    }

    this.physics.world.collide(this.player, this.obstacle);
    this.physics.world.collide(this.player, this.gameItems, this.showData);
    this.physics.world.collide(this.player, this.obstacleLayer);
    this.physics.world.overlap(this.player, this.decorationLayer);

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

  createAnimations() {
    const spellConfig: Phaser.Types.Animations.Animation = {
      key: "spellwobble",
      frames: this.anims.generateFrameNames("spell"),
      repeat: -1,
    };

    const walkConfig: Phaser.Types.Animations.Animation = {
      key: "walk",
      frames: this.anims.generateFrameNames("goblin-knight", {
        start: 0,
        end: 2,
      }),
      yoyo: true,
      frameRate: 10,
      repeat: -1,
    };

    const idleConfig: Phaser.Types.Animations.Animation = {
      key: "idle",
      frames: this.anims.generateFrameNames("goblin-knight", {
        start: 1,
        end: 2,
      }),
      yoyo: true,
      frameRate: 1,
      repeat: -1,
    };

    const waterConfig: Phaser.Types.Animations.Animation = {
      key: "water",
      frames: this.anims.generateFrameNames("water"),
      repeat: -1,
    };

    this.anims.create(spellConfig);
    this.anims.create(walkConfig);
    this.anims.create(idleConfig);
    this.anims.create(waterConfig);
  }
}
