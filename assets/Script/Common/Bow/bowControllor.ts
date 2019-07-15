import settingBasic from "../../Setting/settingBasic";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BowControllor extends cc.Component {

    @property(cc.Node)
    leftNode: cc.Node = null;
    @property(cc.Node)
    midNode: cc.Node = null;
    @property(cc.Node)
    rightNode: cc.Node = null;

    midPosHeight: number = 0;
    leftGrap: cc.Graphics = null;
    isDrawLine: boolean = true;
    onLoad() {
        //设定弦最大拉伸值
        this.midPosHeight = 0;
        this.leftGrap = this.leftNode.getComponent(cc.Graphics);
        this.node.on(settingBasic.gameEvent.setBowsSring,this.refreshMidH,this);
    }
    start() {

    }

    createLine() {
        //清除
        this.leftGrap.clear();
        //相对于Bow的左下角为原点的 坐标
        this.leftGrap.moveTo(5, 0);
        this.leftGrap.lineTo((this.node.width - 15) / 2, this.midPosHeight);
        this.leftGrap.lineTo(this.node.width - 15, 0);
        this.leftGrap.stroke();
    }
    refreshMidH(h) {
        if (this.midPosHeight != h) {
            this.midPosHeight = h;
            this.isDrawLine = true;
        }
    }
    getMidH() {
        return this.midPosHeight;
    }
    update() {
        //刷新弦的状态
        if (this.isDrawLine) {
            this.createLine()
            this.isDrawLine = false;
        }
    }

}
