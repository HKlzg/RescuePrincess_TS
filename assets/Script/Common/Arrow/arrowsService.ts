
import { ViewControllorBasic } from "../viewControllorBasic"
import settingBasic from "../../Setting/settingBasic";
import toolsBasics from "../../Tools/toolsBasics";

export default class ArrowsService {

    //arrow 相关属性
    private currArrow: cc.Node = null; //预备的一支箭
    private arrowPool: cc.NodePool = null; //对象池
    private arrowBodies = []; //当前屏幕显示的所有箭
    private isShoot = false; //是否射出
    private strength = 0;  //发射力度
    private isPreArrow: boolean = false; //是否可以预备一支新箭
    private index: number = 0;  //箭矢序号
    private angMax = 0;//弓箭可以射出的最大角度
    private touchLoc: cc.Vec2 = null;
    //constructor 传入参数
    private arrowPrefab: cc.Prefab = null; //箭 预制资源
    private playerNode: cc.Node = null;  //player 节点
    private processNode: cc.Node = null; //蓄力条 辅助线
    private textNode: cc.Node = null;    //text Label
    private bowNode: cc.Node = null;     //弓

    //相关组件
    private progressBar: cc.ProgressBar = null; //蓄力条 lable
    private arrowText: cc.RichText = null;  //文字显示 lable
    private canvasNode: cc.Node = null;
    private containerNode: cc.Node = null;
    private playerSiblingIndex = 0; //playerArea 层叠序号

    //*****当前关卡 参数 */
    private arrowNumMax = 0;//箭的最大数量
    private level = null;
    public toolsBasics = null;
    public settingBasic = null;
    public stateType = null;

    constructor(viewCtr: ViewControllorBasic) {
        this.bowNode = viewCtr.playerArea.getChildByName("Bow");
        this.containerNode = viewCtr.node.getChildByName("Container");
        this.playerNode = this.bowNode.getChildByName("Player");
        this.processNode = this.bowNode.getChildByName("ProgressBar");

        this.level = viewCtr.level;
        this.stateType = viewCtr.stateType;
        this.arrowPrefab = viewCtr.arrowPrefab;
        this.textNode = viewCtr.textNode;

        //
        this.strength = 0;
        this.toolsBasics = toolsBasics;
        this.settingBasic = settingBasic;
        this.stateType = settingBasic.setting.stateType;
        this.angMax = this.settingBasic.setting.rotationMax;
        this.canvasNode = viewCtr.node;;
        this.playerSiblingIndex = viewCtr.playerArea.getSiblingIndex();
        this.arrowNumMax = this.settingBasic.fun.getArrowNumByLv(this.level);
        this.progressBar = this.processNode.getComponent(cc.ProgressBar);
        this.arrowText = this.textNode.getComponent(cc.RichText);
        this.arrowText.string = this.arrowNumMax + ""

        //初始化对象池
        this.createArrowPool()
    }

    /**
    *  event :TOUCH_START
    */
    touchStart(event) {

        if (this.settingBasic.game.State == this.stateType.OVER) return

        //开启蓄力
        this.isShoot = true;
        //--------赋值


        this.touchLoc = event.touch.getLocation();
        this.rotationBow();
    }

    /**lzg
     * 发射箭矢
     * event :TOUCH_END
    */
    touchEnd(event) {

        if (!this.isShoot || !this.currArrow) return;
        this.isShoot = false;

        this.touchLoc = event.touch.getLocation();

        let rigBody = this.currArrow.getComponent(cc.RigidBody);

        let worldPos = null;
        worldPos = rigBody.getWorldPosition(worldPos);
        this.currArrow.parent = this.canvasNode;

        this.currArrow.setSiblingIndex(this.playerSiblingIndex - 1);

        let angle = this.toolsBasics.getVectorRadians(worldPos.x, worldPos.y, this.touchLoc.x, this.touchLoc.y);


        if (Math.abs(angle) > this.angMax) {
            //限定初始速度的方向(-angMax <= angle <= angMax)
            this.touchLoc = angle > 0 ? cc.v2({ x: this.strength, y: this.strength }) : cc.v2({ x: -(this.strength), y: this.strength });
        }

        //向量差计算,结束点-开始点，向量的指向是朝着结束点 需要转换为世界坐标再计算
        let vec = cc.v2(this.touchLoc).sub(worldPos);

        //先归一化 向量长度为1 根据strength 计算初始速度和方向
        let velocity: cc.Vec2 = vec.normalizeSelf().mulSelf(this.strength);

        rigBody.type = cc.RigidBodyType.Dynamic;

        //设置总速度 (速度 和 方向)
        rigBody.linearVelocity = velocity;
        this.arrowBodies.push(this.currArrow);

        //设置可以预备一支新箭
        this.isPreArrow = true;

        //------清空蓄力条
        this.progressBar.progress = 0;
        this.bowNode.rotation = 0;
        this.strength = 0;
        this.bowNode.emit(settingBasic.gameEvent.setBowsSring, 0);
        this.index++;

        //显示计数
        this.arrowText.string = (this.arrowNumMax - this.index) + "";

        //--------记录射出时 初始数据，
        let ac = {};
        ac["index"] = this.index;
        ac["initAnger"] = angle;
        ac["initAngularVelocity"] = rigBody.angularVelocity;
        ac["initVelocity"] = velocity;
        this.currArrow.emit(settingBasic.gameEvent.setArrowPropertys, ac);

    }

    //蓄力
    storingStrength() {
        if (this.isShoot) {
            if (this.strength <= this.settingBasic.setting.strengthMax) {
                this.strength += this.settingBasic.setting.strengthStep
            }
            //更新进度条
            this.progressBar.progress = this.strength / this.settingBasic.setting.strengthMax;
            //更新弓弦的力度(Y偏移量)
            let offset = (this.strength / this.settingBasic.setting.strengthMax) * this.settingBasic.setting.chordMax;
            this.bowNode.emit(settingBasic.gameEvent.setBowsSring, offset);
            if (this.currArrow) {
                this.currArrow.emit(settingBasic.gameEvent.setArrowOffset, offset);
            }

        }
    }
    //移除arrow节点 //防止越界之后无法销毁
    removeArrow() {
        for (let i = 0; i < this.arrowBodies.length; i++) {
            let arrowNode = this.arrowBodies[i];
            if (arrowNode.getComponent(cc.RigidBody).getWorldPosition().y < -50) {
                // arrowNode.parent.removeChild(arrowNode);
                // arrowNode.destroy();
                //放回对象池 自动从父节点移除
                this.arrowPool.put(arrowNode);
                this.arrowBodies.splice(arrowNode);
            }
        }
    }

    /**
     * /在屏幕上目标节点区域内移动时 (不是移动玩家时)
     * Event :touch_Move
     *  */
    touchMove(event) {
        if (this.settingBasic.game.State == this.stateType.OVER) return

        this.touchLoc = event.touch.getLocation();
        this.rotationBow();

    }
    //用于外部调用
    toUpdate(dt) {
        this.storingStrength();
        this.removeArrow();

        if (!this.currArrow || this.isPreArrow) {

            //准备一支新箭
            let node = this.arrowPool.size() > 0 ? this.arrowPool.get() : cc.instantiate(this.arrowPrefab);
            node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
            node.scaleX = 1;
            node.scaleY = 1;
            this.bowNode.addChild(node);
            node.setSiblingIndex(0)
            this.currArrow = node;
            this.isPreArrow = false;
        }
        if (this.currArrow && this.playerNode) {
            // //将新产生的箭 跟随玩家移动
            this.currArrow.x = this.playerNode.x
            this.currArrow.rotation = 0;
        }

        //游戏失败
        if (this.arrowNumMax - this.index == 0) {
            this.canvasNode.emit(settingBasic.gameEvent.gameStateEvent, this.stateType.OVER);
        }
        // this.rotationBow();
    }

    rotationBow() {
        if (!this.touchLoc || !this.currArrow) return

        let arrowPos = this.currArrow.convertToWorldSpace(cc.v2(0, 0));
        //向量的角度计算，
        let angle = this.toolsBasics.getVectorRadians(arrowPos.x, arrowPos.y, this.touchLoc.x, this.touchLoc.y);
        //旋转弓角度
        let rotation = angle <= -this.angMax ? -this.angMax : (angle <= this.angMax ? angle : this.angMax);

        //更新bow 的角度
        this.bowNode.rotation = rotation;
        this.currArrow.rotation = 0;

        //辅助线
        this.processNode.rotation = -90;

    }

    createArrowPool() {
        this.arrowPool = new cc.NodePool();
        for (let index = 0; index < this.arrowNumMax; index++) {
            this.arrowPool.put(cc.instantiate(this.arrowPrefab));
        }
    }


}

