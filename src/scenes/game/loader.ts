export const loadImages = (scene: Phaser.Scene) => {
  scene.load.image("footprints", "assets/images/footprints.png");
  scene.load.image("sign", "assets/images/sign.png");
  scene.load.image("box", "assets/images/box.png");
  scene.load.image("box2", "assets/images/box2.png");
};

export const loadSpriteSheets = (scene: Phaser.Scene, tileSize: number) => {
  scene.load.spritesheet("goblin-knight", "assets/images/goblin-knight.png", {
    frameWidth: 32,
    frameHeight: 32,
    endFrame: 3,
  });

  scene.load.spritesheet("spell", "assets/images/spell.png", {
    frameWidth: 11,
    frameHeight: 12,
  });

  scene.load.spritesheet("water", "assets/water.png", {
    frameWidth: tileSize / 2,
    frameHeight: tileSize / 2,
  });

  scene.load.spritesheet("tiles", "assets/tilemap_packed_extruded_2x.png", {
    frameWidth: tileSize,
    frameHeight: tileSize,
  });

  scene.load.spritesheet("target", "assets/images/target.png", {
    frameWidth: tileSize,
    frameHeight: tileSize,
  });
};

export const createAnimations = (scene: Phaser.Scene) => {
  const spellConfig: Phaser.Types.Animations.Animation = {
    key: "spellwobble",
    frames: scene.anims.generateFrameNames("spell"),
    repeat: -1,
  };

  const walkConfig: Phaser.Types.Animations.Animation = {
    key: "walk",
    frames: scene.anims.generateFrameNames("goblin-knight", {
      start: 0,
      end: 2,
    }),
    yoyo: true,
    frameRate: 10,
    repeat: -1,
  };

  const idleConfig: Phaser.Types.Animations.Animation = {
    key: "idle",
    frames: scene.anims.generateFrameNames("goblin-knight", {
      frames: [1, 1, 1, 1, 2],
    }),
    yoyo: true,
    frameRate: 1,
    repeat: -1,
  };

  const waterConfig: Phaser.Types.Animations.Animation = {
    key: "water",
    frames: scene.anims.generateFrameNames("water"),
    repeat: -1,
  };

  const targetConfig: Phaser.Types.Animations.Animation = {
    key: "targetpulse",
    frames: scene.anims.generateFrameNames("target"),
    repeat: -1,
    frameRate: 10,
  };

  scene.anims.create(spellConfig);
  scene.anims.create(walkConfig);
  scene.anims.create(idleConfig);
  scene.anims.create(waterConfig);
  scene.anims.create(targetConfig);
};
