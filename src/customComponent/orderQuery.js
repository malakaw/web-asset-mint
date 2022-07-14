import React, { Component , useState,forwardRef, useRef } from 'react'
import axios from 'axios';
import { FormGroup,Intent,Elevation,Card,Tooltip,TextArea,Dialog,InputGroup,Button,Classes,Text,Label,HTMLSelect,Toaster,Position} from "@blueprintjs/core";
import API from './api';

import { HTMLTable } from "@blueprintjs/core";


class OrderQuery extends React.Component {
  constructor(props,ref) {
    super(props);
    this.state = {isOpen: false,
                  clientAddress:  '',
                  todos: []
                };
  //  this.handleChange = this.handleChange.bind(this);
  //  this.handleSubmit = this.handleSubmit.bind(this);
  }


  componentWillReceiveProps(nextProps) {
    //有变化的情况下，处理
    if (nextProps.clientWalletAddress !== this.props.clientWalletAddress) {
      this.query(nextProps.clientWalletAddress);
      console.log('new client Wallet:', nextProps.clientWalletAddress);
    }
  }

  query(client_address)
  {
        console.log('>>>>>: ----<<<<' ,client_address );
        API.get('/queryOrder?address='+client_address)
          .then(res => {
            console.log(res);
            console.log(res.data);
            this.setState({
              todos: res.data
            });
            //this.processAfterPostOrder(res.data);
          })
          .catch(function (error) {
            console.log(error);
          })
  }

  componentDidMount()
  {
    //console.log('提交的名字: ----->>>>>>'  );
    this.query(this.props.clientWalletAddress);
  }

  render() {
    const { todos = [] } = this.state;
    return (
      <HTMLTable>
          <thead> </thead>
          <tbody style={{width: 890}}>
              <tr>
                  <th style={{width: 190}}>NFT Name</th>
                  <th>mint nft count</th>
                  <th>ipfs</th>
                  <th>server address</th>
                  <th>date</th>
              </tr>
              {todos.length ?
                  todos.map(todo => (
                    <tr>
                      <td>{todo.nfts[0].nft_name}</td>
                      <td>{todo.nfts[0].count}</td>
                      <td>{todo.nfts[0].ipfs}</td>
                      <td>{todo.from_address}</td>
                      <td>{todo.create_date}</td>
                    </tr>
                  ))
                  :
                  (<tr>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>)
              }

          </tbody>
      </HTMLTable>


    );
  }


}
export default OrderQuery;
