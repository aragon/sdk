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
<dt><a href="#canVote">canVote(params)</a> ⇒ <code>*</code></dt>
<dd><p>Checks if an user can vote in a proposal</p></dd>
<dt><a href="#addMembersAction">addMembersAction(pluginAddress, members)</a> ⇒ <code>*</code></dt>
<dd><p>Computes the parameters to be given when creating a proposal that adds addresses to address list</p></dd>
<dt><a href="#removeMembersAction">removeMembersAction(pluginAddress, members)</a> ⇒ <code>*</code></dt>
<dd><p>Computes the parameters to be given when creating a proposal that removes addresses from the address list</p></dd>
<dt><a href="#addMembersAction">addMembersAction(data)</a> ⇒ <code>*</code></dt>
<dd><p>Decodes a list of addresses from an encoded add members action</p></dd>
<dt><a href="#removeMembersAction">removeMembersAction(data)</a> ⇒ <code>*</code></dt>
<dd><p>Decodes a list of addresses from an encoded remove members action</p></dd>
<dt><a href="#canVote">canVote(params)</a> ⇒ <code>*</code></dt>
<dd><p>Checks if an user can vote in a proposal</p></dd>
<dt><a href="#mintTokenAction">mintTokenAction(data)</a> ⇒ <code>*</code></dt>
<dd><p>Decodes the mint token params from an encoded mint token action</p></dd>
</dl>

<a name="ClientAddressList"></a>

## ClientAddressList
<p>Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO</p>

**Kind**: global class  

* [ClientAddressList](#ClientAddressList)
    * [.createProposal(_params)](#ClientAddressList.createProposal) ⇒ <code>\*</code>
    * [.voteProposal(proposalId, params)](#ClientAddressList.voteProposal) ⇒ <code>\*</code>
    * [.executeProposal(params)](#ClientAddressList.executeProposal) ⇒ <code>\*</code>
    * [.getMembers()](#ClientAddressList.getMembers) ⇒ <code>\*</code>
    * [.getProposal(proposalId)](#ClientAddressList.getProposal) ⇒ <code>\*</code>
    * [.getProposals()](#ClientAddressList.getProposals) ⇒ <code>\*</code>
    * [.getSettings(pluginAddress)](#ClientAddressList.getSettings) ⇒ <code>\*</code>
    * [.updatePluginSettingsAction(pluginAddress, params)](#ClientAddressList.updatePluginSettingsAction) ⇒ <code>\*</code>
    * [.updatePluginSettingsAction(data)](#ClientAddressList.updatePluginSettingsAction) ⇒ <code>\*</code>
    * [.findInterface(data)](#ClientAddressList.findInterface) ⇒ <code>\*</code>
    * [.createProposal(params)](#ClientAddressList.createProposal) ⇒ <code>\*</code>
    * [.voteProposal(params, vote)](#ClientAddressList.voteProposal) ⇒ <code>\*</code>
    * [.executeProposal(params)](#ClientAddressList.executeProposal) ⇒ <code>\*</code>
    * [.getPluginInstallItem(params)](#ClientAddressList.getPluginInstallItem) ⇒ <code>\*</code>

<a name="ClientAddressList.createProposal"></a>

### ClientAddressList.createProposal(_params) ⇒ <code>\*</code>
<p>Creates a new proposal on the given AddressList plugin contract</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ProposalCreationStepValue>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>ICreateProposalParams</code> | 

<a name="ClientAddressList.voteProposal"></a>

### ClientAddressList.voteProposal(proposalId, params) ⇒ <code>\*</code>
<p>Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<VoteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 
| params | <code>IVoteProposalParams</code> | 

<a name="ClientAddressList.executeProposal"></a>

### ClientAddressList.executeProposal(params) ⇒ <code>\*</code>
<p>Executes the given proposal, provided that it has already passed</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ExecuteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IExecuteProposalParams</code> | 

<a name="ClientAddressList.getMembers"></a>

### ClientAddressList.getMembers() ⇒ <code>\*</code>
<p>Returns the list of wallet addresses with signing capabilities on the plugin</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{Promise&lt;string[]&gt;}</p>  
<a name="ClientAddressList.getProposal"></a>

### ClientAddressList.getProposal(proposalId) ⇒ <code>\*</code>
<p>Returns the details of the given proposal</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{Promise<AddressListProposal>}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="ClientAddressList.getProposals"></a>

### ClientAddressList.getProposals() ⇒ <code>\*</code>
<p>Returns a list of proposals on the Plugin, filtered by the given criteria</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{Promise&lt;AddressListProposalListItem[]&gt;}</p>  

| Type |
| --- |
| <code>IProposalQueryParams</code> | 

<a name="ClientAddressList.getSettings"></a>

### ClientAddressList.getSettings(pluginAddress) ⇒ <code>\*</code>
<p>Returns the settings of a plugin given the address of the plugin instance</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{Promise<IPluginSettings>}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="ClientAddressList.updatePluginSettingsAction"></a>

### ClientAddressList.updatePluginSettingsAction(pluginAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that updates the governance configuration</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| params | <code>IPluginSettings</code> | 

<a name="ClientAddressList.updatePluginSettingsAction"></a>

### ClientAddressList.updatePluginSettingsAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata from an encoded update metadata action</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{IPluginSettings}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientAddressList.findInterface"></a>

### ClientAddressList.findInterface(data) ⇒ <code>\*</code>
<p>Returns the decoded function info given the encoded data of an action</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{IInterfaceParams | null}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientAddressList.createProposal"></a>

### ClientAddressList.createProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a proposal on the plugin</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateProposalParams</code> | 

<a name="ClientAddressList.voteProposal"></a>

### ClientAddressList.voteProposal(params, vote) ⇒ <code>\*</code>
<p>Estimates the gas fee of casting a vote on a proposal</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 
| vote | <code>VoteValues</code> | 

<a name="ClientAddressList.executeProposal"></a>

### ClientAddressList.executeProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of executing an AddressList proposal</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>params</code> | 

<a name="ClientAddressList.getPluginInstallItem"></a>

### ClientAddressList.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>ClientAddressList</code>](#ClientAddressList)  
**Returns**: <code>\*</code> - <p>{FactoryInitParams}</p>  

| Param | Type |
| --- | --- |
| params | <code>IErc20PluginInstall</code> | 

<a name="ClientErc20"></a>

## ClientErc20
<p>Provider a generic client with high level methods to manage and interact an ERC20 Voting plugin installed in a DAO</p>

**Kind**: global class  

* [ClientErc20](#ClientErc20)
    * _instance_
        * [._createProposal()](#ClientErc20+_createProposal)
    * _static_
        * [.createProposal(params)](#ClientErc20.createProposal) ⇒ <code>\*</code>
        * [.voteProposal(params, vote)](#ClientErc20.voteProposal) ⇒ <code>\*</code>
        * [.executeProposal(params)](#ClientErc20.executeProposal) ⇒ <code>\*</code>
        * [.getMembers()](#ClientErc20.getMembers) ⇒ <code>\*</code>
        * [.getProposal(proposalId)](#ClientErc20.getProposal) ⇒ <code>\*</code>
        * [.getProposals(params)](#ClientErc20.getProposals) ⇒ <code>\*</code>
        * [.getSettings(pluginAddress)](#ClientErc20.getSettings) ⇒ <code>\*</code>
        * [.getToken(pluginAddress)](#ClientErc20.getToken) ⇒ <code>\*</code>
        * [.updatePluginSettingsAction(pluginAddress, params)](#ClientErc20.updatePluginSettingsAction) ⇒ <code>\*</code>
        * [.mintTokenAction(minterAddress, params)](#ClientErc20.mintTokenAction) ⇒ <code>\*</code>
        * [.updatePluginSettingsAction(data)](#ClientErc20.updatePluginSettingsAction) ⇒ <code>\*</code>
        * [.findInterface(data)](#ClientErc20.findInterface) ⇒ <code>\*</code>
        * [.createProposal(params)](#ClientErc20.createProposal) ⇒ <code>\*</code>
        * [.voteProposal(params, vote)](#ClientErc20.voteProposal) ⇒ <code>\*</code>
        * [.executeProposal(params)](#ClientErc20.executeProposal) ⇒ <code>\*</code>
        * [.getPluginInstallItem(params)](#ClientErc20.getPluginInstallItem) ⇒ <code>\*</code>

<a name="ClientErc20+_createProposal"></a>

### clientErc20.\_createProposal()
<p>Contains all the generic high level methods to interact with a DAO</p>

**Kind**: instance method of [<code>ClientErc20</code>](#ClientErc20)  
<a name="ClientErc20.createProposal"></a>

### ClientErc20.createProposal(params) ⇒ <code>\*</code>
<p>Creates a new proposal on the given ERC20 plugin contract</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ProposalCreationStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateProposalParams</code> | 

<a name="ClientErc20.voteProposal"></a>

### ClientErc20.voteProposal(params, vote) ⇒ <code>\*</code>
<p>Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<VoteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 
| vote | <code>VoteValues</code> | 

<a name="ClientErc20.executeProposal"></a>

### ClientErc20.executeProposal(params) ⇒ <code>\*</code>
<p>Executes the given proposal, provided that it has already passed</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ExecuteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IExecuteProposalParams</code> | 

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

<a name="ClientErc20.getSettings"></a>

### ClientErc20.getSettings(pluginAddress) ⇒ <code>\*</code>
<p>Returns the settings of a plugin given the address of the plugin instance</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise<IPluginSettings>}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="ClientErc20.getToken"></a>

### ClientErc20.getToken(pluginAddress) ⇒ <code>\*</code>
<p>Returns the details of the token used in a specific plugin instance</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise&lt;Erc20TokenDetails | null&gt;}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="ClientErc20.updatePluginSettingsAction"></a>

### ClientErc20.updatePluginSettingsAction(pluginAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that updates the governance configuration</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| params | <code>IPluginSettings</code> | 

<a name="ClientErc20.mintTokenAction"></a>

### ClientErc20.mintTokenAction(minterAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that mints an amount of ERC-20 tokens to an address</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param |
| --- |
| minterAddress | 
| params | 

<a name="ClientErc20.updatePluginSettingsAction"></a>

### ClientErc20.updatePluginSettingsAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata from an encoded update metadata action</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{IPluginSettings}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientErc20.findInterface"></a>

### ClientErc20.findInterface(data) ⇒ <code>\*</code>
<p>Returns the decoded function info given the encoded data of an action</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{IInterfaceParams | null}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientErc20.createProposal"></a>

### ClientErc20.createProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a proposal on the plugin</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateProposalParams</code> | 

<a name="ClientErc20.voteProposal"></a>

### ClientErc20.voteProposal(params, vote) ⇒ <code>\*</code>
<p>Estimates the gas fee of casting a vote on a proposal</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 
| vote | <code>VoteValues</code> | 

<a name="ClientErc20.executeProposal"></a>

### ClientErc20.executeProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of executing an ERC20 proposal</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IExecuteProposalParams</code> | 

<a name="ClientErc20.getPluginInstallItem"></a>

### ClientErc20.getPluginInstallItem(params) ⇒ <code>\*</code>
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

* [Client](#Client)
    * [.create(params)](#Client.create) ⇒ <code>\*</code>
    * [.deposit(params)](#Client.deposit) ⇒ <code>\*</code>
    * [.getBalances(daoAddressOrEns, tokenAddresses)](#Client.getBalances) ⇒ <code>\*</code>
    * [.getTransfers(daoAddressOrEns)](#Client.getTransfers) ⇒ <code>\*</code>
    * [.getDao(daoAddressOrEns)](#Client.getDao) ⇒ <code>\*</code>
    * [.getDaos(params)](#Client.getDaos) ⇒ <code>\*</code>
    * [.hasPermission(where, who, role, data)](#Client.hasPermission) ⇒ <code>\*</code>
    * [.grantAction(daoAddress, params)](#Client.grantAction) ⇒ <code>\*</code>
    * [.revokeAction(daoAddress, params)](#Client.revokeAction) ⇒ <code>\*</code>
    * [.freezeAction(daoAddress, params)](#Client.freezeAction) ⇒ <code>\*</code>
    * [.withdrawAction(daoAddresOrEns, params)](#Client.withdrawAction) ⇒ <code>\*</code>
    * [.updateMetadataAction(daoAddresOrEns, params)](#Client.updateMetadataAction) ⇒ <code>\*</code>
    * [.grantAction(data)](#Client.grantAction) ⇒ <code>\*</code>
    * [.revokeAction(data)](#Client.revokeAction) ⇒ <code>\*</code>
    * [.freezeAction(data)](#Client.freezeAction) ⇒ <code>\*</code>
    * [.withdrawAction(data)](#Client.withdrawAction) ⇒ <code>\*</code>
    * [.updateMetadataRawAction(data)](#Client.updateMetadataRawAction) ⇒ <code>\*</code>
    * [.updateMetadataAction(data)](#Client.updateMetadataAction) ⇒ <code>\*</code>
    * [.findInterface(data)](#Client.findInterface) ⇒ <code>\*</code>
    * [.create(params)](#Client.create) ⇒ <code>\*</code>
    * [.deposit(params)](#Client.deposit) ⇒ <code>\*</code>

<a name="Client.create"></a>

### Client.create(params) ⇒ <code>\*</code>
<p>Creates a DAO with the given settings and plugins</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<DaoCreationStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateParams</code> | 

<a name="Client.deposit"></a>

### Client.deposit(params) ⇒ <code>\*</code>
<p>Deposits ether or an ERC20 token into the DAO</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<DaoDepositStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IDepositParams</code> | 

<a name="Client.getBalances"></a>

### Client.getBalances(daoAddressOrEns, tokenAddresses) ⇒ <code>\*</code>
<p>Retrieves the asset balances of the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise&lt;AssetBalance[]&gt;}</p>  

| Param | Type |
| --- | --- |
| daoAddressOrEns | <code>string</code> | 
| tokenAddresses | <code>Array.&lt;string&gt;</code> | 

<a name="Client.getTransfers"></a>

### Client.getTransfers(daoAddressOrEns) ⇒ <code>\*</code>
<p>Retrieves the list of asset transfers to and from the given DAO (by default, from ETH, DAI, USDC and USDT, on Mainnet)</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise<IAssetTransfers>}</p>  

| Param | Type |
| --- | --- |
| daoAddressOrEns | <code>string</code> | 

<a name="Client.getDao"></a>

### Client.getDao(daoAddressOrEns) ⇒ <code>\*</code>
<p>Retrieves metadata for DAO with given identifier (address or ens domain)</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise<IAssetTransfers>}</p>  

| Param | Type |
| --- | --- |
| daoAddressOrEns | <code>string</code> | 

<a name="Client.getDaos"></a>

### Client.getDaos(params) ⇒ <code>\*</code>
<p>Retrieves metadata for DAO with given identifier (address or ens domain)</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise&lt;DaoDetails[]&gt;}</p>  

| Param | Type |
| --- | --- |
| params | <code>IDaoQueryParams</code> | 

<a name="Client.hasPermission"></a>

### Client.hasPermission(where, who, role, data) ⇒ <code>\*</code>
<p>Checks whether a role is granted by the current DAO's ACL settings</p>

**Kind**: static method of [<code>Client</code>](#Client)  

| Param | Type |
| --- | --- |
| where | <code>string</code> | 
| who | <code>string</code> | 
| role | <code>DaoRole</code> | 
| data | <code>Uint8Array</code> | 

<a name="Client.grantAction"></a>

### Client.grantAction(daoAddress, params) ⇒ <code>\*</code>
<p>Computes the payload to be given when creating a proposal that grants a permission within a DAO</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise<DaoAction>}</p>  

| Param | Type |
| --- | --- |
| daoAddress | <code>string</code> | 
| params | <code>IGrantPermissionParams</code> | 

<a name="Client.revokeAction"></a>

### Client.revokeAction(daoAddress, params) ⇒ <code>\*</code>
<p>Computes the payload to be given when creating a proposal that revokes a permission within a DAO</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise<DaoAction>}</p>  

| Param | Type |
| --- | --- |
| daoAddress | <code>string</code> | 
| params | <code>IRevokePermissionParams</code> | 

<a name="Client.freezeAction"></a>

### Client.freezeAction(daoAddress, params) ⇒ <code>\*</code>
<p>Computes the payload to be given when creating a proposal that freezes a permission within a DAO</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise<DaoAction>}</p>  

| Param | Type |
| --- | --- |
| daoAddress | <code>string</code> | 
| params | <code>IFreezePermissionParams</code> | 

<a name="Client.withdrawAction"></a>

### Client.withdrawAction(daoAddresOrEns, params) ⇒ <code>\*</code>
<p>Computes the payload to be given when creating a proposal that withdraws ether or an ERC20 token from the DAO</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise<DaoAction>}</p>  

| Param | Type |
| --- | --- |
| daoAddresOrEns | <code>string</code> | 
| params | <code>IWithdrawParams</code> | 

<a name="Client.updateMetadataAction"></a>

### Client.updateMetadataAction(daoAddresOrEns, params) ⇒ <code>\*</code>
<p>Computes the payload to be given when creating a proposal that updates the metadata the DAO</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise<DaoAction>}</p>  

| Param | Type |
| --- | --- |
| daoAddresOrEns | <code>string</code> | 
| params | <code>IMetadata</code> | 

<a name="Client.grantAction"></a>

### Client.grantAction(data) ⇒ <code>\*</code>
<p>Decodes the permission parameters from an encoded grant action</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{IGrantPermissionDecodedParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="Client.revokeAction"></a>

### Client.revokeAction(data) ⇒ <code>\*</code>
<p>Decodes the permission parameters from an encoded revoke action</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{IRevokePermissionDecodedParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="Client.freezeAction"></a>

### Client.freezeAction(data) ⇒ <code>\*</code>
<p>Decodes the freezee parameters from an encoded freeze action</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{IFreezePermissionDecodedParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="Client.withdrawAction"></a>

### Client.withdrawAction(data) ⇒ <code>\*</code>
<p>Decodes the withdraw parameters from an encoded withdraw action</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{IWithdrawParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="Client.updateMetadataRawAction"></a>

### Client.updateMetadataRawAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata ipfs uri from an encoded update metadata action</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{string}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="Client.updateMetadataAction"></a>

### Client.updateMetadataAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata from an encoded update metadata raw action</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise<IMetadata>}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="Client.findInterface"></a>

### Client.findInterface(data) ⇒ <code>\*</code>
<p>Returns the decoded function info given the encoded data of an action</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{IInterfaceParams | null}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="Client.create"></a>

### Client.create(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a DAO</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateParams</code> | 

<a name="Client.deposit"></a>

### Client.deposit(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of depositing ether or an ERC20 token into the DAO</p>

**Kind**: static method of [<code>Client</code>](#Client)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IDepositParams</code> | 

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
<a name="canVote"></a>

## canVote(params) ⇒ <code>\*</code>
<p>Checks if an user can vote in a proposal</p>

**Kind**: global function  
**Returns**: <code>\*</code> - <p>{Promise<boolean>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICanVoteParams</code> | 

<a name="addMembersAction"></a>

## addMembersAction(pluginAddress, members) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that adds addresses to address list</p>

**Kind**: global function  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param |
| --- |
| pluginAddress | 
| members | 

<a name="removeMembersAction"></a>

## removeMembersAction(pluginAddress, members) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that removes addresses from the address list</p>

**Kind**: global function  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param |
| --- |
| pluginAddress | 
| members | 

<a name="addMembersAction"></a>

## addMembersAction(data) ⇒ <code>\*</code>
<p>Decodes a list of addresses from an encoded add members action</p>

**Kind**: global function  
**Returns**: <code>\*</code> - <p>{string[]}</p>  

| Param |
| --- |
| data | 

<a name="removeMembersAction"></a>

## removeMembersAction(data) ⇒ <code>\*</code>
<p>Decodes a list of addresses from an encoded remove members action</p>

**Kind**: global function  
**Returns**: <code>\*</code> - <p>{string[]}</p>  

| Param |
| --- |
| data | 

<a name="canVote"></a>

## canVote(params) ⇒ <code>\*</code>
<p>Checks if an user can vote in a proposal</p>

**Kind**: global function  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<CanVoteStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICanVoteParams</code> | 

<a name="mintTokenAction"></a>

## mintTokenAction(data) ⇒ <code>\*</code>
<p>Decodes the mint token params from an encoded mint token action</p>

**Kind**: global function  
**Returns**: <code>\*</code> - <p>{IMintTokenParams}</p>  

| Param |
| --- |
| data | 

