import settingBasic from "../../Setting/settingBasic";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArrowsControllor extends cc.Component {

    //序号
    index: number = 0;
    initAnger: number = 0; //初始角度
    initAngularVelocity: number = 0;
    initVelY: number = 0;
    //
    rigidBody: cc.RigidBody = null;
    collider: cc.PhysicsBoxCollider = null;

    turnVel: number = 0;//模型缩小的速度
    offsetY: number = 0; //y坐标偏移量
    initY: number = 0;
    groundNode: cc.Node = null;
    collideNum: number = 0; //设定箭碰撞绳子的有效次数

    //原始size
    originWidth: number = 0;
    originLength: number = 0;
    isTurn: boolean = false;
    onLoad() {
        this.rigidBody = this.node.getComponent(cc.RigidBody);
        this.collider = this.node.getComponent(cc.PhysicsBoxCollider);
        this.turnVel = 0;
        this.offsetY = 0;
        this.initY = this.node.y;
        this.collideNum = 1;

        this.node.on(settingBasic.gameEvent.setArrowOffset, this.setOffsetY, this)
        this.node.on(settingBasic.gameEvent.setArrowPropertys, this.setPropertys, this)
    };

    start() {
 
    };

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve(contact, selfCollider, otherCollider) {



        switch (otherCollider.node.groupIndex) {
            case 1: //rope
                let ropeJoint = otherCollider.node.getComponent(cc.RevoluteJoint);
                //当次箭的有效碰撞>1时
                if (this.collideNum > 0) {
                    this.collideNum--;
                    ropeJoint ? ropeJoint.enabled = false : null;

                    let audioAS = otherCollider.node.getComponent(cc.AudioSource);
                    cc.audioEngine.play(audioAS.clip, false, 1)
                }
                break;
            default:
                break;
        }

    };

    update(dt) {

        if (this.rigidBody.type == cc.RigidBodyType.Dynamic) {

            //******************* 1 ***************** */
            // this.rigidBody.angularDamping = -1;

            // //更改node大小  ---同时更改collider 大小
            // this.turnVel = Math.abs(this.initVelY * 0.01);//翻转速度

            // if (this.node.width >= 15) {
            //     this.node.width -= this.turnVel * dt;
            //     let colliderW = this.collider.size.width;
            //     colliderW -= this.turnVel / 5 * dt;
            //     this.collider.size.width = colliderW <= 2 ? 2 : colliderW;
            // }
            // //
            // if (this.node.height >= - this.originLength * 0.5) {
            //     this.node.height -= (this.originLength / this.originWidth) * this.turnVel * dt;
            //     this.collider.size.height = Math.abs(this.node.height);

            //     if (!this.isTurn && this.rigidBody.linearVelocity.y < 0) {
            //     this.node.rotation = -this.node.rotation
            //     this.isTurn = true;
            // }
            // } 

            // this.collider.apply();
            //******************* 1 ***************** */



            //******************* 2 ***************** */
            // let size: { w: number, h: number } = this.changeLength(this.rigidBody.linearVelocity.y)
            // this.node.width = size.w;
            // this.node.height = size.h;

            // // this.node.scaleY = this.rigidBody.linearVelocity.y >= 0 ? 1 : -1;
            // if (this.rigidBody.linearVelocity.y == 0) this.node.rotation = -this.node.rotation

            // this.collider.size.width = this.node.width;
            // this.collider.size.height = this.node.height;

            // if (!this.isTurn && this.rigidBody.linearVelocity.y <=0) {
            //     // this.node.scaleY = -1;
            //     this.node.rotation = -this.node.rotation
            //     this.node.runAction(cc.rotateTo(1, 180 - this.node.rotation))
            //     this.isTurn = true;
            // }

            //******************* 2 ***************** */

            //******************* 3***************** */
            if (!this.isTurn && this.rigidBody.linearVelocity.y <= this.initVelY * 0.2) {

                let time = Math.abs(this.initAnger / 90) + 0.6;
                this.node.runAction(cc.rotateTo(time, 180 - this.node.rotation))
                // this.node.scaleY = -1;
                // console.log("====================time =" + time)
                this.isTurn = true;

            }
            //******************* 3***************** */
        }

        //******显示随弦拉伸的动作
        if (this.rigidBody.type == cc.RigidBodyType.Static) {
            this.node.y = this.initY + this.offsetY;
        }



    };

    changeLength(currV): { w: number, h: number } {
        //根据当前速度计算出变化的长度
        let len = Math.abs(currV / this.initVelY) * this.originLength;
        let width = Math.abs(currV / this.initVelY) * this.originWidth;

        return { w: width <= 10 ? 10 : width, h: len };
    }



    setPropertys(msg) {
        this.index = msg.index;
        this.initAnger = msg.initAnger;
        this.initAngularVelocity = msg.initAngularVelocity;
        this.initVelY = msg.initVelocity.y;
        // console.log("=== initVelY === "+this.initVelY+"  rat="+this.node.rotation);

        this.originWidth = this.node.width;
        this.originLength = this.node.height;

    }
    //设置箭的拉动距离
    setOffsetY(h) {
        this.offsetY = h;

    };
    onDestroy() {
        // console.log("========"+this.index+"=====arrow onDestroy===========");
    };

}
