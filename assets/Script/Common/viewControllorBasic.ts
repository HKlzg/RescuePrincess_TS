
const { ccclass, property } = cc._decorator;
import ArrowsService from "../Common/Arrow/arrowsService";
import PlayerService from "../Common/Player/playerService";
import toolsBasics from "../Tools/toolsBasics";
import settingBasic from "../Setting/settingBasic";

const leveList = settingBasic.setting.level

@ccclass
export abstract class ViewControllorBasic extends cc.Component {

    @property(cc.Prefab)
    public arrowPrefab: cc.Prefab = null;

    @property(cc.Node)
    public playerArea: cc.Node = null;

    @property(cc.AudioSource)
    public bgmAS: cc.AudioSource = null;

    @property(cc.Node)
    public textNode: cc.Node = null;

    @property({ type: cc.Enum(leveList), displayName: "关卡设定" })
    public level = leveList.lv1;

    arrowsService: ArrowsService = null;
    playerService: PlayerService = null;

    public toolsBasics = toolsBasics;
    public settingBasic = settingBasic;
    public stateType = settingBasic.setting.stateType;

    public stepList:Array<string> = [];
    onLoad() {
        console.log("=========SCENE: " + this.level + " ==========")
        //加载子包资源
        this.loadSubPackageDefualt();

        //开启物理系统 ----------必须写在onLoad 里面
        cc.director.getPhysicsManager().enabled = true;

        // //开启碰撞检测
        cc.director.getCollisionManager().enabled = true;

        this.arrowsService = new ArrowsService(this);
        this.playerService = new PlayerService(this);

        this.node.on(cc.Node.EventType.TOUCH_START, this.arrowsService.touchStart, this.arrowsService);
        this.node.on(cc.Node.EventType.TOUCH_END, this.arrowsService.touchEnd, this.arrowsService);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.arrowsService.touchMove, this.arrowsService);
        //初始化动作 播放Player动画

        this.node.on(cc.Node.EventType.TOUCH_START, this.playerService.touchStart, this.playerService);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.playerService.touchMove, this.playerService);
        this.node.on(cc.Node.EventType.TOUCH_END, this.playerService.touchEnd, this.playerService);

        // 自定义事件 控制游戏状态
        this.node.on(settingBasic.gameEvent.gameStateEvent, this.changeGameState, this);
        this.node.on(settingBasic.gameEvent.gameStepEvent, this.gameStep, this);
        this.node.on(settingBasic.gameEvent.gameMoveStep, this.moveStep, this);
        this.node.on(settingBasic.gameEvent.setCurrGameStep, this.setCurrGameStep, this);

        //Bgm
        cc.audioEngine.play(this.bgmAS.clip, true, 1);


    };

    start() {
        cc.view.getDesignResolutionSize();
        cc.view.getFrameSize();
        // let winSiz     e = cc.director.getWinSize();
        // let winSizePixels = cc.director.getWinSizeInPixels();

        this.node.emit(settingBasic.gameEvent.gameStateEvent, this.stateType.START);
    };

    update(dt) {
        this.arrowsService.toUpdate(dt);
    };

    loadSubPackageDefualt() {
        //加载资源 子包
        cc.loader.downloader.loadSubpackage('Audio', function (err) {
            if (err) {
                return console.error("----Audio---------" + err);
            }
        });
        //加载资源 子包
        cc.loader.downloader.loadSubpackage('Picture', function (err) {
            if (err) {
                return console.error("----Picture---------" + err);
            }
        });

        this.loadSubPackage();
    };
    //子类实现之后 加载额外的子包
    abstract loadSubPackage();


    //更改当前游戏状态
    changeGameState(state) {
        settingBasic.game.State = state;
        // console.log("================state="+state);
        switch (state) {
            case this.stateType.START:
                console.log("==========GAME START==========")
                break;
            case this.stateType.NEXT:
                //切换到下一个场景
                let nextLevel = this.level + 1;
                if (settingBasic.setting.level[nextLevel]) {
                    settingBasic.game.currLevel = nextLevel;
                } else {
                    settingBasic.game.currLevel = -1; //通关
                }
                cc.director.loadScene("loading")
                break;
            case this.stateType.PAUSE:

                break;
            case this.stateType.RESUME:

                break;
            case this.stateType.OVER:
                console.log("==========GAME OVER==========")
                
                this.playerArea.getChildByName("Bow").
                    getChildByName("Player").
                    getComponent(cc.Animation).stop();

                //注销事件
                this.node.off(cc.Node.EventType.TOUCH_START, this.arrowsService.touchStart, this.arrowsService);
                this.node.off(cc.Node.EventType.TOUCH_END, this.arrowsService.touchEnd, this.arrowsService);
                this.node.off(cc.Node.EventType.TOUCH_MOVE, this.arrowsService.touchMove, this.arrowsService);

                this.node.off(cc.Node.EventType.TOUCH_START, this.playerService.touchStart, this.playerService);
                this.node.off(cc.Node.EventType.TOUCH_MOVE, this.playerService.touchMove, this.playerService);
                this.node.off(cc.Node.EventType.TOUCH_END, this.playerService.touchEnd, this.playerService);

                break;
            default:
                break;
        }
    }
    //记录当前移动的
    setCurrGameStep(step:string){
        this.stepList.push(step);
    };
    //开启游戏机关 步骤
    abstract gameStep(setp:string);
    //人物移动步骤
    abstract moveStep(setp:number);

     //检测是否包含 步骤
     isContainsStep(step: string): boolean {
        // console.log("============stepList =" + this.stepList.toString()+"   step="+step);
        for (let index = 0; index < this.stepList.length; index++) {
            if (this.stepList[index] == step) {
                return true;
            }
        }
        return false;
    }
}
