import {
  DEBUG, DEBUG_FPS,
  GRID_WIDTH,
  DIMENSION,
  SHADOW_X, SHADOW_Y
} from "../../cfg";
import { drawGrid } from "./grid";

/**
 * Rendering
 */
export function render() {

  this.update();

  this.sort();

  if (this.spriteQueue.length >= 1) {
    this.drawPixelText(
      "Loading" + "...",
      15, 30,
      20, 1.5);
    this.loadSprites(this.spriteQueue, () => window.rAF(() => this.render()));
    return void 0;
  }

  this.draw();

  if (DEBUG === true) {
    this.renderDebugScene();
    setTimeout(() => this.render(), 1E3 / DEBUG_FPS);
    return void 0;
  }

  window.rAF(() => this.render());

  return void 0;

}

/**
 * Draw
 */
export function draw() {

  this.clear();

  if (DEBUG === true) {
    drawGrid(
      this.context,
      this.camera.x, this.camera.y,
      this.width, this.height,
      this.dimension,
      this.scale,
      .05,
      "#FFF"
    );
  }

  this.renderMap();

  this.renderLayers();

  return void 0;

}

/**
 * Render map
 */
export function renderMap() {

  var map = null;

  if ((map = this.instance.maps["Town"]) === void 0) return void 0;
  if (map.buffers[1] === void 0) return void 0;

  this.context.drawImage(
    map.buffers[1].canvas,
    this.camera.x << 0,
    this.camera.y << 0,
    (map.width * this.dimension) * this.scale << 0,
    (map.height * this.dimension) * this.scale << 0
  );

  return void 0;

}

/**
 * Render layers
 */
export function renderLayers() {

  let ii = 0;
  let length = 0;

  length = this.layers.length;

  for (; ii < length; ++ii) {
    this.renderEntities(this.layers[ii].entities);
  };

  return void 0;

}

/**
 * Render entities
 * @param {Array} entities
 */
export function renderEntities(entities) {

  let entity = null;

  let ii = 0;
  let length = 0;

  length = entities.length;

  for (; ii < length; ++ii) {

    entity = entities[ii];
    entity.animate();
    entity.idleTime++;

    if (entity.texture !== null && entity.texture.hasLoaded === false) continue;
    if (!this.instance.camera.isInView(
      entity.x, entity.y,
      entity.width, entity.height
    )) continue;
    if (entity.opacity === .0) continue;

    this.renderEntity(entity);

  };

  return void 0;

}

/**
 * Render a single entity
 * @param  {Object} entity
 */
export function renderEntity(entity) {

  if (entity.texture === null) return void 0;

  let frameIndex = entity.getFrameIndex();

  let width  = entity.width  * this.scale;
  let height = entity.height * this.scale;

  let eWidth  = (entity.width  / entity.scale) * 2;
  let eHeight = (entity.height / entity.scale) * 2;

  let cX = ((DIMENSION / 2) * entity.scale) * this.scale;
  let cY = (DIMENSION * entity.scale) * this.scale;

  let x = (this.camera.x + entity.x * this.scale) - cX;
  let y = (this.camera.y + (entity.y + entity.z) * this.scale) - cY;

  let cOpacity = entity.customOpacity();

  if (cOpacity === true) {
    this.context.globalAlpha = entity.opacity;
  }

  /** Shadow */
  if (entity.hasShadow === true) {
    this.context.drawImage(
      /** Texture */
      entity.shadow.texture.canvas,
      /** Frame */
      (entity.frames[entity.frame] + frameIndex) * eWidth,
      eHeight * entity.shadowFacing(entity.facing),
      /** Scale */
      eWidth + (entity.shadow.scale.x * this.scale),
      eHeight + (entity.shadow.scale.y * this.scale),
      /** Position */
      x + (entity.shadow.position.x * this.scale) + (entity.shadow.scale.x * this.scale) << 0,
      y + (entity.shadow.position.y * this.scale) + (entity.shadow.scale.y * this.scale) + ((eHeight / 2 * entity.scale) * this.scale) << 0,
      /** Scretch */
      width / SHADOW_X << 0,
      height / SHADOW_Y << 0
    );
  }

  /** Sprite */
  this.context.drawImage(
    entity.texture.texture_effect.canvas,
    /** Frame */
    (entity.frames[entity.frame] + frameIndex) * eWidth,
    eHeight * entity.facing,
    /** Scale */
    eWidth, eHeight,
    x << 0, y << 0,
    width << 0, height << 0
  );

  /** Reset ctx opacity */
  if (cOpacity === true) {
    this.context.globalAlpha = 1.0;
  }

  return void 0;

}

/**
 * Draw pixel based text
 * @param {String} str
 * @param {Number} x
 * @param {Number} y
 * @param {Number} fontSize
 * @param {Number} lineWidth
 */
export function drawPixelText(str, x, y, fontSize, lineWidth) {

  this.context.font = fontSize + "px AdvoCut";
  this.context.strokeStyle = '#313131';
  this.context.lineWidth = lineWidth;
  this.context.strokeText(str, x, y);
  this.context.fillStyle = 'white';
  this.context.fillText(str, x, y);

  return void 0;

}