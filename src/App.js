import React, { forwardRef, useRef } from 'react'
import '@blueprintjs/core/lib/css/blueprint.css';

import { Dialog } from "@blueprintjs/core";

import { Navbar } from "@blueprintjs/core";
import { Alignment } from "@blueprintjs/core";
import { Spinner,ButtonGroup,Label,Divider,Button, Toaster,Card, Elevation, Classes, Code, H3, H5, Intent, Overlay, Switch } from "@blueprintjs/core";
import { Colors,Position,Tooltip,Tab, Tabs, RadioGroup,Callout, Radio, FormGroup,HTMLTable, InputGroup, NumericInput } from "@blueprintjs/core";
import {Timeline, TimelineEvent} from 'react-event-timeline';
import successSvg  from './success.svg';
import copy from 'copy-to-clipboard';
import namiSvg  from './nami.svg';
import eternlSvg  from './eternl.svg';
import flintSvg  from './flint.svg';
import nonftSvg  from './nnonft.svg';

import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";


import WalletInfo  from './customComponent/mywallet.js';
import OrderForm  from './customComponent/order.js';
import OrderQuery  from './customComponent/orderQuery.js';
import { AppToaster } from "./customComponent/toaster.js";



function App() {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },

  });


    const childCompRef = useRef();

    const [name, setName] = React.useState("Matt");

    // Open state
    const [isOpen, setIsOpen] = React.useState(false);
    const [txHash, setTxHash] = React.useState("");
    const [showSuccessSVG, setShowSuccessSVG] = React.useState("block");
    const [showTXInfo, setShowTXInfo] = React.useState("none");
    const [showSpinner, setShowSpinner] = React.useState("none");
    const [walletValuebleInfo, setWalletValuebleInfo] = React.useState("");


    const [hasTxhash, setHasTxhash] = React.useState(false);


    const [txHashHref, setTxHashHref] = React.useState("https://testnet.cardanoscan.io/transaction/");

    const [value, setValue] = React.useState("copy to clipboard.");
    const [copied, setCopied] = React.useState(false);


    function ononMouseLeave()
    {
      setValue("");
    }

    function onclick_close()
    {
      //CustomFunction.call_wallet();
      setIsOpen(false);
    }

    function handleWalletSelect(event)
    {
      //alert("in handleWalletSelect:"+event.target.value);
      setWallet(event.target.value);

    }

    function confrimWallet()
    {

      const walletValueble = childCompRef.current.checkIfWalletFound();
      console.log("check wallet :" , childCompRef.current.checkIfWalletFound());
      if(!walletValueble)
      {
        setWalletValuebleInfo("???????????????????????????????????????????????????");
      }
      else {
        setSelectedWallet(wallet);
        //alert(selectedWallet);
        setshowWalletInfo("block");
        onclick_close();
      }

    }

    function turnOffTL()
    {
      switchTimeLine('none');
    }

    function turnOnTL()
    {
      switchTimeLine('block');
    }

    function switchTimeLine(boolV)
    {
      console.log("boolV : "+ boolV );
      setShowTimeLine(boolV);
    }

    function switchTab(tabId)
    {
      setOrderSelectedTab(tabId);

    }

    function tabCall(o)
    {
      setOrderSelectedTab(o);
      console.log("selected:["+o+"]");

      //setselectedTabID
      console.log("selected selectedTabID:",orderSelectedTab);
      if("ng" === o)
      {
        console.log("at here call get query orders");
      }
      else {
        console.log("["+o+"]");
      }
      //console.log("switchTab --ID: "+ tabId );
    //  console.log("selectedTabId :" ,this.target.selectedTabId());
    }

    const scrollToAnchor = (anchorname:any) =>{
      if(anchorname){
          const anchorElement = document.getElementById(anchorname);
          if(anchorElement){
              anchorElement.scrollIntoView({behavior:'smooth',block:'start'});
          }
      }
    }

    function goHref(h,stab)
    {
      switchTab(stab);
      //scrollToAnchor(h);
      window.location.href = h ;
    }

    function getAddress(data)
    {
      console.log('????????????????????? ?????? address:', data["changeAddress"]);
      setWalletAddress(data["changeAddress"]);
      //setClientWalletAddress(data["changeAddress"]);
      //console.log('to address:', send_ada_address);

    }

    //order ??????????????????????????????????????????????????????mywallet?????????
    function getAddressLovelaceSendTo(data)
    {
        setShowTXInfo("block");
        goHref('#div','rx');

        //
        console.log('?????????????????????send to address:', data);
        setSend_ada_address(data["send_ada_address"]);
        setSend_ada_count(data["send_ada_count"]*1000000);


        //??????my wallet ????????????ada??? ,return :"submittedTxHash": submittedTxHash


        childCompRef.current.my_buildSendADATransaction(data["send_ada_address"],data["send_ada_count"]*1000000);


        //todo fater submit ??????????????????
        //1.??????Dialog [???childCompRef.current.my_buildSendADATransaction() ????????????]
          //???done??????order.js?????? callAPPFunction ???????????????closeDialog?????????
        //2.??????showTXInfo card
          //
          //setShowTXInfo("block");

        //3.???????????????????????????txhash??

        //4.?????????????????? Spinner?????????????????????
        //  + ???????????????????????????
        //  + ?????????????????????????????????????????????
        //5.???????????? ??? ??????txhash
        //6.??????success

        goHref('#div','rx');
        //setpdisplaySpinner("none");
        //console.log("txHash:",txHash);
    }

    function getTxHashFromWallet(data)
    {
        //
        goHref('#div','rx');


        console.log('???????????????txhash??????:', data);
        setHasTxhash(true);
        setTxHash(data);
        setTxHashHref(txHashHref + data);
        setShowTXInfo("block");
        //addToast("5");
        showToast();
        goHref('#div','rx');


        //setpdisplaySpinner("block");
    }

//obj.target.value
    function showToast(){
    // create toasts in response to interactions.
    // in most cases, it's enough to simply create and forget (thanks to timeout).
      AppToaster.show({  message: "????????????", intent: 'success'});
    }


    const [message, setMessage]                   = React.useState(false);
    const [wallet, setWallet]                     = React.useState("");
    const [selectedWallet, setSelectedWallet]     = React.useState("");
    const [showTimeLine, setShowTimeLine]         = React.useState(true);
    const [orderSelectedTab ,setOrderSelectedTab] = React.useState("rx");
    const [walletAddress, setWalletAddress]       = React.useState("");
    const [pdisplaySpinner, setpdisplaySpinner]   = React.useState("none");


    const [showWalletInfo, setshowWalletInfo]   = React.useState("none");


    //?????????????????????ada??????
    const [getOrderResultAddrADA, setgetOrderResultAddrADA]     = React.useState("");


    //?????????????????????????????????txHash
    const [getTxHash, setgetTxHash]                 = React.useState("");


    //????????????order.js?????????????????????
    const [send_ada_address, setSend_ada_address]   = React.useState("");
    const [send_ada_count, setSend_ada_count]       = React.useState(2);

    //const [refWallet, setRefWallet]                 = React.createRef();



    //message = 'Hello world!';


    const orderForm = useRef(null);

    function call_child_fun()
    {
      //console.log("in...");
      childCompRef.current.my_buildSendADATransaction();
    }


    function onclick_copy_add()
    {

      if (navigator && navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
              .writeText(txHash)
              .then(() => {
                  console.log('????????????');
              })
              .catch(() => {
                  console.log('????????????');
              });
      } else {
          if (copy(txHash)) {
              console.log('????????????');
          } else {
              console.log('????????????');
          }
      }
      console.log(txHash);
      setValue("copied");
    }


    return (
        <div style={{height: 2000}}>
          <Navbar className="bp4-dark" style={{height: 50, backgroundColor: 'powderblue'}}>
            <Navbar.Group align={Alignment.RIGHT} >
            <ButtonGroup minimal={true}  >

               <Divider />
               <Button text="??????" onClick={()=>{goHref('#div','ng')}}/>
               <Button text="????????????" onClick={() => { setIsOpen(true) }}/>
            </ButtonGroup>
            </Navbar.Group>
          </Navbar>

            <Overlay className={Classes.OVERLAY_SCROLL_CONTAINER}
                isOpen={isOpen}>
                <H3>I am sample Content of Overlay</H3>
                <div style={{
            display: 'block', width: 400, padding: 30
        }}>
            <h4>ReactJS Blueprint Dialog Component</h4>
            <Dialog
                title="????????????"
                icon="info-sign"
                isOpen={true}
                sCloseButtonShow={onclick_close}
                canEscapeKeyClose={onclick_close}
                onClose={onclick_close}
            >
            <div className={Classes.DIALOG_BODY} i>
                    <p style={{color: "red",fontSize: '17pt'}}>
                        <strong>
                        {walletValuebleInfo}

                        </strong>
                    </p>
                    <div style={{paddingTop: "10px"}}>
                        <RadioGroup
                            label="??????????????????:"
                            onChange={handleWalletSelect}
                            selectedValue={wallet}
                            inline={true}
                        >
                            <Radio label="Nami" value="nami" />
                            <Radio label="CCvault" value="ccvault" />
                            <Radio label="Flint" value="flint" />
                        </RadioGroup>
                        <Button text="??????" onClick={confrimWallet}/>
                    </div>
                </div>

            </Dialog>
        </div>
            </Overlay>


            <View style={[styles.container, {
             // Try setting `flexDirection` to `"row"`.
               flexDirection: "row"
               }]}>

             <View style={{ flex: 4, backgroundColor: "white" , height: 300}} >
                      <div >
                                   <h3 style={{ height:180, backgroundColor: 'white',
                                                fontSize: '20pt',
                                                color: '#ff3d7f',
                                                height: '40pt'}}> Mint NFT in cardano by yourself</h3>
                                   <p style={{ height:180, backgroundColor: 'white',
                                                fontSize: '15pt',
                                                color: '#ff3d7f',
                                                height: '40pt'}}>
                                                ???????????????NFT,??????NFT??????????????????????????????????????????????????????????????????????????????cardano?????????????????????

                                   </p>

                      </div>
                      <br/><br/><br/><br/>

                      <div>
                            <Button  intent="primary" style={{width: 140}}
                             icon="oil-field" text="mint" onClick={()=>{goHref('#div','rx')}}/>


                       </div>

             </View>
             <View style={{ flex: 1, backgroundColor: "white", height: 300 }} >

             </View>
             <View style={{ flex: 2, backgroundColor: "white" , height: 300 ,display: showWalletInfo}} >
               <WalletInfo
                      name={name}  getAddrInChildDefin={getAddress}
                      selectedWallet={selectedWallet}
                      send_ada_count={send_ada_count}
                      send_ada_address={send_ada_address}
                      getTxHash={getTxHashFromWallet}

                      ref={childCompRef}

                       />
             </View>

         </View>
            <View style={[styles.container, {
               // Try setting `flexDirection` to `"row"`.
                 flexDirection: "row"
                 }]}>
               <View style={{ flex: 4, backgroundColor: "white", height: 870 }} >
               <Timeline style={{display:showTimeLine }}>
                      <TimelineEvent style={{   backgroundColor: 'white',
                                   fontSize: '15pt'
                                   }} title="????????????cardano??????"
                                     icon={<i className="material-icons md-18">1</i>}
                      >
                      <p style={{   backgroundColor: 'white',
                                   fontSize: '12pt'
                                   }}>
                           ??????????????????nami???ccvault???flint?????????????????????????????????????????????
                           </p>
                      </TimelineEvent>
                      <TimelineEvent
                      style={{   backgroundColor: 'white',
                                   fontSize: '15pt'
                                   }} title="???????????????ADA"
                          icon={<i className="material-icons md-18">2</i>}
                          >
                          <p style={{   backgroundColor: 'white',
                                       fontSize: '12pt'
                                       }}>
                         ??????NFT???????????????ADA????????????????????????ADA?????????????????????bybit????????????????????????</p>
                      </TimelineEvent>
                      <TimelineEvent
                      style={{   backgroundColor: 'white',
                                   fontSize: '15pt'
                                   }} title="??????ipfs??????"
                          icon={<i className="material-icons md-18">3</i>}
                          >
                          <p style={{   backgroundColor: 'white',
                                       fontSize: '12pt'
                                       }}>
                          ????????????????????????????????????????????????IPFS???CID?????????????????????????????????????????????IPFS,?????????????????????????????????</p>
                      </TimelineEvent>
                      <TimelineEvent
                      style={{   backgroundColor: 'white',
                                   fontSize: '15pt'
                                   }}   title="????????????NFT?????????"
                          icon={<i className="material-icons md-18">4</i>}
                          >
                          <p style={{   backgroundColor: 'white',
                                       fontSize: '12pt'
                                       }}>
                          ?????????????????????????????????NFT????????????????????????????????????????????????????????????????????????????????????????????????ADA,?????????????????????????????????????????????ADA???</p>
                      </TimelineEvent>
                      <TimelineEvent
                      style={{   backgroundColor: 'white',
                                   fontSize: '15pt'
                                   }}   title="????????????"
                          icon={<i className="material-icons md-18">5</i>}
                          >
                          <p style={{   backgroundColor: 'white',
                                       fontSize: '12pt'
                                       }}>
                          ??????????????????????????????mint????????????ADA,??????????????????????????????????????????????????????NFT?????????????????????????????????????????????</p>
                      </TimelineEvent>
                      <TimelineEvent
                      style={{   backgroundColor: 'white',
                                   fontSize: '15pt'
                                   }}   title="??????????????????NFT"

                          icon={<i className="material-icons md-18">6</i>}
                          >
                          <p style={{   backgroundColor: 'white',
                                       fontSize: '12pt'
                                       }}>
                          ???????????????????????????????????????????????????????????????mint???NFT???</p>
                      </TimelineEvent>

              </Timeline>

               </View>
               <View style={{ flex: 3, backgroundColor: "white" , height: 870}} >
                   <div style={{
                               display: 'block', padding: 30
                                }}>

                       <Callout title="??????/Mint NFT in cardano">

                           <p style={{ wordWrap: 'break-word' , textDecorationStyle: 'solid'}}>
                            ?????????????????????mint NFT???????????????????????????????????????cardano????????????????????????????????????????????????
                            ???????????????nimi???ccvault/eternl???flint????????????
                           </p>

                           <div>

                           </div>

                       </Callout>
                       <Callout title="mint????????????">

                           <ul>
                              <li>?????????????????????<strong>100</strong>???????????????.</li>
                              <li>?????????????????????????????????ADA,??????ada??????????????????????????????????????????????????????.</li>
                              <li>????????????ADA?????????????????????????????????????????????????????????????????????????????????ADA,?????????????????????????????????????????????????????????.</li>
                              <li><a href="https://www.pinata.cloud/"  target="_blank" >???pinata??????ipfs/cid</a></li>
                            </ul>
                       </Callout>

                   </div>
               </View>
           </View>

           <div id='div'>
            <View id="tabdiv" style={[styles.container, {
               // Try setting `flexDirection` to `"row"`.
                 flexDirection: "row"
                 }]}>
                <View style={{ flex: 4, backgroundColor: "white", height: 800 }} >
                     <div style={{
                            display: 'block', width: 500, padding: 30
                            }}>
                            <h2>??????</h2>
                            <Tabs
                              animate={true}
                              key={"vertical"}
                              large={true}
                              vertical={false}
                              defaultSelectedTabId={"rx"}
                              onChange={tabCall}

                              selectedTabId={orderSelectedTab}
                            >
                            <Tab id="rx" title="??????NFT??????" panel={
                                <OrderForm
                                    ref={orderForm}
                                    wAddress={walletAddress}
                                    getOrderResultAddrADA={getAddressLovelaceSendTo}
                                    displaySpinner={pdisplaySpinner}
                                    />
                            }>
                            </Tab>

                            <Tab id="ng" title="????????????" panel={
                              <OrderQuery  clientWalletAddress={walletAddress}/>
                            }    />
                            </Tabs>

                      </div >
                     </View>

                     <View style={{ flex: 2, backgroundColor: "white", height: 150  }} >
                      <br/><br/>
                        <Card   elevation={Elevation.TWO} >
                           <img  style={{display: showTXInfo,float: "left" }}  width="30"
                           height="30" src={successSvg} alt="React Logo" />
                         <span>
                            txHash:
                            <b><p style={{display: showTXInfo, wordWrap: 'break-word', textDecorationLine: 'underline', textDecorationStyle: 'solid'}}>
                                  {txHash}
                                  <Tooltip   content={value}  position={Position.RIGHT}  >
                                         <Button  onMouseLeave={ononMouseLeave} onClick={onclick_copy_add}  icon="clipboard" ></Button>
                                  </Tooltip>
                                  {hasTxhash &&   <a href={txHashHref} target="_blank" icon="link">??????</a>}


                              </p>
                            </b>
                         </span>
                         </Card>

                     </View>
                 </View>


           </div>
             <hr style={{marginTop: "40px", marginBottom: "40px"}}/>
             <View style={[styles.container, {
             // Try setting `flexDirection` to `"row"`.
               flexDirection: "row"
               }]}>
             <View style={{ flex: 4, backgroundColor: "red", height: 99 }} >

                  <h3 style={{  margin:10 ,height:180,
                          fontSize: '20pt',
                          color: 'white',
                          height: '40pt'}}>  sdaf@sd.com</h3>
             </View>
             <View style={{ flex: 3, backgroundColor: "#ffb700" , height: 99}} >
                  <img  style={{  float: "center"  }} src={nonftSvg}   />
             </View>
             <View style={{ flex: 2, backgroundColor: "steelblue" , height: 99}} >

             </View>

         </View>



        </div >
    );
}

export default App;
