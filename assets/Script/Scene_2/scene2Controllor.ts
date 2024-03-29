import { ViewControllorBasic } from "../Common/viewControllorBasic";
import settingBasic from "../Setting/settingBasic";
const { ccclass, property } = cc._decorator;
@ccclass
export default class NewClass extends ViewControllorBasic {
    containerNode: cc.Node = null;
    ladderNode: cc.Node = null;
    brotherNode: cc.Node = null;
    start() {
        this.containerNode = this.node.getChildByName("Container");
        this.ladderNode = this.containerNode.getChildByName("Ladder");
        this.brotherNode = this.containerNode.getChildByName("Brother")
        
    }
    loadSubPackage() {

    }
    //开启 游戏机关 的步骤
    gameStep(step: string) {
        //防止一直触发相同 步骤
        if (step == this.stepList[this.stepList.length - 1]) return;
         this.stepList.push(step);

        switch (step) {

            case "0": //等待
                this.moveStep(0);
                break;
            case "1":
                //下面段梯子上升 
                this.ladderNode.emit(settingBasic.gameEvent.ladderActionEvent, 2);
                //向右行走
                this.moveStep(1);
                break;
            case "2":
                //上面梯子下落
                this.ladderNode.emit(settingBasic.gameEvent.ladderActionEvent, 1);
                //向上行走
                this.moveStep(2);
                break;


            default:
                break;
        }
    }
    //设置brother移动步骤
    moveStep(nextStep) {

        console.log("=========nextStep="+nextStep);
        let order: { direction: string, action: string } = { direction: "R", action: "WAIT" };

        switch (nextStep) {
            case 0://等待
                order = { direction: "R", action: "WAIT" };
                break;
            case 1: //向右走
                order = { direction: "R", action: "WALK" };

                break;
            case 2://向上爬
                //先检测是否开启了下面梯子的机关
                // console.log("=======moveStep=========" + nextStep + "  " + this.isContainsStep("1") + "  len=" + this.stepList.length)
                if (this.isContainsStep("1") && this.isContainsStep("2")) {
                    order = { direction: "U", action: "CLIMB" };
                }
                break;
            case 3://向右走
                order = { direction: "R", action: "WALK" };
                break;
            default:
                break;
        }
        this.brotherNode.emit(settingBasic.gameEvent.brotherActionEvent, order)
        //记录当前开启的机关步骤
        //this.setCurrGameStep(nextStep);

    }
   
}
