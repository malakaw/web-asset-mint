import React from 'react'
import { Tab, Tabs, RadioGroup, Radio, FormGroup, InputGroup, NumericInput } from "@blueprintjs/core";
import "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import "../node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css";
import "../node_modules/normalize.css/normalize.css";
import Web3Token from 'web3-cardano-token/dist/browser';
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


//const cose = require('cose-js');

let Buffer = require('buffer/').Buffer
let blake = require('blakejs')


class Monitor extends React.Component
{

    constructor(props)
    {
        super(props);

        this.state = {
            selectedTabId: "1",
            whichWalletSelected: "nami",
            //whichWalletSelected: "ccvault",
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

            addressBech32SendADA: "addr_test1qp5jmy69q6u4tdzcexqhu9wddv362vm50h990q659p6sdw3nny47gune9sz2m2u7k6853398quggwqe9lavzgka2dwasn2n5tt",
            lovelaceToSend: 3000000,
            assetNameHex: "524245525259",
            assetPolicyIdHex: "57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522",
            assetAmountToSend: 5,
            addressScriptBech32: "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8",
            datumStr: "12345678",
            plutusScriptCborHex: "4e4d01000033222220051200120011",
            transactionIdLocked: "",
            transactionIndxLocked: 0,
            lovelaceLocked: 3000000,
            manualFee: 900000,

        }

        /**
         * When the wallet is connect it returns the connector which is
         * written to this API variable and all the other operations
         * run using this API object
         */
        this.API = undefined;

        /**
         * Protocol parameters
         * @type {{
         * keyDeposit: string,
         * coinsPerUtxoWord: string,
         * minUtxo: string,
         * poolDeposit: string,
         * maxTxSize: number,
         * priceMem: number,
         * maxValSize: number,
         * linearFee: {minFeeB: string, minFeeA: string}, priceStep: number
         * }}
         */
        this.protocolParams = {
            linearFee: {
                minFeeA: "44",
                //minFeeB: "155381",
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
    handleWalletSelect = (obj) => {
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
        console.log(Buffer.from(addr.to_bytes(), "utf8").toString("hex"))

        // hash of the address generated using cardano-cli
        const ScriptAddress = Address.from_bech32("addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8");
        console.log(Buffer.from(ScriptAddress.to_bytes(), "utf8").toString("hex"))


        console.log(ScriptAddress.to_bech32())
        console.log(addrBech32)

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
        } else if (wallet === "ccvault") {
            walletFound = !!window?.cardano?.eternl
        } else if (wallet === "flint") {
            walletFound = !!window?.cardano?.flint
        } else if (wallet === "eternl" ) {
            walletFound = !!window?.cardano?.eternl
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

    convertStringToByteArray(str){
       String.prototype.encodeHex = function () {
       var bytes = [];
       for (var i = 0; i < this.length; ++i) {
        bytes.push(this.charCodeAt(i));
       }
       return bytes;
       };

       var byteArray = str.encodeHex();
       return byteArray
    }

    testSignMessage = async () =>{
      const mess = "franco";
      const hex_msg = Buffer.from(mess,"utf8").toString("hex") ;



      console.log("in testSignMessage");
    //  const  addr = "addr_test1qqldhuqh8xgpuwms5tc30a7xwque475h05dmj8ves6trj05tefmez86m7fuvc9m7yhraxwhytunf8x0dyf6uqs62ygusvkwt40";
      const addr = Address.from_bech32("addr_test1qp5jmy69q6u4tdzcexqhu9wddv362vm50h990q659p6sdw3nny47gune9sz2m2u7k6853398quggwqe9lavzgka2dwasn2n5tt");



    //  const  hexMessage = Buffer.from(mess.to_bytes(), "utf8").toString("hex");

    console.log("--1-");
    //this.API.getSharedSecret(this.state.rewardAddress,addr);
    const s_sadd = this.state.usedAddress;

    console.log("this.state.usedAddress:",this.state.usedAddress);



    const sresult =  await this.API.signData(this.state.usedAddress, hex_msg);
    //
    // console.log("--2-");
     console.log(JSON.stringify(sresult));
    // console.log("over?");
    //


    }

    //todo1
    testSignData = async () =>{
      // Connection to Nami wallet
      const cardano = window.cardano;
      //await cardano.eternl.enable();
      await cardano.nami.enable();

      const msg = "{ 'Custom-data': 'some 1custom data' }";
      const hex_msg = Buffer.from(msg ,"utf8").toString("hex") ;
      //const address = (await cardano.getUsedAddresses())[0];
      const address = (await cardano.getRewardAddress());
      //window.cardano.getRewardAddress();

      //const address = (await cardano.getRewardAddress())[0];
      console.log((await cardano.getUsedAddresses()));
      window.cardano.getRewardAddress();
      console.log(address);
      //// TODO: check other addrss
      const addr_c = Address.from_bech32("addr_test1qp5jmy69q6u4tdzcexqhu9wddv362vm50h990q659p6sdw3nny47gune9sz2m2u7k6853398quggwqe9lavzgka2dwasn2n5tt");
      console.log(addr_c);
      console.log(addr_c.to_bytes());
      //const rewardAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()




      //const token = await Web3Token.sign(msg=>cardano.signData(addr_c,hex_msg), '1d');
      console.log(address);
      console.log(typeof address);
      //正确签名 address=“e08bca77911f5bf278cc177e25c7d33ae45f269399ed2275c0434a2239”
      //测试签名 address="33992be472792c04adab9eb68f48c4a70710870325ff58245baa6bbb"

    //  const token = await Web3Token.sign(msg=>cardano.signData("e08bca77911f5bf278cc177e25c7d33ae45f269399ed2275c0434a2239",hex_msg), '1d');
      const token = await Web3Token.sign(msg=>cardano.signData(  "e033992be472792c04adab9eb68f48c4a70710870325ff58245baa6bbb",hex_msg), '1d');


       console.log(JSON.stringify(token));
      // console.log(token["signature"]);
      // console.log(token["key"]);
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

            //
            //await this.testSignMessage();

            //test --api.signData


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
        } else if (wallet === "ccvault") {
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
            //const changeAddress = "addr1qx74skamw9zm4ld9ars4tq5ywlx6wq3z8256feetsj88y8l736zvjdpnycdzh4amacu7cwfawmy2w7pfehwl2ccta67q0y0ltx"
            console.log("changeAddress-1>:",changeAddress);
            this.setState({changeAddress})
            console.log("changeAddress-2>:",changeAddress);
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
            txOutputs.add(utxo.TransactionUnspentOutput);
            console.log("-->",utxo.TransactionUnspentOutput);
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
    buildSendADATransactionMulit = async () => {

        const txBuilder = await this.initTransactionBuilder();
        const shelleyOutputAddress = Address.from_bech32(this.state.addressBech32SendADA);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);


        const shelleyOutputAddress_2 = Address.from_bech32("addr_test1qpxzwxwwecy05etwaeuyu7a03clf03a5cu95k8er6lmuxqur00m8mpmwlexutlnmledw259gzngcq3qw4l3ltzzna8uqf2rs80");

        txBuilder.add_output(
            TransactionOutput.new(
                shelleyOutputAddress,
                Value.new(BigNum.from_str(this.state.lovelaceToSend.toString()))
            ),
        );

        txBuilder.add_output(
            TransactionOutput.new(
                shelleyOutputAddress_2,
                Value.new(BigNum.from_str(this.state.lovelaceToSend.toString()))
            ),
        );

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        //2022-03-24，从1改成2 【The options are 1 for LargestFirst, 2 for RandomImprove, 3 for LargestFirstMultiAsset and 4 for RandomImproveMultiAsset】
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
        this.setState({submittedTxHash});
        console.log("transaction over !");

    }


    buildSendADATransaction = async () => {

        const txBuilder = await this.initTransactionBuilder();
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
        //2022-03-24，从1改成2 【The options are 1 for LargestFirst, 2 for RandomImprove, 3 for LargestFirstMultiAsset and 4 for RandomImproveMultiAsset】
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
        this.setState({submittedTxHash});
        console.log("transaction over !");

    }

  //多个asset
    //todo-build
  buildSendTokenTransactionMulit = async () => {

      console.log("<<---buildSendTokenTransactionMulit->>addressBech32SendADA:",this.state.addressBech32SendADA);
      console.log("changeAddress:",this.state.changeAddress);

      const txBuilder = await this.initTransactionBuilder();

      //发出的地址
//      const shelleyChangeAddress = Address.from_bech32("addr_test1qp5jmy69q6u4tdzcexqhu9wddv362vm50h990q659p6sdw3nny47gune9sz2m2u7k6853398quggwqe9lavzgka2dwasn2n5tt");
      const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);



      let txOutputBuilder = TransactionOutputBuilder.new();
      //接收的地址--1
      //const shelleyOutputAddress = Address.from_bech32(this.state.addressBech32SendADA);
      const shelleyOutputAddress = Address.from_bech32("addr_test1qp5jmy69q6u4tdzcexqhu9wddv362vm50h990q659p6sdw3nny47gune9sz2m2u7k6853398quggwqe9lavzgka2dwasn2n5tt");




      //开始添加output
      txOutputBuilder = txOutputBuilder.with_address(shelleyOutputAddress);
      txOutputBuilder = txOutputBuilder.next();

      console.log("--1--");


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
      //txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))

      txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
      const txOutput = txOutputBuilder.build();

      //一个添加完--1
      txBuilder.add_output(txOutput)
      console.log(JSON.stringify(txOutput));
      console.log("--2--");


      //手动添加第二个
      //接收的地址--2
      let txOutputBuilder_2 = TransactionOutputBuilder.new();
      const shelleyOutputAddress_2 = Address.from_bech32("addr_test1qqrx6dh875pntcwqyga8luq2e8ntp4hu88x5dtp3vezjf9hdf5f65ywwsaqzwkp939sxpa40afnezx8jf09ersmz526qtfw6yv");



      //开始添加output-2
      txOutputBuilder_2 = txOutputBuilder_2.with_address(shelleyOutputAddress_2);
      txOutputBuilder_2 = txOutputBuilder_2.next();



      // let multiAsset_2 = MultiAsset.new();
      // let assets_2 = Assets.new()
      // assets_2.insert(
      //     AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
      //     BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
      // );
      // multiAsset_2.insert(
      //     ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
      //     assets_2
      // );
      txOutputBuilder_2 = txOutputBuilder_2.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
      const txOutput_2 = txOutputBuilder_2.build();



      //添加完--2
      txBuilder.add_output(txOutput_2)
      console.log(JSON.stringify(txOutput_2, null, 2));
      console.log("--3--");


      //开始添加output-3
      // let txOutputBuilder_3 = TransactionOutputBuilder.new();
      // txOutputBuilder_3 = txOutputBuilder_3.with_address(shelleyChangeAddress);
      // txOutputBuilder_3 = txOutputBuilder_3.next();
      //
      // let multiAsset_3 = MultiAsset.new();
      // let assets_3 = Assets.new()
      // assets_3.insert(
      //     AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
      //     BigNum.from_str("") // How much to send
      // );
      // multiAsset_3.insert(
      //     ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
      //     assets
      // );
      //
      // txOutputBuilder_3 = txOutputBuilder_3.with_asset_and_min_required_coin(multiAsset_3, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
      // const txOutput_3 = txOutputBuilder_3.build();
      //
      // txBuilder.add_output(txOutput_3)
      // //开始添加output-3--over


      const shelleyOutputAddress_mine = Address.from_bech32("addr1q8l8g5zdtqun5z8rwdz6n8wa0m72q7ltft8h5fzlq89uz6e4aa3ud0ngs7260qjke82yzx9wxz4dt040ldc0sgsw47dqyagta3");
      txBuilder.add_output(
          TransactionOutput.new(
              shelleyOutputAddress_mine,
              Value.new(BigNum.from_str("1000000"))
          ),
      );


      // Find the available UTXOs in the wallet and
      // us them as Inputs
      const txUnspentOutputs = await this.getTxUnspentOutputs();
      console.log("--3.1--");
      //

      // calculate the min fee required and send any change to an address
      // console.log("--5change[1]--");
      // txBuilder.add_change_if_needed(shelleyChangeAddress)
      // console.log("--5change[2]--");



      //2022-03-24，从1改成2 【The options are 1 for LargestFirst, 2 for RandomImprove, 3 for LargestFirstMultiAsset and 4 for RandomImproveMultiAsset】
      //RandomImproveMultiAsset
      //RandomImproveMultiAsset
      //2022-03-24从 3改成1
      console.log("txUnspentOutputs:",txUnspentOutputs);
      console.log(JSON.stringify(txUnspentOutputs, null, 2));
      txBuilder.add_inputs_from(txUnspentOutputs, 3)

      console.log("--4--");

      // set the time to live - the absolute slot value before the tx becomes invalid
      // txBuilder.set_ttl(51821456);

      // // calculate the min fee required and send any change to an address
      txBuilder.add_change_if_needed(shelleyChangeAddress)
      console.log("--5--");

      // once the transaction is ready, we build it to get the tx body without witnesses
      const txBody = txBuilder.build();
      console.log("--6--");

      // Tx witness
      const transactionWitnessSet = TransactionWitnessSet.new();
      console.log("--7--");

      const tx = Transaction.new(
          txBody,
          TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
      )

      let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
      txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

      transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
      console.log("--8--");

      const signedTx = Transaction.new(
          tx.body(),
          transactionWitnessSet
      );
      console.log("--9--");

      const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
      console.log("--10--");

      console.log(submittedTxHash)
      this.setState({submittedTxHash});

      // const txBodyCborHex_unsigned = Buffer.from(txBody.to_bytes(), "utf8").toString("hex");
      // this.setState({txBodyCborHex_unsigned, txBody})

  }

  buildSendTokenTransaction3 = async () => {

    console.log("o--addressBech32SendADA:",this.state.addressBech32SendADA);
    console.log("o--changeAddress:",this.state.changeAddress);


      const txBuilder = await this.initTransactionBuilder();
      //out put address 1
      const shelleyOutputAddress = Address.from_bech32(this.state.addressBech32SendADA);
      //out put address 2
      const shelleyOutputAddress2 = Address.from_bech32("addr_test1qqrx6dh875pntcwqyga8luq2e8ntp4hu88x5dtp3vezjf9hdf5f65ywwsaqzwkp939sxpa40afnezx8jf09ersmz526qtfw6yv");
      //in put address
      const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);

      console.log("begin process output 1 ");
      //begin 处理txOutput--1
      let txOutputBuilder = TransactionOutputBuilder.new();
      txOutputBuilder = txOutputBuilder.with_address(shelleyOutputAddress);
      txOutputBuilder = txOutputBuilder.next();

      let multiAsset = MultiAsset.new();
      let assets = Assets.new()
      assets.insert(
          AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
          BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
          //BigNum.from_str("5") // How much to send
      );
      multiAsset.insert(
          ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
          assets
      );

      txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
      const txOutput = txOutputBuilder.build();

      txBuilder.add_output(txOutput);
      console.log("end process output 1 ");
      //end 处理txOutput--1

      //begin 处理txOutput--2
      console.log("begin process output 2 ");
      let txOutputBuilder2 = TransactionOutputBuilder.new();
      txOutputBuilder2 = txOutputBuilder2.with_address(shelleyOutputAddress2);
      txOutputBuilder2 = txOutputBuilder2.next();
      let multiAsset2 = MultiAsset.new();
      let assets2 = Assets.new()
      assets2.insert(
          AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
        //  BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
          BigNum.from_str("5") // How much to send
      );
      multiAsset2.insert(
          ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
          assets2
      );
      txOutputBuilder2 = txOutputBuilder2.with_asset_and_min_required_coin(multiAsset2, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
      const txOutput2 = txOutputBuilder2.build();

    //  txBuilder.add_output(txOutput2);
      console.log("end process output 2 ");
      //end 处理txOutput--2



      // Find the available UTXOs in the wallet and
      // us them as Inputs
      const txUnspentOutputs = await this.getTxUnspentOutputs();
      console.log(JSON.stringify(txUnspentOutputs, null, 2));
      //2022-03-24，从1改成2 【The options are 1 for LargestFirst, 2 for RandomImprove, 3 for LargestFirstMultiAsset and 4 for RandomImproveMultiAsset】
      //2022-03-24从 3改成1,再从1改成3是ok的；
      console.log("body-0--");
      txBuilder.add_inputs_from(txUnspentOutputs, 4)
      console.log("body-1--");

      // set the time to live - the absolute slot value before the tx becomes invalid
      // txBuilder.set_ttl(51821456);

      // calculate the min fee required and send any change to an address
      txBuilder.add_change_if_needed(shelleyChangeAddress)

      // once the transaction is ready, we build it to get the tx body without witnesses
      const txBody = txBuilder.build();
      console.log("body-2--");
      // Tx witness
      const transactionWitnessSet = TransactionWitnessSet.new();

      console.log(txBody);
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

  buildSendTokenTransaction2 = async () => {

    console.log("o--addressBech32SendADA:",this.state.addressBech32SendADA);
    console.log("o--changeAddress:",this.state.changeAddress);


    const tx_ = "84a3008182582018f7d8e7044ecb5206fd8129e2e30ba07cb1635782b17d0bf2f8545da82a978802018382583900066d36e7f50335e1c0223a7ff00ac9e6b0d6fc39cd46ac3166452496ed4d13aa11ce8740275825896060f6afea679118f24bcb91c362a2b4821a0014851ea1581c126b8676446c84a5cd6e3259223b16a2314c5676b88ae1c1f8579a8fa1477453554e44414503825839004777da2241d360c1e30ad6ed5332dbe896007c25686a992ce9d3a75f73f73e9293141d8dcbb222ed576c22436146227abfa8e6417eeb2f5f821a0014851ea1581c126b8676446c84a5cd6e3259223b16a2314c5676b88ae1c1f8579a8fa1477453554e444145038258390050db6e95070dc28a9f54bf7c67aec494301344128d152e0679f2ed9d60dab3e35eac3b22b03ec02e189ce8e1e5bf18097c2fe2396651a152821a040a03c2a1581c126b8676446c84a5cd6e3259223b16a2314c5676b88ae1c1f8579a8fa1477453554e4441451853021a0002c221a0f5f6";

    const tx_o = Transaction.from_bytes(Buffer.from(tx_, "hex"));
    const txBody = tx_o.body();



    // Tx witness
    const transactionWitnessSet = TransactionWitnessSet.new();

    const tx = Transaction.new(
        txBody,
        TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
    )

    let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx_o.to_bytes(), "utf8").toString("hex"), true);
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


    buildSendTokenTransaction = async () => {

      console.log("o--addressBech32SendADA:",this.state.addressBech32SendADA);
      console.log("o--changeAddress:",this.state.changeAddress);


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
        console.log(JSON.stringify(txUnspentOutputs, null, 2));
        //2022-03-24，从1改成2 【The options are 1 for LargestFirst, 2 for RandomImprove, 3 for LargestFirstMultiAsset and 4 for RandomImproveMultiAsset】
        //2022-03-24从 3改成1,再从1改成3是ok的；
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
        //2022-03-24从 3改成1
        txBuilder.add_inputs_from(txUnspentOutputs, 1)


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
        //2022-03-24从 3改成1
        txBuilder.add_inputs_from(txUnspentOutputs, 1)


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

    render()
    {

        return (
            <div style={{margin: "20px"}}>



                <h1>Boilerplate wxj DApp connector to Wallet</h1>
                <div style={{paddingTop: "10px"}}>
                    <RadioGroup
                        label="Select Wallet:"
                        onChange={this.handleWalletSelect}
                        selectedValue={this.state.whichWalletSelected}
                        inline={true}
                    >
                        <Radio label="Nami" value="nami" />
                        <Radio label="CCvault" value="ccvault" />
                        <Radio label="Flint" value="flint" />
                    </RadioGroup>
                </div>



                <button style={{padding: "20px"}} onClick={this.refreshData}>Refresh</button>

                <p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>Wallet Found: </span>{`${this.state.walletFound}`}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet Connected: </span>{`${this.state.walletIsEnabled}`}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet API version: </span>{this.state.walletAPIVersion}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet name: </span>{this.state.walletName}</p>

                <p><span style={{fontWeight: "bold"}}>Network Id (0 = testnet; 1 = mainnet): </span>{this.state.networkId}</p>
                <p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>
                UTXOs: (UTXO #txid = ADA amount + AssetAmount + policyId.AssetName + ...): </span>{this.state.Utxos?.map(x => <li style={{fontSize: "10px"}} key={`${x.str}${x.multiAssetStr}`}>{`${x.str}${x.multiAssetStr}`}</li>)}</p>
                <p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>Balance: </span>{this.state.balance}</p>
                <p><span style={{fontWeight: "bold"}}>Change Address: </span>{this.state.changeAddress}</p>
                <p><span style={{fontWeight: "bold"}}>Staking Address: </span>{this.state.rewardAddress}</p>
                <p><span style={{fontWeight: "bold"}}>Used Address: </span>{this.state.usedAddress}</p>
                <hr style={{marginTop: "40px", marginBottom: "40px"}}/>

                <Tabs id="TabsExample" vertical={true} onChange={this.handleTabId} selectedTabId={this.state.selectedTabId}>
                    <Tab id="1" title="1. Send ADA to Address" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText="insert an address where you want to send some ADA ..."
                                label="Address where to send ADA"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({addressBech32SendADA: event.target.value})}
                                    value={this.state.addressBech32SendADA}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Adjust Order Amount ..."
                                label="Lovelaces (1 000 000 lovelaces = 1 ADA)"
                                labelFor="order-amount-input2"
                            >
                                <NumericInput
                                    id="order-amount-input2"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.lovelaceToSend}
                                    min={1000000}
                                    stepSize={1000000}
                                    majorStepSize={1000000}
                                    onValueChange={(event) => this.setState({lovelaceToSend: event})}
                                />
                            </FormGroup>

                            <button style={{padding: "10px"}} onClick={this.buildSendADATransactionMulit}>Run</button>
                        </div>
                    } />
                    <Tab id="2" title="2. Send Token to Address" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText="insert an address where you want to send some ADA ..."
                                label="Address where to send ADA"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({addressBech32SendADA: event.target.value})}
                                    value={this.state.addressBech32SendADA}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Make sure you have enough of Asset in your wallet ..."
                                label="Amount of Assets to Send"
                                labelFor="asset-amount-input"
                            >
                                <NumericInput
                                    id="asset-amount-input"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.assetAmountToSend}
                                    min={1}
                                    stepSize={1}
                                    majorStepSize={1}
                                    onValueChange={(event) => this.setState({assetAmountToSend: event})}
                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Hex of the Policy Id"
                                label="Asset PolicyId"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({assetPolicyIdHex: event.target.value})}
                                    value={this.state.assetPolicyIdHex}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Hex of the Asset Name"
                                label="Asset Name"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({assetNameHex: event.target.value})}
                                    value={this.state.assetNameHex}

                                />
                            </FormGroup>

                            <button style={{padding: "10px"}} onClick={this.buildSendTokenTransaction2}>R1un</button>
                        </div>
                    } />
                    <Tab id="3" title="3. Send ADA to Plutus Script" panel={
                        <div style={{marginLeft: "20px"}}>
                            <FormGroup
                                helperText="insert a Script address where you want to send some ADA ..."
                                label="Script Address where to send ADA"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({addressScriptBech32: event.target.value})}
                                    value={this.state.addressScriptBech32}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Adjust Order Amount ..."
                                label="Lovelaces (1 000 000 lovelaces = 1 ADA)"
                                labelFor="order-amount-input2"
                            >
                                <NumericInput
                                    id="order-amount-input2"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.lovelaceToSend}
                                    min={1000000}
                                    stepSize={1000000}
                                    majorStepSize={1000000}
                                    onValueChange={(event) => this.setState({lovelaceToSend: event})}
                                />
                            </FormGroup>
                            <FormGroup
                                helperText="insert a Datum ..."
                                label="Datum that locks the ADA at the script address ..."
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({datumStr: event.target.value})}
                                    value={this.state.datumStr}

                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={this.buildSendAdaToPlutusScript}>Run</button>
                        </div>
                    } />
                    <Tab id="4" title="4. Send Token to Plutus Script" panel={
                        <div style={{marginLeft: "20px"}}>
                            <FormGroup
                                helperText="Script address where ADA is locked ..."
                                label="Script Address"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({addressScriptBech32: event.target.value})}
                                    value={this.state.addressScriptBech32}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Need to send ADA with Tokens ..."
                                label="Lovelaces (1 000 000 lovelaces = 1 ADA)"
                                labelFor="order-amount-input2"
                            >
                                <NumericInput
                                    id="order-amount-input2"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.lovelaceToSend}
                                    min={1000000}
                                    stepSize={1000000}
                                    majorStepSize={1000000}
                                    onValueChange={(event) => this.setState({lovelaceToSend: event})}
                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Make sure you have enough of Asset in your wallet ..."
                                label="Amount of Assets to Send"
                                labelFor="asset-amount-input"
                            >
                                <NumericInput
                                    id="asset-amount-input"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.assetAmountToSend}
                                    min={1}
                                    stepSize={1}
                                    majorStepSize={1}
                                    onValueChange={(event) => this.setState({assetAmountToSend: event})}
                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Hex of the Policy Id"
                                label="Asset PolicyId"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({assetPolicyIdHex: event.target.value})}
                                    value={this.state.assetPolicyIdHex}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Hex of the Asset Name"
                                label="Asset Name"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({assetNameHex: event.target.value})}
                                    value={this.state.assetNameHex}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="insert a Datum ..."
                                label="Datum that locks the ADA at the script address ..."
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({datumStr: event.target.value})}
                                    value={this.state.datumStr}

                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={this.buildSendTokenToPlutusScript}>Run</button>
                        </div>
                    } />
                    <Tab id="5" title="5. Redeem ADA from Plutus Script" panel={
                        <div style={{marginLeft: "20px"}}>
                            <FormGroup
                                helperText="Script address where ADA is locked ..."
                                label="Script Address"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({addressScriptBech32: event.target.value})}
                                    value={this.state.addressScriptBech32}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="content of the plutus script encoded as CborHex ..."
                                label="Plutus Script CborHex"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({plutusScriptCborHex: event.target.value})}
                                    value={this.state.plutusScriptCborHex}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Transaction hash ... If empty then run n. 3 first to lock some ADA"
                                label="UTXO where ADA is locked"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({transactionIdLocked: event.target.value})}
                                    value={this.state.transactionIdLocked}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="UTXO IndexId#, usually it's 0 ..."
                                label="Transaction Index #"
                                labelFor="order-amount-input2"
                            >
                                <NumericInput
                                    id="order-amount-input2"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.transactionIndxLocked}
                                    min={0}
                                    stepSize={1}
                                    majorStepSize={1}
                                    onValueChange={(event) => this.setState({transactionIndxLocked: event})}
                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Adjust Order Amount ..."
                                label="Lovelaces (1 000 000 lovelaces = 1 ADA)"
                                labelFor="order-amount-input2"
                            >
                                <NumericInput
                                    id="order-amount-input2"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.lovelaceLocked}
                                    min={1000000}
                                    stepSize={1000000}
                                    majorStepSize={1000000}
                                    onValueChange={(event) => this.setState({lovelaceLocked: event})}
                                />
                            </FormGroup>
                            <FormGroup
                                helperText="insert a Datum ..."
                                label="Datum that unlocks the ADA at the script address ..."
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({datumStr: event.target.value})}
                                    value={this.state.datumStr}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Needs to be enough to execute the contract ..."
                                label="Manual Fee"
                                labelFor="order-amount-input2"
                            >
                                <NumericInput
                                    id="order-amount-input2"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.manualFee}
                                    min={160000}
                                    stepSize={100000}
                                    majorStepSize={100000}
                                    onValueChange={(event) => this.setState({manualFee: event})}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={this.buildRedeemAdaFromPlutusScript}>Run</button>
                            {/*<button style={{padding: "10px"}} onClick={this.signTransaction}>2. Sign Transaction</button>*/}
                            {/*<button style={{padding: "10px"}} onClick={this.submitTransaction}>3. Submit Transaction</button>*/}
                        </div>
                    } />
                    <Tab id="6" title="6. Redeem Tokens from Plutus Script" panel={
                        <div style={{marginLeft: "20px"}}>
                            <FormGroup
                                helperText="Script address where ADA is locked ..."
                                label="Script Address"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({addressScriptBech32: event.target.value})}
                                    value={this.state.addressScriptBech32}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="content of the plutus script encoded as CborHex ..."
                                label="Plutus Script CborHex"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({plutusScriptCborHex: event.target.value})}
                                    value={this.state.plutusScriptCborHex}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Transaction hash ... If empty then run n. 3 first to lock some ADA"
                                label="UTXO where ADA is locked"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({transactionIdLocked: event.target.value})}
                                    value={this.state.transactionIdLocked}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="UTXO IndexId#, usually it's 0 ..."
                                label="Transaction Index #"
                                labelFor="order-amount-input2"
                            >
                                <NumericInput
                                    id="order-amount-input2"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.transactionIndxLocked}
                                    min={0}
                                    stepSize={1}
                                    majorStepSize={1}
                                    onValueChange={(event) => this.setState({transactionIndxLocked: event})}
                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Adjust Order Amount ..."
                                label="Lovelaces (1 000 000 lovelaces = 1 ADA)"
                                labelFor="order-amount-input2"
                            >
                                <NumericInput
                                    id="order-amount-input2"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.lovelaceLocked}
                                    min={1000000}
                                    stepSize={1000000}
                                    majorStepSize={1000000}
                                    onValueChange={(event) => this.setState({lovelaceLocked: event})}
                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Make sure you have enough of Asset in your wallet ..."
                                label="Amount of Assets to Reedem"
                                labelFor="asset-amount-input"
                            >
                                <NumericInput
                                    id="asset-amount-input"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.assetAmountToSend}
                                    min={1}
                                    stepSize={1}
                                    majorStepSize={1}
                                    onValueChange={(event) => this.setState({assetAmountToSend: event})}
                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Hex of the Policy Id"
                                label="Asset PolicyId"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({assetPolicyIdHex: event.target.value})}
                                    value={this.state.assetPolicyIdHex}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Hex of the Asset Name"
                                label="Asset Name"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({assetNameHex: event.target.value})}
                                    value={this.state.assetNameHex}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="insert a Datum ..."
                                label="Datum that unlocks the ADA at the script address ..."
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({datumStr: event.target.value})}
                                    value={this.state.datumStr}

                                />
                            </FormGroup>
                            <FormGroup
                                helperText="Needs to be enough to execute the contract ..."
                                label="Manual Fee"
                                labelFor="order-amount-input2"
                            >
                                <NumericInput
                                    id="order-amount-input2"
                                    disabled={false}
                                    leftIcon={"variable"}
                                    allowNumericCharactersOnly={true}
                                    value={this.state.manualFee}
                                    min={160000}
                                    stepSize={100000}
                                    majorStepSize={100000}
                                    onValueChange={(event) => this.setState({manualFee: event})}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={this.buildRedeemTokenFromPlutusScript}>Run</button>

                        </div>

                    } />
                    <Tabs.Expander />
                    <button style={{padding: "10px"}} onClick={async() => {await this.testSignData();}}>signD</button>
                    <button style={{padding: "10px"}} onClick={async() => {await this.testSignMessage();}}>signM</button>
                </Tabs>

                <hr style={{marginTop: "40px", marginBottom: "40px"}}/>

                {/*<p>{`Unsigned txBodyCborHex: ${this.state.txBodyCborHex_unsigned}`}</p>*/}
                {/*<p>{`Signed txBodyCborHex: ${this.state.txBodyCborHex_signed}`}</p>*/}
                <p>{`Submitted Tx Hash: ${this.state.submittedTxHash}`}</p>
                <p>{this.state.submittedTxHash ? 'check your wallet !' : ''}</p>



            </div>
        )
    }
}
export default Monitor;
