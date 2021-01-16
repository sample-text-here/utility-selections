new select("k", Items.titanium.color, (startX, startY, endX, endY) => {
  let build;
  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      build = Vars.world.build(x, y);
      if (!build) continue;
      if (build.block.hasItems) {
        build.items.clear();
      }
      if ("totalAmmo" in build) {
        build.totalAmmo = 0;
      }
    }
  }
});

new select("o", Items.plastanium.color, (startX, startY, endX, endY) => {
  let build;
  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      build = Vars.world.build(x, y);
      if (build) {
        build.health = build.block.health;
      }
    }
  }
});

new select("i", Items.sporePod.color, (startX, startY, endX, endY) => {
  let tile, floor;
  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      tile = Vars.world.tile(x, y);
      if (!tile) continue;
      floor = tile.floor();
      tile.setFloor(Blocks.space);
      tile.setFloor(floor);
    }
  }
  Events.fire(new WorldLoadEvent());
});

new select("l", Items.metaglass.color, (startX, startY, endX, endY) => {
  const block = Vars.control.input.block,
    team = Vars.player.team();
  if (!block) return;
  let tile;
  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      tile = Vars.world.tile(x, y);
      if (!tile) continue;
      if (tile.block() === Blocks.air) tile.setBlock(block, team);
    }
  }
});

new select("semicolon", Items.coal.color, (startX, startY, endX, endY) => {
  let tile;
  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      tile = Vars.world.tile(x, y);
      if (tile && tile.block().destructible) tile.setBlock(Blocks.air);
    }
  }
});

function select(bind, color, onSelect) {
  this.color = color.cpy();
  this.bcolor = color.cpy().sub(0.2, 0.2, 0.2, 0);
  this.startX = 0;
  this.startY = 0;
  this.clearing = false;
  this.bind = Packages.arc.input.KeyCode[bind];
  Events.run(Trigger.update, (e) => {
    if (!Vars.state.isPlaying()) return;
    if (Core.input.keyDown(this.bind)) {
      if (!this.clearing) {
        this.clearing = true;
        this.startX = mouseX();
        this.startY = mouseY();
      }
    } else {
      if (!this.clearing) return;
      this.clearing = false;
      let endX = mouseX();
      let endY = mouseY();
      if (endX < this.startX) {
        let tmp = this.startX;
        this.startX = endX;
        endX = tmp;
      }
      if (endY < this.startY) {
        let tmp = this.startY;
        this.startY = endY;
        endY = tmp;
      }

      onSelect(this.startX, this.startY, endX, endY);
    }
  });

  Events.run(Trigger.postDraw, (e) => {
    if (this.clearing) {
      Lines.stroke(1);
      const result = Placement.normalizeDrawArea(
        Blocks.air,
        this.startX,
        this.startY,
        mouseX(),
        mouseY(),
        false,
        100,
        1
      );

      Lines.stroke(2);

      Draw.color(this.bcolor);
      Lines.rect(
        result.x,
        result.y - 1,
        result.x2 - result.x,
        result.y2 - result.y
      );
      Draw.color(this.color);
      Lines.rect(
        result.x,
        result.y,
        result.x2 - result.x,
        result.y2 - result.y
      );
    }
  });

  function mouseX() {
    return Math.floor(Vars.player.mouseX / Vars.tilesize + 0.5);
  }

  function mouseY() {
    return Math.floor(Vars.player.mouseY / Vars.tilesize + 0.5);
  }
}
