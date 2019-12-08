class State
{
  constructor(states){
    this.stateProvider = states;
  }
  enterState(){}
  exitState(){}
  executeState(){}
  sendStateMsg(msg)
  {
    if(msg){
      sendTo('telegram.0',msg);
    }
  }
  checkValues(){}
}

class isOnState extends State{
  enterState(){
    const enterMsg = 'Trockner wurde angeschaltet';
    this.sendStateMsg(enterMsg);
  }
  checkValues(values){
    const {oldState:{val:oldValue}} = values;
    const {newState:{val:newValue}} = values;
    if(newValue > 10)
      this.stateProvider.changeState(isDryingState);
    else if(newValue == 0)
      this.stateProvider.changeState(isOffState);
  }
}
class isOffState extends State{
  enterState(){
    const enterMsg = 'Trockner wurde ausgeschaltet';
    this.sendStateMsg(enterMsg);
  }
  checkValues(values){
    const {oldState:{val:oldValue}} = values;
    const {newState:{val:newValue}} = values;
    if( newValue > 0)
      this.stateProvider.changeState(isOnState);
  }
}
class isDryingState extends State{
  enterState(){
    const enterMsg = 'Trockner trocknet die wäsche!';
    this.sendStateMsg(enterMsg);
  }
  exitState(){
    const enterMsg = 'Trockner ist fertig und kann geleert werden.';
    this.sendStateMsg(enterMsg);
  }
  checkValues(values){
    const {oldState:{val:oldValue}} = values;
    const {newState:{val:newValue}} = values;
    if(newValue < 10 && newValue > 0)
      this.stateProvider.changeState(isPostRunState);
    else if(newValue == 0)
      this.stateProvider.changeState(isOffState);
  }
}
class isPostRunState extends State{
  constructor(states){
    super(states);
    this.MyTimer = undefined;
  }
  exitState(){
    if(this.MyTimer)
    {
      clearInterval(this.MyTimer);
      this.MyTimer = undefined;
    }
  }
  enterState(){
    const enterMsg = 'Trockner bitte leeren!';
    this.sendStateMsg(enterMsg);
    if(!this.MyTimer)
        this.MyTimer = setInterval(this.sendStateMsg.bind(this,"Trockner ist noch an bitte auschalten"),300000);
  }
  checkValues(values){
    const {oldState:{val:oldValue}} = values;
    const {newState:{val:newValue}} = values;
    if(newValue > 10)
      this.stateProvider.changeState(isDryingState);
    else if(newValue == 0)
      this.stateProvider.changeState(isOffState);
  }
}

class StateContainer
{
  constructor(initState){
    this.currentState = new initState(this);
  }
  changeState(state){
    if(!state)
      return;
    const newState = new state(this);
    if(this.currentState.constructor.name == newState.constructor.name)
      return;
    this.currentState.exitState();
    delete this.currentState;
    this.currentState = newState;
    this.currentState.enterState();
    this.currentState.executeState();
  }
  executeState()
  {
    if(!this.currentState)
      return;
    this.currentState.executeState();
  }
  checkValues(val)
  {
    if(!this.currentState)
      return;
    this.currentState.checkValues(val);
  }
}

class MyTrockner
{
  constructor()
  {
    this.statesContainer = new StateContainer(isOffState);

    const ID_WaescheTrockerPower = 'shelly.0.SHSW-PM##1.Relay0.Power'/*Power*/;
    on({id:  ID_WaescheTrockerPower,change: 'ne'},this.statesContainer.checkValues.bind(this.statesContainer));
  }
}

const trockner = new MyTrockner();
