var v;
// v.l2d.models
$(document).ready(() => {
    v = new Viewer('model');
});


const onSpeaking = () => {
    v.speaking();
}

const stopSpeaking = () => {
    v.stopSpeaking();
}

class Viewer {
    constructor(basePath) {
        this.l2d = new L2D(basePath);
        this.canvas = $(".Canvas");
        this.selectCharacter = $(".selectCharacter");
        this.selectAnimation = $(".selectAnimation");
        let queryString = window.location.search.substring(1);
        this.l2d.load(queryString, this);
        console.log(charData);

        this.app = new PIXI.Application(1280, 720, { backgroundColor: 0x636363 });
        let width = window.innerWidth;
        // let height = (width / 16.0) * 9.0;
        let height = window.innerHeight;
        this.app.view.style.width = width + "px";
        this.app.view.style.height = height + "px";
        this.app.renderer.resize(width, height);
        this.canvas.html(this.app.view);

        this.app.ticker.add((deltaTime) => {
            if (!this.model) {
                return;
            }
            this.model.update(deltaTime);
            this.model.masks.update(this.app.renderer);
            // this.model.rotation -= 0.01 * deltaTime;
        });
        window.onresize = (event) => {
            if (event === void 0) { event = null; }
            let width = window.innerWidth;
            // let height = (width / 16.0) * 9.0;
            let height = window.innerHeight

            this.app.view.style.width = width + "px";
            this.app.view.style.height = height + "px";
            this.app.renderer.resize(width, height);

            if (this.model) {
                // console.log(window.innerWidth);
                // console.log(window.innerWidth);
                // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                // if (isMobile) {
                //     console.log('isMobile');
                //     this.model.position = new PIXI.Point((width * 0.5), (height * 0.5));
                //     this.model.scale = new PIXI.Point((this.model.position.x * 2.5), (this.model.position.x * 2.5));
                //     this.model.masks.resize(this.app.view.width, this.app.view.height);
                // } else {
                //     console.log('isDesktop');

                //     this.model.position = new PIXI.Point((width * 0.5), (height * 0.4));
                //     this.model.scale = new PIXI.Point((this.model.position.x * 1.2), (this.model.position.x * 1.2));
                //     this.model.masks.resize(this.app.view.width, this.app.view.height);
                // }
                this.model.position = new PIXI.Point((width * 0.5), (height * 0.5));
                this.model.scale = new PIXI.Point((this.model.position.x * 2.5), (this.model.position.x * 2.5));
                this.model.masks.resize(this.app.view.width, this.app.view.height);
            }



            if (this.model.height <= 200) {
                this.model.scale = new PIXI.Point((this.model.position.x * 0.6), (this.model.position.x * 0.6));
            }
        };
        this.isClick = false;
        this.app.view.addEventListener('mousedown', (event) => {
            this.isClick = true;
        });
        this.app.view.addEventListener('touchstart', (event) => {
            this.isClick = true;
        });
        this.app.view.addEventListener('mousemove', (event) => {
            if (this.isClick) {
                this.isClick = false;
                if (this.model) {
                    this.model.inDrag = true;
                }
            }

            if (this.model) {
                let mouse_x = this.model.position.x - event.offsetX;
                let mouse_y = this.model.position.y - event.offsetY;
                this.model.pointerX = -mouse_x / this.app.view.height;
                this.model.pointerY = -mouse_y / this.app.view.width;
            }
        });
        this.app.view.addEventListener('touchmove', (event) => {
            event.preventDefault(); // ngăn chặn cuộn trang
            if (this.isClick) {
                this.isClick = false;
                if (this.model) {
                    this.model.inDrag = true;
                }
            }

            if (this.model && event.touches[0]) { // sử dụng touch thứ nhất
                let touch_x = this.model.position.x - event.touches[0].pageX;
                let touch_y = this.model.position.y - event.touches[0].pageY;
                this.model.pointerX = -touch_x / this.app.view.height;
                this.model.pointerY = -touch_y / this.app.view.width;
            }
        });


        this.app.view.addEventListener('mouseup', (event) => {
            if (!this.model) {
                return;
            }
            const x = event.offsetX
            const y = event.offsetY
            if (this.isClick) {
                if (this.isHit('head', event.offsetX, event.offsetY)) {
                    this.startAnimation("Touch_Mouth", "base");
                }
                else {
                    const bodyMotions = ["Touch_Body", "Touch_Hand"];
                    let currentMotion = bodyMotions[Math.floor(Math.random() * bodyMotions.length)];
                    this.startAnimation(currentMotion, "base");
                }
            }
            this.isClick = false;
            this.model.inDrag = false;

        });

        this.app.view.addEventListener('touchend', (event) => {
            if (!this.model) {
                return;
            }
            const x = event.changedTouches[0].pageX
            const y = event.changedTouches[0].pageY
            if (this.isClick) {
                if (this.isHit('head', x, y)) {
                    this.startAnimation("Touch_Mouth", "base");
                }
                else {
                    const bodyMotions = ["Touch_Body", "Touch_Hand"];
                    let currentMotion = bodyMotions[Math.floor(Math.random() * bodyMotions.length)];
                    this.startAnimation(currentMotion, "base");
                    console.log(Touch_body);
                }
            }
            this.isClick = false;
            this.model.inDrag = false;
        });


    }

    changeCanvas(model) {
        this.app.stage.removeChildren();

        this.selectAnimation.empty();
        model.motions.forEach((value, key) => {
            if (key != "effect") {
                let btn = document.createElement("button");
                let label = document.createTextNode(key);
                btn.appendChild(label);
                btn.className = "btn btn-secondary";
                btn.addEventListener("click", () => {
                    this.startAnimation(key, "base");
                });
                this.selectAnimation.append(btn);
            }
        });

        this.model = model;
        this.model.update = this.onUpdate; // HACK: use hacked update fn for drag support
        this.model.animator.addLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);

        this.app.stage.addChild(this.model);
        this.app.stage.addChild(this.model.masks);

        window.onresize();
    }

    onUpdate(delta) {
        let deltaTime = 0.016 * delta;

        if (!this.animator.isPlaying) {
            let m = this.motions.get("Idle");
            this.animator.getLayer("base").play(m);
        }
        this._animator.updateAndEvaluate(deltaTime);
        if (this.inDrag) {
            this.addParameterValueById("ParamAngleX", this.pointerX * 30);
            this.addParameterValueById("ParamAngleY", -this.pointerY * 30);
            this.addParameterValueById("ParamBodyAngleX", this.pointerX * 10);
            this.addParameterValueById("ParamBodyAngleY", -this.pointerY * 10);
            this.addParameterValueById("ParamEyeBallX", this.pointerX);
            this.addParameterValueById("ParamEyeBallY", -this.pointerY);
        }

        if (this._physicsRig) {
            this._physicsRig.updateAndEvaluate(deltaTime);
        }

        this._coreModel.update();

        let sort = false;
        for (let m = 0; m < this._meshes.length; ++m) {
            this._meshes[m].alpha = this._coreModel.drawables.opacities[m];
            this._meshes[m].visible = Live2DCubismCore.Utils.hasIsVisibleBit(this._coreModel.drawables.dynamicFlags[m]);
            if (Live2DCubismCore.Utils.hasVertexPositionsDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
                this._meshes[m].vertices = this._coreModel.drawables.vertexPositions[m];
                this._meshes[m].dirtyVertex = true;
            }
            if (Live2DCubismCore.Utils.hasRenderOrderDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
                sort = true;
            }
        }

        if (sort) {
            this.children.sort((a, b) => {
                let aIndex = this._meshes.indexOf(a);
                let bIndex = this._meshes.indexOf(b);
                let aRenderOrder = this._coreModel.drawables.renderOrders[aIndex];
                let bRenderOrder = this._coreModel.drawables.renderOrders[bIndex];

                return aRenderOrder - bRenderOrder;
            });
        }

        this._coreModel.drawables.resetDynamicFlags();
    }

    startAnimation(motionId, layerId) {
        if (!this.model) {
            return;
        }

        let m = this.model.motions.get(motionId);
        if (!m) {
            return;
        }
        m.loop = false

        let l = this.model.animator.getLayer(layerId);
        if (!l) {
            return;
        }

        l.play(m);

    }

    speaking() {
        let m = this.model.motions.get('Touch_Mouth');
        if (!m) {
            return;
        }
        let l = this.model.animator.getLayer('base');
        if (!l) {
            return;
        }
        l.play(m);
    }

    stopSpeaking() {
        let m = this.model.motions.get('Idle');
        if (!m) {
            return;
        }
        let l = this.model.animator.getLayer('base');
        if (!l) {
            return;
        }
        l.play(m);
    }

    isHit(id, posX, posY) {
        if (!this.model) {
            return false;
        }

        let m = this.model.getModelMeshById(id);
        // console.log(m);
        if (!m) {
            return false;
        }

        const vertexOffset = 0;
        const vertexStep = 2;
        const vertices = m.vertices;
        let left = vertices[0];
        let right = vertices[0];
        let top = vertices[1];
        let bottom = vertices[1];

        for (let i = 1; i < 4; ++i) {
            let x = vertices[vertexOffset + i * vertexStep];
            let y = vertices[vertexOffset + i * vertexStep + 1];

            if (x < left) {
                left = x;
            }
            if (x > right) {
                right = x;
            }
            if (y < top) {
                top = y;
            }
            if (y > bottom) {
                bottom = y;
            }
        }

        let mouse_x = m.worldTransform.tx - posX;
        let mouse_y = m.worldTransform.ty - posY;
        let tx = -mouse_x / m.worldTransform.a;
        let ty = -mouse_y / m.worldTransform.d;
        let kq = ((left <= tx) && (tx <= right) && (top <= ty) && (ty <= bottom))
        return kq
    }


}