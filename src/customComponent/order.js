import React, { Component , useState,forwardRef, useRef } from 'react'
import axios from 'axios';
import { Spinner,FormGroup,Intent,Elevation,Card,Tooltip,TextArea,Dialog,InputGroup,Button,Classes,Text,Label,HTMLSelect,Toaster,Position} from "@blueprintjs/core";
import API from './api';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import copy from 'copy-to-clipboard';

class OrderForm extends React.Component {
  constructor(props,ref) {
    super(props);
    this.state = {isOpen: false,
                  nft:  '',
                  summary: '',
                  nftCount: 1,
                  ipfs: '',
                  value: 'copy to clipboard.',
                  post: '',
                  describe: '',
                  regex_nft: '/[^\w\.\/]/ig',
                  step1: "1:提交订单(当前步骤)",
                  step2: "2:转账ADA",
                  disabledTXButton: true,
                  disabledOrderButton: false,
                  showSpinner: false,
                  adaTXInfo: "",
                  seandAdaCount: "",
                  send_ada_address: "",
                  send_ada_count: 5

                };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeNFTName = this.handleChangeNFTName.bind(this);
    this.handleChangeNFTCount = this.handleChangeNFTCount.bind(this);
    this.handleonblurNFTName = this.handleonblurNFTName.bind(this);
    this.handleDescriptionOnBlur = this.handleDescriptionOnBlur.bind(this);
    this.handleSummaryOnBlur = this.handleSummaryOnBlur.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.checkOrderField = this.checkOrderField.bind(this);
    this.handleSummary = this.handleSummary.bind(this);
    this.handleDescription = this.handleDescription.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.handleonblurIPFS = this.handleonblurIPFS.bind(this);
    this.handleChangeIPFS = this.handleChangeIPFS.bind(this);





  }





  refHandlers = {
       toaster: (ref) => this.toaster = ref,
  };

  addToast = (error_id) => {
    if(error_id == "1")
    {
      this.toaster.show({ message: "nft长度建议是1到15，不建议使用各种特殊字符和中文!" , intent: 'warning'});
    }
    else if (error_id == "2")
    {
      this.toaster.show({ message: "描述字数需要在1到40之间！" , intent: 'warning'});
    }
    else if (error_id == "3")
    {
      this.toaster.show({ message: "摘要字数需要在1到20之间！" , intent: 'warning'});
    }
    else if (error_id == "4")
    {
      this.toaster.show({ message: "IPFS的CID长度必须是46位。" , intent: 'warning'});
    }
    else if (error_id == "5")
    {
      this.toaster.show({ message: "转账成功。", intent: 'success'});
    }
  }

  handleSubmit(event) {
//    alert('提交的名字: ' + event.text_input);
    console.log('提交的名字: ' + this.state.value);

    event.preventDefault();

    API.post('/',
      {  name: this.state.value

      })
      .then(res => {
        console.log(res);
        console.log(res.data);
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  callAPPFunction()
  {
      this.closeDialog();
      // this.setState({
      //               displaySpinner: "block"
      //               }) ;

      window.location.href = '#orderdiv' ;
      console.log("in...callAPPFunction..");
      this.props.getOrderResultAddrADA({send_ada_address: this.state.send_ada_address,
                                        send_ada_count: this.state.send_ada_count});


  }

  ononMouseLeave()
  {
    this.setState({value: ""});
  }


  processErrorAfterPostOrder(data)
  {

  }

  processAfterPostOrder(data)
  {
    console.log(data["orderbuild_result"]);



    if("ok" == data["orderbuild_result"])
    {

      const tempadaTXInfo =  data["server_ada_address"];
      const tempseandAdaCount =  "ada转账数量: " + data["send_ada_mount"] + " ADA";
      //const temp_dd = new String("ada转账地址:" , data["server_ada_address");
      //const temp_dd = "ada转账地址:" +  data["server_ada_address";
      //"ada转账数量: " + data["send_ada_mount"] + " ADA"

      //const temp_tx  = "ada转账地址:" +  data["server_ada_address";
      //
      //{"ada转账数量: " +  + " ADA"}
      this.setState({disabledTXButton: false,
                     disabledOrderButton: true,
                     step1: "1:提交订单(完成)" ,
                     step2: "2:转账ADA(当前步骤)",
                     adaTXInfo: tempadaTXInfo,
                     seandAdaCount: tempseandAdaCount,
                     send_ada_address: data["server_ada_address"],
                     showSpinner: false,
                     send_ada_count: data["send_ada_mount"]
                     }) ;
    }
    else {
      this.setState({
                     step1: "1:提交订单(异常)"
                      }) ;
    }

  }

  postOrder()
  {
    console.log('提交的名字: ' + this.state.value);


    //event.preventDefault();
    this.setState({disabledOrderButton: true,
                   showSpinner: true}) ;

    //alert("loading");

    API.post('/addOrder',
      {  name: this.state.nft,
         to_address:this.props.wAddress,
         describe: this.state.describe,
         nft_name: this.state.summary,
         ipfs: this.state.ipfs,
         count: this.state.nftCount
      })
      .then(res => {
        console.log(res);
        console.log(res.data);
        this.processAfterPostOrder(res.data);
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  checkOrderField()
  {
      console.log("in check");
      if(!(/^[a-zA-Z][a-zA-Z0-9_]{1,15}$/.test(this.state.nft)))
      {
        this.addToast("1");
        return;
      }
      if(this.state.describe.length <1 || this.state.describe.length >40 )
      {
        this.addToast("2");
        return ;
      }
      if(this.state.summary.length <1 || this.state.summary.length >20 )
      {
        this.addToast("3");
        return;
      }
      if(/^[a-zA-Z][a-zA-Z0-9_]{46}$/.test(this.state.ipfs))
      {
          this.addToast("4");
          return;
      }
      //检查ok后弹出对话框，需要确认

      this.setState({isOpen: true});
  }

  //如果对话框关闭，清空对话框内容
  cleanDialogInfo()
  {

  }

  closeDialog()
  {
    this.setState({isOpen: false,
                  step1: "1:提交订单(当前步骤)",
                  step2: "2:转账ADA",
                  disabledTXButton: true,
                  disabledOrderButton: false,
                  adaTXInfo: "",
                  seandAdaCount: ""
                });
    this.onclick_copy_add();

    console.log("close, call some?");


  }

  openDialog()
  {
    this.setState({isOpen: true});
  }

  handleSummaryOnBlur(event)
  {
    this.setState({summary: event.target.value});
    console.log(event.target.summary);
    console.log(this.state.summary.length);
    if(this.state.summary.length <1 || this.state.summary.length >20 )
    {
      this.addToast("3");
    }
  }

  handleSummary(event)
  {
    this.setState({summary: event.target.value});

  }

  handleDescriptionOnBlur(event)
  {
    this.setState({describe: event.target.value});
    console.log(event.target.value);
    console.log(this.state.describe.length);
    if(this.state.describe.length <1 || this.state.describe.length >40 )
    {
      this.addToast("2");
    }
  }
  handleDescription(event)
  {
    this.setState({describe: event.target.value});

  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleChangeNFTName(event) {
      this.setState({nft: event.target.value});
  }

  handleonblurNFTName(event) {
      //this.setState({nft: event.target.value});
      this.setState({nft: event.target.value});
      console.log('onblur nft : ' + this.state.nft);
      if(/^[a-zA-Z][a-zA-Z0-9_]{1,15}$/.test(event.target.value))
      {
          console.log('regex ok');
      }
      else
      {
          console.log('regex ??');
          this.addToast("1");
      }
  }

  handleChangeIPFS(event) {
      this.setState({ipfs: event.target.value});
  }

  handleonblurIPFS(event) {
      //this.setState({nft: event.target.value});
      this.setState({ipfs: event.target.value});
      console.log('onblur ipfs : ' + this.state.ipfs);
      //if(/^[a-zA-Z][a-zA-Z0-9_]{4}$/.test(event.target.value))
      if(/^[a-zA-Z0-9_]{46}$/.test(event.target.value))
      {
          console.log('regex ok');
      }
      else
      {
          console.log('regex ??');
          this.addToast("4");
      }
  }


  handleChangeNFTCount(event) {
    this.setState({nftCount: event.target.value});



  }


  onclick_copy_add()
  {
    //navigator.clipboard.writeText(this.state.changeAddress);
    if (navigator && navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
            .writeText(this.state.adaTXInfo)
            .then(() => {
                console.log('复制成功');
            })
            .catch(() => {
                console.log('复制失败');
            });
    } else {
        if (copy(this.state.adaTXInfo)) {
            console.log('复制成功');
        } else {
            console.log('复制失败');
        }
    }


    console.log( "in copied onclick:" ,this.state.adaTXInfo);
    this.setState({value: "copied"});
    console.log( "in copied onclick value:" ,this.state.value);
  }



  render() {
    return (
      <form onSubmit={this.handleSubmit}>
       <div id='orderdiv'/>
        <FormGroup
          helperText="这里是默认你选择的钱包地址，如果需要修改请先更换钱包..."
          label="钱包地址"
          labelFor="text-input"
          labelInfo="(必须)"
          >

          <InputGroup style={{  width: 890 }} disabled="true"
          value={this.props.wAddress} id="address_input"   intent="Primary" placeholder="address....t"
          onChange={this.handleChange} />

        </FormGroup>
        <FormGroup
          helperText="不建议使用中文名字"
          label="NFT name"
          labelFor="text-input"
          labelInfo="(必须)"
          >
          <InputGroup style={{  width: 300 }}  id="nft_input" value={this.state.nft}  intent="Primary" placeholder="input nft name .."
          onChange={this.handleChangeNFTName} onBlur={this.handleonblurNFTName}  />
        </FormGroup>
        <FormGroup
          helperText=""
          label="ipfs-cid"
          labelFor="text-input"
          labelInfo="(必须)"
          >
          <InputGroup style={{  width: 450 }}  id="nft_input" value={this.state.ipfs}  intent="Primary" placeholder="input ipfs cid .."
          onChange={this.handleChangeIPFS} onBlur={this.handleonblurIPFS}  />
        </FormGroup>

        <FormGroup
          helperText="不同的数量会有不一样的ada价格"
          label="nft数量"
          labelFor="text-input"
          labelInfo="(必须)"
          >
          <HTMLSelect value={this.state.nftCount} style={{  width: 190 }}   id="nft_count_input" value={this.state.nftCount} intent="Primary"
          onChange={this.handleChangeNFTCount}>
                    <option selected>1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="100">100</option>
          </HTMLSelect>

        </FormGroup>
        <FormGroup
          helperText=""
          label="描述"
          labelFor="text-input"
          labelInfo="(必须)"
          >
          <TextArea
              growVertically={true}
              large={true}
              intent={Intent.PRIMARY}
              onChange={this.handleChange}
              value={this.state.describe}
              style={{height: 140, width: 496}}

              onChange={this.handleDescription} onBlur={this.handleDescriptionOnBlur}
          />
        </FormGroup>

        <FormGroup
          helperText=""
          label="summary"
          labelFor="text-input"
          labelInfo="(必须)"
          pattern="[A-Za-z]{3}"
          >
          <InputGroup style={{  width: 600 }}  id="nft_input" value={this.state.summary}  intent="Primary"
          placeholder="input summary .."
          onChange={this.handleSummary} onBlur={this.handleSummaryOnBlur}  />
        </FormGroup>

        <div>
          <Toaster position={Position.TOP_CENTER} ref={this.refHandlers.toaster}  />
        </div>

        <Button text="确认" onClick={() => { this.checkOrderField() }}  style={{  float: "left" ,width: 180 }}/>
        <div  style={{display: this.props.displaySpinner, float: "center" ,width: 300 }}>
          <Spinner size={60} />
        </div>
        <Dialog
               title=""
               icon="info-sign"
               isOpen={this.state.isOpen}
               canOutsideClickClose={true}
               canEscapeKeyClose={true}
               onClose={() => {this.closeDialog()}}


           >
           <div  className={Classes.DIALOG_FOOTER}>
              <h3 style={{
                        fontSize: '15pt',
                        color: '#ff3d7f',
                        height: '13pt'}}>请再次确认你的订单信息</h3>

                <Card interactive={false} elevation={Elevation.TWO}>
                <h3 style={{
                          fontSize: '15pt',
                          color: '#ff3d7f',
                        }}>{this.state.step1}</h3>
                        <ul class=".modifier">
                          <li>钱包地址:  <p style={{ wordWrap: 'break-word', textDecorationLine: 'underline', textDecorationStyle: 'solid'}}>
                            {this.props.wAddress}</p></li>
                          <li>nft名称:   {this.state.nft} </li>
                          <li>nft数量:   {this.state.nftCount} </li>
                          <li>ipfs-cid:   {this.state.ipfs} </li>
                          <li>描述:   {this.state.describe} </li>
                          <li>摘要:   {this.state.summary} </li>
                        </ul>
                      <Button  disabled={this.state.disabledOrderButton}  onClick={()=> {this.postOrder()}} intent="primary" icon="saved" text="mint"  />

                   {this.state.showSpinner && <Spinner size={30}  style={{display: "none"}}/>}
                </Card>
                <br/>
                <Card interactive={false} elevation={Elevation.TWO}>
                <h3 style={{
                          fontSize: '14pt',
                          color: '#ff3d7f',
                        }}>{this.state.step2}</h3>
                    <h5>ADA转账地址:</h5>
                      <p style={{ wordWrap: 'break-word', textDecorationLine: 'underline', textDecorationStyle: 'solid'}}>
                            <b>{this.state.adaTXInfo}</b>
                            <Tooltip  content={this.state.value} position={Position.RIGHT}  >
                                   <Button onMouseLeave={this.ononMouseLeave.bind(this)} onClick={this.onclick_copy_add.bind(this)}  icon="clipboard" ></Button>
                            </Tooltip>
                      </p>
                      <p> <b>{this.state.seandAdaCount} </b></p>
                    <Button   disabled={this.state.disabledTXButton} intent="primary" icon="send-to" text="调用钱包插件转账"
                    onClick={()=> {this.callAPPFunction()}} />
                    <br/><br/>
                    <Button   disabled={this.state.disabledTXButton} intent="primary" icon="send-to" text="使用其他钱包"
                    onClick={()=> {this.closeDialog()}} /><b>拷贝此钱包地址，并发送精准ada数量。</b>

                </Card>

           </div>
           </Dialog  >
      </form>

    );
  }


}
export default OrderForm;
