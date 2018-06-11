cc.Class({
    extends: cc.Component,

    properties: {
        hero_img: {
            default: null,
            type: cc.Node
        },

        rect_old_img: {
            default: null,
            type: cc.Node
        },

        rect_new_img: {
            default: null,
            type: cc.Node
        },

        double_rect_img: {
            default: null,
            type: cc.Node
        },

        stick_pre: {
            default: null,
            type: cc.Prefab
        },

        score_label: {
            default: null,
            type: cc.Label
        },
    },

    onLoad () {
        this.bg = this.node.getChildByName("bg");
        this.score = 0;
        this.initWidth = cc.winSize.width * 0.2;
        this.initHeight = 250;
    },

    start () {
        this.initGame();
    },
    initGame:function () {
        this.createRect();
        this.touchFunc();
    },

    touchFunc:function () {
        var self = this;
        var len = self.hero_img.getBoundingBox().width;
        this.node.once(cc.Node.EventType.TOUCH_START, function (event) {
            self.getNewStick();
            self.newStick.runAction(cc.scaleBy(0.2, 1, 1.5).repeatForever());
        }, this)
        this.node.once(cc.Node.EventType.TOUCH_END, function (event) {
            self.newStick.stopAllActions();
            self.newStick.runAction(cc.sequence(
                cc.rotateTo(1, 90),
                cc.callFunc(function () {
                    var anima = self.hero_img.getChildByName("run_ani").getComponent(cc.Animation);
                    anima.play();
                    let stick_len = self.newStick.getBoundingBox().width;
                    self.hero_img.runAction(cc.sequence(
                        cc.moveBy(1, stick_len + len / 2 + 5, 0),
                        cc.callFunc(function () {
                            anima.stop();
                            let stick_len = self.newStick.getBoundingBox().width;
                            let dot_stick = self.newStick.parent.convertToWorldSpaceAR(cc.v2(stick_len + self.newStick.x, 0));
                            let rect = self.rect_new_img.getBoundingBoxToWorld();
                            let double_rect = self.double_rect_img.getBoundingBoxToWorld();
                            if (dot_stick.x >= rect.xMin && dot_stick.x <= rect.xMax) {
                                if (dot_stick.x >= double_rect.xMin && dot_stick.x <= double_rect.xMax) {
                                    self.addScore(2);
                                } else {
                                    self.addScore(1);
                                }
                                self.moveSucc();
                            }
                            else {
                                self.newStick.destroy();
                                self.hero_img.runAction(cc.sequence(
                                    cc.moveTo(0.5, cc.p(self.hero_img.x, 0)),
                                    cc.callFunc(function () {
                                        cc.sys.localStorage.setItem("CUR_SCORE", self.score);
                                        cc.director.loadScene('Start');
                                    })
                                ))
                            }
                        })
                        )
                    )
                })
            ))
        }, this);
    },

    randomXY: function (beforeDis) {
        var random1 = 0;
        var random2 = 0;
        while ((beforeDis + 1000 * (random1 + random2) / 100) > cc.winSize.width || random2 < 8
        || (random1 === 0 && random2 === 0)) {
            this.score = this.score >= 50 ? 50 : this.score;
            // 距离
            random1 = Math.random() * (100 - this.score) + this.score;
            // 本身宽度
            random2 = Math.abs(Math.random() * 100 - this.score);
        }
        return {dis: random1 * 10 + beforeDis, len: random2 * 10};
    },

    createRect: function () {
        var randomXY = this.randomXY(this.rect_old_img.x + this.rect_old_img.getBoundingBox().width / 2);
        this.rect_new_img.width = randomXY.len;
        this.rect_new_img.setPositionX(randomXY.dis + randomXY.len / 2);
        let double_img = this.bg.getChildByName("double_img");
        if (!double_img) {
            this.bg.addChild(this.double_rect_img);
        }
        this.double_rect_img.setPositionX(randomXY.dis + randomXY.len / 2);
    },

    moveSucc: function () {
        var self = this;
        this.newStick.destroy();
        this.double_rect_img.removeFromParent();

        this.rect_old_img.runAction(cc.moveTo(1, cc.p(-cc.winSize.width / 2, 0)))
        this.hero_img.runAction(cc.moveTo(1, cc.p(self.initWidth, self.initHeight)));
        this.rect_new_img.runAction(cc.sequence(
            cc.moveTo(1, cc.p(self.initWidth, 0)),
            cc.callFunc(function () {
                self.rect_old_img.width = self.rect_new_img.width;
                self.rect_old_img.runAction(cc.sequence(
                    cc.moveTo(0.01, cc.p(self.initWidth, 0)),
                    cc.callFunc(function () {
                        self.initGame();
                    })
                ));
            })
        ))
    },

    addScore: function (score) {
        if (score <= 0 || score > 2) {
            return;
        }
        this.score += score;
        this.score_label.string = this.score.toString();
    },

    getNewStick: function () {
        var len = this.hero_img.getBoundingBox().width;
        this.newStick = cc.instantiate(this.stick_pre);
        this.bg.addChild(this.newStick);
        this.newStick.setPositionX(this.rect_old_img.x + len / 2 + 5);
    },


});
