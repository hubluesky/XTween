import { CCObject, Node, Renderable2D, System, director, Director } from "cc";
import { EDITOR } from "cc/env";
import { XTween } from "./XTween";

declare module "cc" {
    interface Renderable2D {
        colorR: number;
        colorG: number;
        colorB: number;
        colorA: number;
    }

    interface Node {
        positionX: number;
        positionY: number;
        positionZ: number;
        worldPositionX: number;
        worldPositionY: number;
        worldPositionZ: number;
        eulerAngleX: number;
        eulerAngleY: number;
        eulerAngleZ: number;
        scaleX: number;
        scaleY: number;
        scaleZ: number;
        scaleXYZ: number;
    }
}

Object.defineProperties(Renderable2D.prototype, {
    "colorR": {
        get: function () { return this.color.r; },
        set: function (v) {
            if (this.color.r == v) return;
            this.color.r = v;
            this._colorDirty = true;
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
    "colorG": {
        get: function () { return this.color.g; },
        set: function (v) {
            if (this.color.g == v) return;
            this.color.g = v;
            this._colorDirty = true;
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
    "colorB": {
        get: function () { return this.color.b; },
        set: function (v) {
            if (this.color.b == v) return;
            this.color.b = v;
            this._colorDirty = true;
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
    "colorA": {
        get: function () { return this.color.a; },
        set: function (v) {
            if (this.color.a == v) return;
            this.color.a = v;
            this._colorDirty = true;
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
});

Object.defineProperties(Node.prototype, {
    positionX: {
        get: function () { return this.position.x; },
        set: function (v) {
            if (this.position.x == v) return;
            this.setPosition(v);
        },
        enumerable: true,
        configurable: true
    },
    positionY: {
        get: function () { return this.position.y; },
        set: function (v) {
            if (this.position.y == v) return;
            this.position.y = v;
            this.setPosition(this.position);
        },
        enumerable: true,
        configurable: true
    },
    positionZ: {
        get: function () { return this.position.z; },
        set: function (v) {
            if (this.position.z == v) return;
            this.position.z = v;
            this.setPosition(this.position);
        },
        enumerable: true,
        configurable: true
    },
    worldPositionX: {
        get: function () { return this.worldPosition.x; },
        set: function (v) {
            if (this.worldPosition.x == v) return;
            this.worldPosition.x = v;
            this.setWorldPosition(this.worldPosition);
        },
        enumerable: true,
        configurable: true
    },
    worldPositionY: {
        get: function () { return this.worldPosition.y; },
        set: function (v) {
            if (this.worldPosition.y == v) return;
            this.worldPosition.y = v;
            this.setWorldPosition(this.worldPosition);
        },
        enumerable: true,
        configurable: true
    },
    worldPositionZ: {
        get: function () { return this.worldPosition.z; },
        set: function (v) {
            if (this.worldPosition.z == v) return;
            this.worldPosition.z = v;
            this.setWorldPosition(this.worldPosition);
        },
        enumerable: true,
        configurable: true
    },
    eulerAngleX: {
        get: function () { return this.eulerAngles.x; },
        set: function (v) {
            if (this.eulerAngles.x == v) return;
            this.eulerAngles.x = v;
            this.setRotationFromEuler(this.eulerAngles);
        },
        enumerable: true,
        configurable: true
    },
    eulerAngleY: {
        get: function () { return this.eulerAngles.y; },
        set: function (v) {
            if (this.eulerAngles.y == v) return;
            this.eulerAngles.y = v;
            this.setRotationFromEuler(this.eulerAngles);
        },
        enumerable: true,
        configurable: true
    },
    eulerAngleZ: {
        get: function () { return this.eulerAngles.z; },
        set: function (v) {
            if (this.eulerAngles.z == v) return;
            this.eulerAngles.z = v;
            this.setRotationFromEuler(this.eulerAngles);
        },
        enumerable: true,
        configurable: true
    },
    scaleX: {
        get: function () { return this.scale.x; },
        set: function (v) {
            if (this.scale.x == v) return;
            this.scale.x = v;
            this.setScale(this.scale);
        },
        enumerable: true,
        configurable: true
    },
    scaleY: {
        get: function () { return this.scale.y; },
        set: function (v) {
            if (this.scale.y == v) return;
            this.scale.y = v;
            this.setScale(this.scale);
        },
        enumerable: true,
        configurable: true
    },
    scaleZ: {
        get: function () { return this.scale.z; },
        set: function (v) {
            if (this.scale.z == v) return;
            this.scale.z = v;
            this.setScale(this.scale);
        },
        enumerable: true,
        configurable: true
    },
    scaleXYZ: {
        get: function () { return this.scale.x; },
        set: function (v) {
            this.setScale(v, v, v);
        },
        enumerable: true,
        configurable: true
    },
});

let oldUpdateActions = XTween.prototype._updateActions;
XTween.prototype._updateActions = function updateActions(deltaTime: number): boolean {
    if (this.target instanceof CCObject && !this.target.isValid) return true;
    return oldUpdateActions.call(this, deltaTime);
}

export class XTweenSystem extends System {
    static readonly ID = 'XTWEEN';
    update(dt: number) {
        XTween.updateTweens();
    }
}

director.on(Director.EVENT_INIT, () => {
    // console.log("XTween Director.EVENT_INIT");
    const sys = new XTweenSystem();
    director.registerSystem(XTweenSystem.ID, sys, System.Priority.MEDIUM);
});
// console.log("XTween Director.on");
