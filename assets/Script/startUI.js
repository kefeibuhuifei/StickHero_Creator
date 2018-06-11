cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        this.bg = this.node.getChildByName("bg");
        this.max_score_label = this.bg.getChildByName("max_score_label").getComponent(cc.Label);
        this.cur_score_label = this.bg.getChildByName("cur_score_label").getComponent(cc.Label);

        var max_score = cc.sys.localStorage.getItem("MAX_SCORE");
        var cur_score = cc.sys.localStorage.getItem("CUR_SCORE");
        if (!max_score) {
            max_score = 0;
        }
        if (!cur_score) {
            cur_score = 0;
        }

        if (cur_score > max_score) {
            max_score = cur_score;
            cc.sys.localStorage.setItem("MAX_SCORE", max_score);
        }

        this.max_score_label.string = "最高分："+max_score.toString();
        this.cur_score_label.string = cur_score.toString();

    },

    playGame:function () {
        cc.director.loadScene('PlayGame');
    },

});
