const SSH = require('simple-ssh');
const ScriptMapper =
  {
    'reboot'                :'/home/pi/pishare/Scripte/reboot.sh',
    'shutdown'              :'/home/pi/pishare/Scripte/shutdown.sh',
    'shutdownAbort'         :'/home/pi/pishare/Scripte/shutdownCancel.sh',
    'cinemadimlightsEffect' :'/home/pi/pishare/Scripte/cinemadimlights.sh',
    'knightriderEffect'     :'/home/pi/pishare/Scripte/KnightRider.sh',
    'clearAll'              :'/home/pi/pishare/Scripte/clearAll.sh'
  }
class AmbilightController
{
  constructor(){
    //raspberry
    this.hostAmbiLightID = 'ping.0.bpi-iobroker.192_168_178_100';
    this.socketPowerID =   'sonoff.0.AmbiLightStromDose.POWER';
  }

  runScriptWithSSH(pWhat)
  {
      log(["runScriptWithSSH:",pWhat]);
    if(pWhat in ScriptMapper){
      try{
        const ssh = new SSH({host: '192.168.178.100', user: 'pi',
                             pass: 'xxxxx'});
         ssh.exec(ScriptMapper[pWhat],
           {
            out: function(stdout) {
                  console.log(stdout);}
                            }).start();
      }
      catch(err){
        console.log(err);
      }
    }
    else
        console.log("no script found");
  }
  onRunAScript(pObj){
    if('triggerid' in obj.common)
    {
        log("Object has TriggerID:" + obj.common.triggerid);
        this.runScriptWithSSH(obj.common.triggerid);
    }
    else
        log("no TiggerID found");
  }

  onKnighRiderEffect(obj){
      this.runScriptWithSSH('knightriderEffect');
  }
  onPowerOn(obj){
    log("Ambilight power on");
    if(!getState(this.hostAmbiLightID).val)
        setState(this.socketPowerID,true);
  }
  onShutdown(obj){
    if(getState(this.hostAmbiLightID).val){
      this.runScriptWithSSH('shutdown');
      on({id: this.hostAmbiLightID ,change : 'ne', val : false },()=>{
          log("ping on false")
         if(getState(this.socketPowerID).val == true)
            setState(this.socketPowerID,false);
        unsubscribe({id: this.hostAmbiLightID ,change : 'ne', val : false });
      });
    }
    else if(!getState(this.hostAmbiLightID).val && getState(this.socketPowerID).val == true)
    {
        log("turnoff Socket")
        setState(this.socketPowerID,false);
    }
  }
}

const MyAmbiController = new AmbilightController();

on({id: 'javascript.0.Ambilight.Ambilight_off', change: 'any'},MyAmbiController.onShutdown.bind(MyAmbiController));
on({id: 'javascript.0.Ambilight.AmbiLight_On', change: 'any'},MyAmbiController.onPowerOn.bind(MyAmbiController));
on({id: 'javascript.0.Ambilight.AmbiLight_Reboot',change: 'any'},MyAmbiController.onRunAScript.bind(MyAmbiController));
