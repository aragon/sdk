## Classes

<dl>
<dt><a href="#ClientErc20">ClientErc20</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact with DAO's</p></dd>
<dt><a href="#Client">Client</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact with DAO's</p></dd>
<dt><a href="#ContextPlugin">ContextPlugin</a></dt>
<dd></dd>
<dt><a href="#Context">Context</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#pluginAddress">pluginAddress</a> ⇒ <code>string</code></dt>
<dd><p>Returns the plugin contract address used to interact with</p></dd>
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

## Functions

<dl>
<dt><a href="#create">create()</a></dt>
<dd><p>Created a DAO with the given parameters and plugins</p></dd>
<dt><a href="#deposit">deposit()</a></dt>
<dd><p>Deposits ether or an ERC20 token</p></dd>
<dt><a href="#getBalances">getBalances()</a></dt>
<dd><p>Retrieves the asset balances of the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet</p></dd>
<dt><a href="#getTransfers">getTransfers()</a></dt>
<dd><p>Retrieves the list of asset transfers to and from the given DAO, by default, from ETH, DAI, USDC and USDT on Mainnet</p></dd>
<dt><a href="#getDao">getDao()</a></dt>
<dd><p>Retrieves metadata for DAO with given identifier (address or ens domain)</p></dd>
<dt><a href="#getDaos">getDaos()</a></dt>
<dd><p>Retrieves metadata for DAO with given identifier (address or ens domain)</p></dd>
<dt><a href="#hasPermission">hasPermission()</a></dt>
<dd><p>Checks whether a role is granted by the current DAO's ACL settings</p></dd>
</dl>

<a name="ClientErc20"></a>

## ClientErc20
<p>Provider a generic client with high level methods to manage and interact with DAO's</p>

**Kind**: global class  

* [ClientErc20](#ClientErc20)
    * _instance_
        * [._createProposal()](#ClientErc20+_createProposal)
    * _static_
        * [.installEntry(params)](#ClientErc20.installEntry) ⇒ <code>\*</code>
        * [.createProposal(params)](#ClientErc20.createProposal) ⇒ <code>\*</code>
        * [.voteProposal(proposalId, vote)](#ClientErc20.voteProposal) ⇒ <code>\*</code>
        * [.executeProposal(proposalId)](#ClientErc20.executeProposal) ⇒ <code>\*</code>
        * [.getMembers()](#ClientErc20.getMembers) ⇒ <code>\*</code>
        * [.getProposal(proposalId)](#ClientErc20.getProposal) ⇒ <code>\*</code>
        * [.getProposals(params)](#ClientErc20.getProposals) ⇒ <code>\*</code>
        * [.createProposal(params)](#ClientErc20.createProposal) ⇒ <code>\*</code>
        * [.voteProposal(proposalId, vote)](#ClientErc20.voteProposal) ⇒ <code>\*</code>
        * [.executeProposal(proposalId)](#ClientErc20.executeProposal) ⇒ <code>\*</code>
        * [.installEntry(params)](#ClientErc20.installEntry) ⇒ <code>\*</code>

<a name="ClientErc20+_createProposal"></a>

### clientErc20.\_createProposal()
<p>Contains all the generic high level methods to interact with a DAO</p>

**Kind**: instance method of [<code>ClientErc20</code>](#ClientErc20)  
<a name="ClientErc20.installEntry"></a>

### ClientErc20.installEntry(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{FactoryInitParams}</p>  

| Param | Type |
| --- | --- |
| params | <code>IErc20PluginInstall</code> | 

<a name="ClientErc20.createProposal"></a>

### ClientErc20.createProposal(params) ⇒ <code>\*</code>
<p>Creates a new proposal on the given ERC20 plugin contract</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ProposalCreationStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateProposal</code> | 

<a name="ClientErc20.voteProposal"></a>

### ClientErc20.voteProposal(proposalId, vote) ⇒ <code>\*</code>
<p>Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<VoteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 
| vote | <code>VoteValues</code> | 

<a name="ClientErc20.executeProposal"></a>

### ClientErc20.executeProposal(proposalId) ⇒ <code>\*</code>
<p>Executes the given proposal, provided that it has already passed</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ExecuteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="ClientErc20.getMembers"></a>

### ClientErc20.getMembers() ⇒ <code>\*</code>
<p>Returns the list of wallet addresses holding tokens from the underlying ERC20 contract used by the plugin</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise&lt;string[]&gt;}</p>  
<a name="ClientErc20.getProposal"></a>

### ClientErc20.getProposal(proposalId) ⇒ <code>\*</code>
<p>Returns the details of the given proposal</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise<Erc20Proposal>}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="ClientErc20.getProposals"></a>

### ClientErc20.getProposals(params) ⇒ <code>\*</code>
<p>Returns a list of proposals on the Plugin, filtered by the given criteria</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise&lt;Erc20ProposalListItem[]&gt;}</p>  

| Param | Type |
| --- | --- |
| params | <code>IProposalQueryParams</code> | 

<a name="ClientErc20.createProposal"></a>

### ClientErc20.createProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a proposal on the plugin</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateProposal</code> | 

<a name="ClientErc20.voteProposal"></a>

### ClientErc20.voteProposal(proposalId, vote) ⇒ <code>\*</code>
<p>Estimates the gas fee of casting a vote on a proposal</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 
| vote | <code>VoteValues</code> | 

<a name="ClientErc20.executeProposal"></a>

### ClientErc20.executeProposal(proposalId) ⇒ <code>\*</code>
<p>Estimates the gas fee of executing an ERC20 proposal</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="ClientErc20.installEntry"></a>

### ClientErc20.installEntry(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{FactoryInitParams}</p>  

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

<a name="pluginAddress"></a>

## pluginAddress ⇒ <code>string</code>
<p>Returns the plugin contract address used to interact with</p>

**Kind**: global variable  
**Access**: public  
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
<a name="create"></a>

## create()
<p>Created a DAO with the given parameters and plugins</p>

**Kind**: global function  
<a name="deposit"></a>

## deposit()
<p>Deposits ether or an ERC20 token</p>

**Kind**: global function  
<a name="getBalances"></a>

## getBalances()
<p>Retrieves the asset balances of the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet</p>

**Kind**: global function  
<a name="getTransfers"></a>

## getTransfers()
<p>Retrieves the list of asset transfers to and from the given DAO, by default, from ETH, DAI, USDC and USDT on Mainnet</p>

**Kind**: global function  
<a name="getDao"></a>

## getDao()
<p>Retrieves metadata for DAO with given identifier (address or ens domain)</p>

**Kind**: global function  
<a name="getDaos"></a>

## getDaos()
<p>Retrieves metadata for DAO with given identifier (address or ens domain)</p>

**Kind**: global function  
<a name="hasPermission"></a>

## hasPermission()
<p>Checks whether a role is granted by the current DAO's ACL settings</p>

**Kind**: global function  
