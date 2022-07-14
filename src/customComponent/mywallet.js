import React, { Component , useState } from 'react'
import { Tab, Tabs, RadioGroup, Radio, FormGroup, InputGroup, NumericInput,Button, Card, Elevation } from "@blueprintjs/core";
import "../../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import "../../node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css";
import "../../node_modules/normalize.css/normalize.css";
import { Colors,Spinner, Popover, Position, Tooltip } from "@blueprintjs/core";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import copy from 'copy-to-clipboard';
import namiSvg  from '../nami.svg';
import eternlSvg  from '../eternl.svg';
import flintSvg  from '../flint.svg';

import {
  View,
  Text,
  TextInput,
  StyleSheet
} from "react-native";


import {
    Address,
    BaseAddress,
    MultiAsset,
    Assets,
    ScriptHash,
    Costmdls,
    Language,
    CostModel,
    AssetName,
    TransactionUnspentOutput,
    TransactionUnspentOutputs,
    TransactionOutput,
    Value,
    TransactionBuilder,
    TransactionBuilderConfigBuilder,
    TransactionOutputBuilder,
    LinearFee,
    BigNum,
    BigInt,
    TransactionHash,
    TransactionInputs,
    TransactionInput,
    TransactionWitnessSet,
    Transaction,
    PlutusData,
    PlutusScripts,
    PlutusScript,
    PlutusList,
    Redeemers,
    Redeemer,
    RedeemerTag,
    Ed25519KeyHashes,
    ConstrPlutusData,
    ExUnits,
    Int,
    NetworkInfo,
    EnterpriseAddress,
    TransactionOutputs,
    hash_transaction,
    hash_script_data,
    hash_plutus_data,
    ScriptDataHash, Ed25519KeyHash, NativeScript, StakeCredential
} from "@emurgo/cardano-serialization-lib-asmjs"
import {blake2b} from "blakejs";
let Buffer = require('buffer/').Buffer
let blake = require('blakejs')



class WalletInfo extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
        selectedTabId: "1",
        whichWalletSelected: "nami",
        walletFound: false,
        walletIsEnabled: false,
        walletName: undefined,
        walletIcon: undefined,
        walletAPIVersion: undefined,

        networkId: undefined,
        Utxos: undefined,
        CollatUtxos: undefined,
        balance: undefined,
        changeAddress: undefined,
        rewardAddress: undefined,
        usedAddress: undefined,

        txBody: undefined,
        txBodyCborHex_unsigned: "",
        txBodyCborHex_signed: "",
        submittedTxHash: "",

        addressBech32SendADA:   this.props.send_ada_address,
      //  addressBech32SendADA: "addr_test1qrt7j04dtk4hfjq036r2nfewt59q8zpa69ax88utyr6es2ar72l7vd6evxct69wcje5cs25ze4qeshejy828h30zkydsu4yrmm",
        lovelaceToSend: this.props.send_ada_count,
        //lovelaceToSend: 3000000,
        assetNameHex: "4c494645",
        assetPolicyIdHex: "ae02017105527c6c0c9840397a39cc5ca39fabe5b9998ba70fda5f2f",
        assetAmountToSend: 5,
        addressScriptBech32: "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8",
        datumStr: "12345678",
        plutusScriptCborHex: "4e4d01000033222220051200120011",
        transactionIdLocked: "",
        transactionIndxLocked: 0,
        lovelaceLocked: 3000000,
        manualFee: 900000,
        value: 'copy to clipboard.',
        copied: false,
        walletSVGUri: "",
        walletInfoCard: "none",
        showSpinner: false

    }

    /**
     * When the wallet is connect it returns the connector which is
     * written to this API variable and all the other operations
     * run using this API object
     */
    this.API = undefined;
    this.protocolParams = {
        linearFee: {
            minFeeA: "44",
            minFeeB: "155381",
        },
        minUtxo: "34482",
        poolDeposit: "500000000",
        keyDeposit: "2000000",
        maxValSize: 5000,
        maxTxSize: 16384,
        priceMem: 0.0577,
        priceStep: 0.0000721,
        coinsPerUtxoWord: "34482",
    }

//    this.textInput = React.createRef();
  //  this.callback = this.callback.bind(this);
  }



  //废弃了
  showAlert() {
        alert("Hello from ttt1t Child Component");
  }

  getNAME()
  {
    return "KK";
  }



  componentWillReceiveProps(nextProps) {

    //有变化的情况下，处理
    if (nextProps.selectedWallet !== this.props.selectedWallet) {

      //alert(nextProps.selectedWallet);
      this.state.rewardAddress = "加载中...";
      this.state.changeAddress = "加载中...";
      //todo
      this.state.balance = 0;

      this.state.showSpinner = true;

      this.handleWalletSelect(nextProps.selectedWallet);
      console.log('selectedWallet---22- changed', nextProps.selectedWallet);

    }
  }

  /**
   * Handles the tab selection on the user form
   * @param tabId
   */
  handleTabId = (tabId) => this.setState({selectedTabId: tabId})

  /**
   * Handles the radio buttons on the form that
   * let the user choose which wallet to work with
   * @param obj
   */
  handleWalletSelect = (strWalletName) => {
      const whichWalletSelected = strWalletName
      this.setState({whichWalletSelected},
          () => {
              this.refreshData()
          })
  }


  handleWalletSelect_old = (obj) => {
      const whichWalletSelected = obj.target.value
      this.setState({whichWalletSelected},
          () => {
              this.refreshData()
          })
  }


  /**
   * Generate address from the plutus contract cborhex
   */
  generateScriptAddress = () => {
      // cborhex of the alwayssucceeds.plutus
      // const cborhex = "4e4d01000033222220051200120011";
      // const cbor = Buffer.from(cborhex, "hex");
      // const blake2bhash = blake.blake2b(cbor, 0, 28);

      const script = PlutusScript.from_bytes(Buffer.from(this.state.plutusScriptCborHex, "hex"))
      // const blake2bhash = blake.blake2b(script.to_bytes(), 0, 28);
      const blake2bhash = "67f33146617a5e61936081db3b2117cbf59bd2123748f58ac9678656";
      const scripthash = ScriptHash.from_bytes(Buffer.from(blake2bhash,"hex"));

      const cred = StakeCredential.from_scripthash(scripthash);
      const networkId = NetworkInfo.testnet().network_id();
      const baseAddr = EnterpriseAddress.new(networkId, cred);
      const addr = baseAddr.to_address();
      const addrBech32 = addr.to_bech32();

      // hash of the address generated from script
       console.log("in generateScriptAddress");
    //  console.log(Buffer.from(addr.to_bytes(), "utf8").toString("hex"))

      // hash of the address generated using cardano-cli
      const ScriptAddress = Address.from_bech32("addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8");
      // console.log(Buffer.from(ScriptAddress.to_bytes(), "utf8").toString("hex"))
      //
      //
      // console.log(ScriptAddress.to_bech32())
      // console.log(addrBech32)

  }

  /**
   * Checks if the wallet is running in the browser
   * Does this for Nami, CCvault and Flint wallets
   * @returns {boolean}
   */

  checkIfWalletFound = () => {
      let walletFound = false;

      const wallet = this.state.whichWalletSelected;
      if (wallet === "nami") {
          walletFound = !!window?.cardano?.nami
      } else if (wallet === "ccvault"  || wallet === "eternl") {
          walletFound = !!window?.cardano?.ccvault
      } else if (wallet === "flint") {
          walletFound = !!window?.cardano?.flint
      }

      this.setState({walletFound})
      return walletFound;
  }

  /**
   * Checks if a connection has been established with
   * the wallet
   * @returns {Promise<boolean>}
   */
  checkIfWalletEnabled = async () => {

      let walletIsEnabled = false;

      try {
          const wallet = this.state.whichWalletSelected;
          if (wallet === "nami") {
              walletIsEnabled = await window.cardano.nami.isEnabled();
          } else if (wallet === "ccvault") {
              walletIsEnabled = await window.cardano.ccvault.isEnabled();
          } else if (wallet === "flint") {
              walletIsEnabled = await window.cardano.flint.isEnabled();
          }

          this.setState({walletIsEnabled})

      } catch (err) {
          console.log(err)
      }

      return walletIsEnabled
  }

  /**
   * Enables the wallet that was chosen by the user
   * When this executes the user should get a window pop-up
   * from the wallet asking to approve the connection
   * of this app to the wallet
   * @returns {Promise<void>}
   */

  enableWallet = async () => {
      try {

          const wallet = this.state.whichWalletSelected;
          if (wallet === "nami") {
              this.API = await window.cardano.nami.enable();
          } else if (wallet === "ccvault") {
              this.API = await window.cardano.ccvault.enable();
          } else if (wallet === "flint") {
              this.API = await window.cardano.flint.enable();
          }

          await this.checkIfWalletEnabled();
          await this.getNetworkId();

      } catch (err) {
          console.log(err)
      }
  }

  /**
   * Get the API version used by the wallets
   * writes the value to state
   * @returns {*}
   */
  getAPIVersion = () => {

      let walletAPIVersion;

      const wallet = this.state.whichWalletSelected;
      if (wallet === "nami") {
          walletAPIVersion = window?.cardano?.nami.apiVersion
      } else if (wallet === "ccvault") {
          walletAPIVersion = window?.cardano?.ccvault.apiVersion;
      } else if (wallet === "flint") {
          walletAPIVersion = window?.cardano?.flint.apiVersion;
      }

      this.setState({walletAPIVersion})
      return walletAPIVersion;
  }

  /**
   * Get the name of the wallet (nami, ccvault, flint)
   * and store the name in the state
   * @returns {*}
   */

  getWalletName = () => {

      let walletName;

      const wallet = this.state.whichWalletSelected;
      if (wallet === "nami") {
          walletName = window?.cardano?.nami.name
      } else if (wallet === "ccvault" || wallet === "eternl") {
          walletName = window?.cardano?.ccvault.name
      } else if (wallet === "flint") {
          walletName = window?.cardano?.flint.name
      }

      this.setState({walletName})
      return walletName;
  }

  /**
   * Gets the Network ID to which the wallet is connected
   * 0 = testnet
   * 1 = mainnet
   * Then writes either 0 or 1 to state
   * @returns {Promise<void>}
   */
  getNetworkId = async () => {
      try {
          const networkId = await this.API.getNetworkId();
          this.setState({networkId})

      } catch (err) {
          console.log(err)
      }
  }

  /**
   * Gets the UTXOs from the user's wallet and then
   * stores in an object in the state
   * @returns {Promise<void>}
   */

  getUtxos = async () => {

      let Utxos = [];

      try {
          const rawUtxos = await this.API.getUtxos();

          for (const rawUtxo of rawUtxos) {
              const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, "hex"));
              const input = utxo.input();
              const txid = Buffer.from(input.transaction_id().to_bytes(), "utf8").toString("hex");
              const txindx = input.index();
              const output = utxo.output();
              const amount = output.amount().coin().to_str(); // ADA amount in lovelace
              const multiasset = output.amount().multiasset();
              let multiAssetStr = "";

              if (multiasset) {
                  const keys = multiasset.keys() // policy Ids of thee multiasset
                  const N = keys.len();
                  // console.log(`${N} Multiassets in the UTXO`)


                  for (let i = 0; i < N; i++){
                      const policyId = keys.get(i);
                      const policyIdHex = Buffer.from(policyId.to_bytes(), "utf8").toString("hex");
                      // console.log(`policyId: ${policyIdHex}`)
                      const assets = multiasset.get(policyId)
                      const assetNames = assets.keys();
                      const K = assetNames.len()
                      // console.log(`${K} Assets in the Multiasset`)

                      for (let j = 0; j < K; j++) {
                          const assetName = assetNames.get(j);
                          const assetNameString = Buffer.from(assetName.name(),"utf8").toString();
                          const assetNameHex = Buffer.from(assetName.name(),"utf8").toString("hex")
                          const multiassetAmt = multiasset.get_asset(policyId, assetName)
                          multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`
                          // console.log(assetNameString)
                          // console.log(`Asset Name: ${assetNameHex}`)
                      }
                  }
              }


              const obj = {
                  txid: txid,
                  txindx: txindx,
                  amount: amount,
                  str: `${txid} #${txindx} = ${amount}`,
                  multiAssetStr: multiAssetStr,
                  TransactionUnspentOutput: utxo
              }
              Utxos.push(obj);
              // console.log(`utxo: ${str}`)
          }
          this.setState({Utxos})
      } catch (err) {
          console.log(err)
      }
  }

  /**
   * The collateral is need for working with Plutus Scripts
   * Essentially you need to provide collateral to pay for fees if the
   * script execution fails after the script has been validated...
   * this should be an uncommon occurrence and would suggest the smart contract
   * would have been incorrectly written.
   * The amount of collateral to use is set in the wallet
   * @returns {Promise<void>}
   */
  getCollateral = async () => {

      let CollatUtxos = [];

      try {

          let collateral = [];

          const wallet = this.state.whichWalletSelected;
          if (wallet === "nami") {
              collateral = await this.API.experimental.getCollateral();
          } else {
              collateral = await this.API.getCollateral();
          }

          for (const x of collateral) {
              const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(x, "hex"));
              CollatUtxos.push(utxo)
              // console.log(utxo)
          }
          this.setState({CollatUtxos})
      } catch (err) {
          console.log(err)
      }

  }

  /**
   * Gets the current balance of in Lovelace in the user's wallet
   * This doesnt resturn the amounts of all other Tokens
   * For other tokens you need to look into the full UTXO list
   * @returns {Promise<void>}
   */
  getBalance = async () => {
      try {
          const balanceCBORHex = await this.API.getBalance();

          const balance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex")).coin().to_str();
          this.setState({balance})

      } catch (err) {
          console.log(err)
      }
  }

  /**
   * Get the address from the wallet into which any spare UTXO should be sent
   * as change when building transactions.
   * @returns {Promise<void>}
   */
  getChangeAddress = async () => {
      try {
          const raw = await this.API.getChangeAddress();
          const changeAddress = Address.from_bytes(Buffer.from(raw, "hex")).to_bech32()
          this.setState({changeAddress})
          //调用父节点中的函数
          this.props.getAddrInChildDefin({changeAddress});
          this.state.showSpinner = false;
      } catch (err) {
          console.log(err)
      }
  }

  /**
   * This is the Staking address into which rewards from staking get paid into
   * @returns {Promise<void>}
   */
  getRewardAddresses = async () => {

      try {
          const raw = await this.API.getRewardAddresses();
          const rawFirst = raw[0];
          const rewardAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()
          // console.log(rewardAddress)
          this.setState({rewardAddress})

      } catch (err) {
          console.log(err)
      }
  }

  /**
   * Gets previsouly used addresses
   * @returns {Promise<void>}
   */
  getUsedAddresses = async () => {

      try {
          const raw = await this.API.getUsedAddresses();
          const rawFirst = raw[0];
          const usedAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()
          // console.log(rewardAddress)
          this.setState({usedAddress})

      } catch (err) {
          console.log(err)
      }
  }

  /**
   * Refresh all the data from the user's wallet
   * @returns {Promise<void>}
   */
  refreshData = async () => {

      this.generateScriptAddress()

      try{
          const walletFound = this.checkIfWalletFound();
          if (walletFound) {
              await this.enableWallet();
              await this.getAPIVersion();
              await this.getWalletName();
              await this.getUtxos();
              await this.getCollateral();
              await this.getBalance();
              await this.getChangeAddress();
              await this.getRewardAddresses();
              await this.getUsedAddresses();
          }
      } catch (err) {
          console.log(err)
      }
  }

  /**
   * Every transaction starts with initializing the
   * TransactionBuilder and setting the protocol parameters
   * This is boilerplate
   * @returns {Promise<TransactionBuilder>}
   */
  initTransactionBuilder = async () => {

      const txBuilder = TransactionBuilder.new(
          TransactionBuilderConfigBuilder.new()
              .fee_algo(LinearFee.new(BigNum.from_str(this.protocolParams.linearFee.minFeeA), BigNum.from_str(this.protocolParams.linearFee.minFeeB)))
              .pool_deposit(BigNum.from_str(this.protocolParams.poolDeposit))
              .key_deposit(BigNum.from_str(this.protocolParams.keyDeposit))
              .coins_per_utxo_word(BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
              .max_value_size(this.protocolParams.maxValSize)
              .max_tx_size(this.protocolParams.maxTxSize)
              .prefer_pure_change(true)
              .build()
      );

      return txBuilder
  }

  /**
   * Builds an object with all the UTXOs from the user's wallet
   * @returns {Promise<TransactionUnspentOutputs>}
   */
  getTxUnspentOutputs = async () => {
      let txOutputs = TransactionUnspentOutputs.new()
      for (const utxo of this.state.Utxos) {
          txOutputs.add(utxo.TransactionUnspentOutput)
      }
      return txOutputs
  }

  /**
   * The transaction is build in 3 stages:
   * 1 - initialize the Transaction Builder
   * 2 - Add inputs and outputs
   * 3 - Calculate the fee and how much change needs to be given
   * 4 - Build the transaction body
   * 5 - Sign it (at this point the user will be prompted for
   * a password in his wallet)
   * 6 - Send the transaction
   * @returns {Promise<void>}
   */
  buildSendADATransaction = async () => {

      const txBuilder = await this.initTransactionBuilder();
      //toModify this.props.send_ada_address replace this.state.addressBech32SendADA
      const shelleyOutputAddress = Address.from_bech32(this.state.addressBech32SendADA);
      const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);

      txBuilder.add_output(
          TransactionOutput.new(
              shelleyOutputAddress,
              Value.new(BigNum.from_str(this.state.lovelaceToSend.toString()))
          ),
      );

      // Find the available UTXOs in the wallet and
      // us them as Inputs
      const txUnspentOutputs = await this.getTxUnspentOutputs();
      //从原先的1改成2
      txBuilder.add_inputs_from(txUnspentOutputs, 2)

      // calculate the min fee required and send any change to an address
      txBuilder.add_change_if_needed(shelleyChangeAddress)

      // once the transaction is ready, we build it to get the tx body without witnesses
      const txBody = txBuilder.build();


      // Tx witness
      const transactionWitnessSet = TransactionWitnessSet.new();

      const tx = Transaction.new(
          txBody,
          TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
      )

      let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
      txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

      transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

      const signedTx = Transaction.new(
          tx.body(),
          transactionWitnessSet
      );
      //todo657
      const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
      console.log("in mywallet submittedTxHash:"+submittedTxHash);
      this.setState({submittedTxHash});
      this.props.getTxHash(submittedTxHash);

  }


  buildSendTokenTransaction = async () => {

      const txBuilder = await this.initTransactionBuilder();
      const shelleyOutputAddress = Address.from_bech32(this.state.addressBech32SendADA);
      const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);

      let txOutputBuilder = TransactionOutputBuilder.new();
      txOutputBuilder = txOutputBuilder.with_address(shelleyOutputAddress);
      txOutputBuilder = txOutputBuilder.next();

      let multiAsset = MultiAsset.new();
      let assets = Assets.new()
      assets.insert(
          AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
          BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
      );
      multiAsset.insert(
          ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
          assets
      );

      txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
      const txOutput = txOutputBuilder.build();

      txBuilder.add_output(txOutput)

      // Find the available UTXOs in the wallet and
      // us them as Inputs
      const txUnspentOutputs = await this.getTxUnspentOutputs();
      txBuilder.add_inputs_from(txUnspentOutputs, 3)


      // set the time to live - the absolute slot value before the tx becomes invalid
      // txBuilder.set_ttl(51821456);

      // calculate the min fee required and send any change to an address
      txBuilder.add_change_if_needed(shelleyChangeAddress)

      // once the transaction is ready, we build it to get the tx body without witnesses
      const txBody = txBuilder.build();

      // Tx witness
      const transactionWitnessSet = TransactionWitnessSet.new();

      const tx = Transaction.new(
          txBody,
          TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
      )

      let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
      txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

      transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

      const signedTx = Transaction.new(
          tx.body(),
          transactionWitnessSet
      );

      const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
      console.log(submittedTxHash)
      this.setState({submittedTxHash});

      // const txBodyCborHex_unsigned = Buffer.from(txBody.to_bytes(), "utf8").toString("hex");
      // this.setState({txBodyCborHex_unsigned, txBody})

  }



  buildSendAdaToPlutusScript = async () => {

      const txBuilder = await this.initTransactionBuilder();
      const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
      const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)


      let txOutputBuilder = TransactionOutputBuilder.new();
      txOutputBuilder = txOutputBuilder.with_address(ScriptAddress);
      const dataHash = hash_plutus_data(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))
      txOutputBuilder = txOutputBuilder.with_data_hash(dataHash)

      txOutputBuilder = txOutputBuilder.next();

      txOutputBuilder = txOutputBuilder.with_value(Value.new(BigNum.from_str(this.state.lovelaceToSend.toString())))
      const txOutput = txOutputBuilder.build();

      txBuilder.add_output(txOutput)

      // Find the available UTXOs in the wallet and
      // us them as Inputs
      const txUnspentOutputs = await this.getTxUnspentOutputs();
      txBuilder.add_inputs_from(txUnspentOutputs, 2)


      // calculate the min fee required and send any change to an address
      txBuilder.add_change_if_needed(shelleyChangeAddress)

      // once the transaction is ready, we build it to get the tx body without witnesses
      const txBody = txBuilder.build();

      // Tx witness
      const transactionWitnessSet = TransactionWitnessSet.new();

      const tx = Transaction.new(
          txBody,
          TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
      )

      let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
      txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

      transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

      const signedTx = Transaction.new(
          tx.body(),
          transactionWitnessSet
      );

      const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
      console.log(submittedTxHash)
      this.setState({submittedTxHash: submittedTxHash, transactionIdLocked: submittedTxHash, lovelaceLocked: this.state.lovelaceToSend});


  }

  buildSendTokenToPlutusScript = async () => {

      const txBuilder = await this.initTransactionBuilder();
      const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
      const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)

      let txOutputBuilder = TransactionOutputBuilder.new();
      txOutputBuilder = txOutputBuilder.with_address(ScriptAddress);
      const dataHash = hash_plutus_data(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))
      txOutputBuilder = txOutputBuilder.with_data_hash(dataHash)

      txOutputBuilder = txOutputBuilder.next();

      let multiAsset = MultiAsset.new();
      let assets = Assets.new()
      assets.insert(
          AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
          BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
      );
      multiAsset.insert(
          ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
          assets
      );

      // txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))

      txOutputBuilder = txOutputBuilder.with_coin_and_asset(BigNum.from_str(this.state.lovelaceToSend.toString()),multiAsset)

      const txOutput = txOutputBuilder.build();

      txBuilder.add_output(txOutput)

      // Find the available UTXOs in the wallet and
      // us them as Inputs
      const txUnspentOutputs = await this.getTxUnspentOutputs();
      txBuilder.add_inputs_from(txUnspentOutputs, 3)


      // calculate the min fee required and send any change to an address
      txBuilder.add_change_if_needed(shelleyChangeAddress)

      // once the transaction is ready, we build it to get the tx body without witnesses
      const txBody = txBuilder.build();

      // Tx witness
      const transactionWitnessSet = TransactionWitnessSet.new();

      const tx = Transaction.new(
          txBody,
          TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
      )

      let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
      txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

      transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

      const signedTx = Transaction.new(
          tx.body(),
          transactionWitnessSet
      );

      const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
      console.log(submittedTxHash)
      this.setState({submittedTxHash: submittedTxHash, transactionIdLocked: submittedTxHash, lovelaceLocked: this.state.lovelaceToSend})

  }




  buildRedeemAdaFromPlutusScript = async () => {

      const txBuilder = await this.initTransactionBuilder();
      const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
      const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)

      txBuilder.add_input(
          ScriptAddress,
          TransactionInput.new(
              TransactionHash.from_bytes(Buffer.from(this.state.transactionIdLocked, "hex")),
              this.state.transactionIndxLocked.toString()),
          Value.new(BigNum.from_str(this.state.lovelaceLocked.toString()))) // how much lovelace is at that UTXO

      txBuilder.set_fee(BigNum.from_str(Number(this.state.manualFee).toString()))

      const scripts = PlutusScripts.new();
      scripts.add(PlutusScript.from_bytes(Buffer.from(this.state.plutusScriptCborHex, "hex"))); //from cbor of plutus script

      // Add outputs
      const outputVal = this.state.lovelaceLocked.toString() - Number(this.state.manualFee)
      const outputValStr = outputVal.toString();
      txBuilder.add_output(TransactionOutput.new(shelleyChangeAddress, Value.new(BigNum.from_str(outputValStr))))


      // once the transaction is ready, we build it to get the tx body without witnesses
      const txBody = txBuilder.build();

      const collateral = this.state.CollatUtxos;
      const inputs = TransactionInputs.new();
      collateral.forEach((utxo) => {
          inputs.add(utxo.input());
      });

      let datums = PlutusList.new();
      // datums.add(PlutusData.from_bytes(Buffer.from(this.state.datumStr, "utf8")))
      datums.add(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))

      const redeemers = Redeemers.new();

      const data = PlutusData.new_constr_plutus_data(
          ConstrPlutusData.new(
              BigNum.from_str("0"),
              PlutusList.new()
          )
      );

      const redeemer = Redeemer.new(
          RedeemerTag.new_spend(),
          BigNum.from_str("0"),
          data,
          ExUnits.new(
              BigNum.from_str("7000000"),
              BigNum.from_str("3000000000")
          )
      );

      redeemers.add(redeemer)

      // Tx witness
      const transactionWitnessSet = TransactionWitnessSet.new();

      transactionWitnessSet.set_plutus_scripts(scripts)
      transactionWitnessSet.set_plutus_data(datums)
      transactionWitnessSet.set_redeemers(redeemers)

      const cost_model_vals = [197209, 0, 1, 1, 396231, 621, 0, 1, 150000, 1000, 0, 1, 150000, 32, 2477736, 29175, 4, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 100, 100, 29773, 100, 150000, 32, 150000, 32, 150000, 32, 150000, 1000, 0, 1, 150000, 32, 150000, 1000, 0, 8, 148000, 425507, 118, 0, 1, 1, 150000, 1000, 0, 8, 150000, 112536, 247, 1, 150000, 10000, 1, 136542, 1326, 1, 1000, 150000, 1000, 1, 150000, 32, 150000, 32, 150000, 32, 1, 1, 150000, 1, 150000, 4, 103599, 248, 1, 103599, 248, 1, 145276, 1366, 1, 179690, 497, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 148000, 425507, 118, 0, 1, 1, 61516, 11218, 0, 1, 150000, 32, 148000, 425507, 118, 0, 1, 1, 148000, 425507, 118, 0, 1, 1, 2477736, 29175, 4, 0, 82363, 4, 150000, 5000, 0, 1, 150000, 32, 197209, 0, 1, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 3345831, 1, 1];

      const costModel = CostModel.new();
      cost_model_vals.forEach((x, i) => costModel.set(i, Int.new_i32(x)));


      const costModels = Costmdls.new();
      costModels.insert(Language.new_plutus_v1(), costModel);

      const scriptDataHash = hash_script_data(redeemers, costModels, datums);
      txBody.set_script_data_hash(scriptDataHash);

      txBody.set_collateral(inputs)


      const baseAddress = BaseAddress.from_address(shelleyChangeAddress)
      const requiredSigners = Ed25519KeyHashes.new();
      requiredSigners.add(baseAddress.payment_cred().to_keyhash())

      txBody.set_required_signers(requiredSigners);

      const tx = Transaction.new(
          txBody,
          TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
      )

      let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
      txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

      transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

      const signedTx = Transaction.new(
          tx.body(),
          transactionWitnessSet
      );

      const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
      console.log(submittedTxHash)
      this.setState({submittedTxHash});

  }

  buildRedeemTokenFromPlutusScript = async () => {

      const txBuilder = await this.initTransactionBuilder();
      const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
      const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)

      let multiAsset = MultiAsset.new();
      let assets = Assets.new()
      assets.insert(
          AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
          BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
      );

      multiAsset.insert(
          ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
          assets
      );

      txBuilder.add_input(
          ScriptAddress,
          TransactionInput.new(
              TransactionHash.from_bytes(Buffer.from(this.state.transactionIdLocked, "hex")),
              this.state.transactionIndxLocked.toString()),
          Value.new_from_assets(multiAsset)
      ) // how much lovelace is at that UTXO


      txBuilder.set_fee(BigNum.from_str(Number(this.state.manualFee).toString()))

      const scripts = PlutusScripts.new();
      scripts.add(PlutusScript.from_bytes(Buffer.from(this.state.plutusScriptCborHex, "hex"))); //from cbor of plutus script


      // Add outputs
      const outputVal = this.state.lovelaceLocked.toString() - Number(this.state.manualFee)
      const outputValStr = outputVal.toString();

      let txOutputBuilder = TransactionOutputBuilder.new();
      txOutputBuilder = txOutputBuilder.with_address(shelleyChangeAddress);
      txOutputBuilder = txOutputBuilder.next();
      txOutputBuilder = txOutputBuilder.with_coin_and_asset(BigNum.from_str(outputValStr),multiAsset)

      const txOutput = txOutputBuilder.build();
      txBuilder.add_output(txOutput)


      // once the transaction is ready, we build it to get the tx body without witnesses
      const txBody = txBuilder.build();

      const collateral = this.state.CollatUtxos;
      const inputs = TransactionInputs.new();
      collateral.forEach((utxo) => {
          inputs.add(utxo.input());
      });



      let datums = PlutusList.new();
      // datums.add(PlutusData.from_bytes(Buffer.from(this.state.datumStr, "utf8")))
      datums.add(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))

      const redeemers = Redeemers.new();

      const data = PlutusData.new_constr_plutus_data(
          ConstrPlutusData.new(
              BigNum.from_str("0"),
              PlutusList.new()
          )
      );

      const redeemer = Redeemer.new(
          RedeemerTag.new_spend(),
          BigNum.from_str("0"),
          data,
          ExUnits.new(
              BigNum.from_str("7000000"),
              BigNum.from_str("3000000000")
          )
      );

      redeemers.add(redeemer)

      // Tx witness
      const transactionWitnessSet = TransactionWitnessSet.new();

      transactionWitnessSet.set_plutus_scripts(scripts)
      transactionWitnessSet.set_plutus_data(datums)
      transactionWitnessSet.set_redeemers(redeemers)

      const cost_model_vals = [197209, 0, 1, 1, 396231, 621, 0, 1, 150000, 1000, 0, 1, 150000, 32, 2477736, 29175, 4, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 100, 100, 29773, 100, 150000, 32, 150000, 32, 150000, 32, 150000, 1000, 0, 1, 150000, 32, 150000, 1000, 0, 8, 148000, 425507, 118, 0, 1, 1, 150000, 1000, 0, 8, 150000, 112536, 247, 1, 150000, 10000, 1, 136542, 1326, 1, 1000, 150000, 1000, 1, 150000, 32, 150000, 32, 150000, 32, 1, 1, 150000, 1, 150000, 4, 103599, 248, 1, 103599, 248, 1, 145276, 1366, 1, 179690, 497, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 148000, 425507, 118, 0, 1, 1, 61516, 11218, 0, 1, 150000, 32, 148000, 425507, 118, 0, 1, 1, 148000, 425507, 118, 0, 1, 1, 2477736, 29175, 4, 0, 82363, 4, 150000, 5000, 0, 1, 150000, 32, 197209, 0, 1, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 3345831, 1, 1];

      const costModel = CostModel.new();
      cost_model_vals.forEach((x, i) => costModel.set(i, Int.new_i32(x)));


      const costModels = Costmdls.new();
      costModels.insert(Language.new_plutus_v1(), costModel);

      const scriptDataHash = hash_script_data(redeemers, costModels, datums);
      txBody.set_script_data_hash(scriptDataHash);

      txBody.set_collateral(inputs)


      const baseAddress = BaseAddress.from_address(shelleyChangeAddress)
      const requiredSigners = Ed25519KeyHashes.new();
      requiredSigners.add(baseAddress.payment_cred().to_keyhash())

      txBody.set_required_signers(requiredSigners);

      const tx = Transaction.new(
          txBody,
          TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
      )

      let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
      txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

      transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

      const signedTx = Transaction.new(
          tx.body(),
          transactionWitnessSet
      );

      const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
      console.log(submittedTxHash)
      this.setState({submittedTxHash});

  }


  async componentDidMount() {
      await this.refreshData();


  }


  onclick_copy_add()
  {
    //navigator.clipboard.writeText(this.state.changeAddress);
    if (navigator && navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
            .writeText(this.state.changeAddress)
            .then(() => {
                console.log('复制成功');
            })
            .catch(() => {
                console.log('复制失败');
            });
    } else {
        if (copy(this.state.changeAddress)) {
            console.log('复制成功');
        } else {
            console.log('复制失败');
        }
    }


    console.log(this.state.changeAddress);
    this.setState({value: "copied"});
  }

  ononMouseLeave()
  {
    this.setState({value: ""});
  }

  setAddAndLovelace(toAddress,lovelace)
  {
    console.log("toAddress:"+toAddress);
    console.log("lovelace:"+lovelace);
  }

  my_buildSendADATransaction(to_address,ada_mount)
  {


    //await this.generateScriptAddress();
    //this.refreshData();

    console.log("at mywallet ss from_ada_address :", this.state.changeAddress);
    console.log("at mywallet ss send_ada_address :",this.props.send_ada_address);
    console.log("at mywallet ss send_ada_count :",this.props.send_ada_count);
    console.log("to_address :",to_address);
    console.log("ada_mount :",ada_mount);
    console.log("--------------------------");
    this.setState({addressBech32SendADA: to_address})
    this.setState({lovelaceToSend: ada_mount})
    console.log("this.state.addressBech32SendADA:",this.state.addressBech32SendADA);
    console.log("this.state.lovelaceToSend:",this.state.lovelaceToSend);



    //check ada 数量和地址，然后开始转账了。

    this.buildSendADATransaction();
    this.refreshData();
  }



  toDecimal(){
    if (isNaN(this.state.balance)) {
        return;
    }
    return Math.round(this.state.balance)/1000000;
  }

  toDecimalSpinner(){

    return "";
  }


  getNetName()
  {


    if(this.state.networkId == 0)
    {
        return "(testnet)";
    }
    else {
        return "(mainnet)";
    }
  }

  getWalletSVG()
  {

    if(this.props.selectedWallet == "nami")
    {

      return namiSvg;

    }
    else if(this.props.selectedWallet == "eternl" || this.props.selectedWallet == "ccvault")
    {

        return  eternlSvg;
    }
    else if(this.props.selectedWallet == "flint")
    {

        return flintSvg;
    }
    else {
      require('../sunwukong.jpeg');
    }



  }


  render() {
    return (
      <span style={{ whiteSpace: 'pre-wrap'}}>

          <Card  elevation={Elevation.TWO}  style={{display: "block"}} >
              <p onValueChange={this.gotWalletName}>
                <img  style={{ backgroundColor: "white", height: 23,float: "left"  }} src={this.getWalletSVG()}   />
                <h3><b> {this.props.selectedWallet} wallet{this.getNetName()}</b></h3>
              </p>

              <p>
                <h3>{this.toDecimal()}<span>₳</span> </h3>
              </p>
              <span  style={{fontWeight: "bold"}}>Address:
              </span>
               {this.state.showSpinner && <Spinner size={30}  style={{display: "none"}}/>}

              <p style={{ wordWrap: 'break-word', textDecorationLine: 'underline', textDecorationStyle: 'solid'}}>
                 {this.state.changeAddress}
                 <Tooltip  content={this.state.value} position={Position.RIGHT}  >
                        <Button onMouseLeave={this.ononMouseLeave.bind(this)} onClick={this.onclick_copy_add.bind(this)}  icon="clipboard" ></Button>
                 </Tooltip>
              </p>
          </Card>

          <div  style={{display:"none"}}>
                <FormGroup
                    helperText={this.props.send_ada_address}
                    label=""
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({addressBech32SendADA: this.props.send_ada_address})}
                        value={this.props.send_ada_address}

                    />
                </FormGroup>
                <FormGroup
                    helperText=""
                    label=""
                    labelFor=""
                >
                    <NumericInput
                        id="order-amount-input2"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.props.send_ada_count}
                        min={1000000}
                        stepSize={1000000}
                        majorStepSize={1000000}
                        onValueChange={(event) => this.setState({lovelaceToSend: event})}
                    />
                </FormGroup>


          </div>
       </span>

    )
  }

}

export default WalletInfo;
