## Classes

<dl>
<dt><a href="#ClientAddressList">ClientAddressList</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO</p></dd>
<dt><a href="#ClientErc20">ClientErc20</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact an ERC20 Voting plugin installed in a DAO</p></dd>
<dt><a href="#Client">Client</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact with DAO's</p></dd>
<dt><a href="#ContextPlugin">ContextPlugin</a></dt>
<dd></dd>
<dt><a href="#Context">Context</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#network">network</a> ⇒ <code>Networkish</code></dt>
<dd><p>Getter for the network</p></dd>
<dt><a href="#signer">signer</a> ⇒ <code>Signer</code></dt>
<dd><p>Getter for the Signer</p></dd>
<dt><a href="#web3Providers">web3Providers</a> ⇒ <code>Array.&lt;JsonRpcProvider&gt;</code></dt>
<dd><p>Getter for the web3 providers</p></dd>
<dt><a href="#daoFactoryAddress">daoFactoryAddress</a> ⇒ <code>string</code></dt>
<dd><p>Getter for daoFactoryAddress property</p></dd>
<dt><a href="#gasFeeEstimationFactor">gasFeeEstimationFactor</a> ⇒ <code>number</code></dt>
<dd><p>Getter for the gas fee reducer used in estimations</p></dd>
<dt><a href="#ipfs">ipfs</a> ⇒ <code>Array.&lt;IpfsClient&gt;</code> | <code>undefined</code></dt>
<dd><p>Getter for the IPFS http client</p></dd>
<dt><a href="#graphql">graphql</a> ⇒ <code>Array.&lt;GraphQLClient&gt;</code> | <code>undefined</code></dt>
<dd><p>Getter for the GraphQL client</p></dd>
</dl>

<a name="ClientAddressList"></a>

## ClientAddressList
<p>Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO</p>

**Kind**: global class  
<a name="ClientAddressList.getPluginInstallItem"></a>

### ClientAddressList.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>IAddressListPluginInstall</code> | 

<a name="ClientErc20"></a>

## ClientErc20
<p>Provider a generic client with high level methods to manage and interact an ERC20 Voting plugin installed in a DAO</p>

**Kind**: global class  
<a name="ClientErc20.getPluginInstallItem"></a>

### ClientErc20.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>IErc20PluginInstall</code> | 

<a name="Client"></a>

## Client
<p>Provider a generic client with high level methods to manage and interact with DAO's</p>

**Kind**: global class  
<a name="ContextPlugin"></a>

## ContextPlugin
**Kind**: global class  

* [ContextPlugin](#ContextPlugin)
    * [new ContextPlugin(params)](#new_ContextPlugin_new)
    * [.fromContext(ctx, pluginAddress)](#ContextPlugin.fromContext) ⇒ <code>\*</code>

<a name="new_ContextPlugin_new"></a>

### new ContextPlugin(params)

| Param | Type | Description |
| --- | --- | --- |
| params | <code>ContextPluginParams</code> | <p>The parameters for the client context</p> |

<a name="ContextPlugin.fromContext"></a>

### ContextPlugin.fromContext(ctx, pluginAddress) ⇒ <code>\*</code>
<p>Generate a plugin context from a client clontext and a plugin address</p>

**Kind**: static method of [<code>ContextPlugin</code>](#ContextPlugin)  
**Returns**: <code>\*</code> - <p>{ContextPlugin}</p>  

| Param | Type |
| --- | --- |
| ctx | [<code>Context</code>](#Context) | 
| pluginAddress | <code>string</code> | 

<a name="Context"></a>

## Context
**Kind**: global class  
<a name="new_Context_new"></a>

### new Context(params)

| Param | Type |
| --- | --- |
| params | <code>Object</code> | 

<a name="network"></a>

## network ⇒ <code>Networkish</code>
<p>Getter for the network</p>

**Kind**: global variable  
**Access**: public  
<a name="signer"></a>

## signer ⇒ <code>Signer</code>
<p>Getter for the Signer</p>

**Kind**: global variable  
**Access**: public  
<a name="web3Providers"></a>

## web3Providers ⇒ <code>Array.&lt;JsonRpcProvider&gt;</code>
<p>Getter for the web3 providers</p>

**Kind**: global variable  
**Access**: public  
<a name="daoFactoryAddress"></a>

## daoFactoryAddress ⇒ <code>string</code>
<p>Getter for daoFactoryAddress property</p>

**Kind**: global variable  
**Access**: public  
<a name="gasFeeEstimationFactor"></a>

## gasFeeEstimationFactor ⇒ <code>number</code>
<p>Getter for the gas fee reducer used in estimations</p>

**Kind**: global variable  
**Access**: public  
<a name="ipfs"></a>

## ipfs ⇒ <code>Array.&lt;IpfsClient&gt;</code> \| <code>undefined</code>
<p>Getter for the IPFS http client</p>

**Kind**: global variable  
**Access**: public  
<a name="graphql"></a>

## graphql ⇒ <code>Array.&lt;GraphQLClient&gt;</code> \| <code>undefined</code>
<p>Getter for the GraphQL client</p>

**Kind**: global variable  
**Access**: public  
