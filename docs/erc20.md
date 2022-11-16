## Classes

<dl>
<dt><a href="#ClientErc20">ClientErc20</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact an ERC20 Voting plugin installed in a DAO</p></dd>
<dt><a href="#ClientErc20Decoding">ClientErc20Decoding</a></dt>
<dd><p>Decoding module the SDK ERC20 Client</p></dd>
<dt><a href="#ClientErc20Encoding">ClientErc20Encoding</a></dt>
<dd><p>Encoding module the SDK ERC20 Client</p></dd>
<dt><a href="#ClientErc20Estimation">ClientErc20Estimation</a></dt>
<dd><p>Estimation module the SDK ERC20 Client</p></dd>
<dt><a href="#ClientErc20Methods">ClientErc20Methods</a></dt>
<dd><p>Methods module the SDK ERC20 Client</p></dd>
</dl>

<a name="ClientErc20"></a>

## ClientErc20
<p>Provider a generic client with high level methods to manage and interact an ERC20 Voting plugin installed in a DAO</p>

**Kind**: global class  

* [ClientErc20](#ClientErc20)
    * [.getPluginInstallItem(params)](#ClientErc20.getPluginInstallItem) ⇒ <code>\*</code>
    * [.ClientErc20Methods#createProposal(params)](#ClientErc20.ClientErc20Methods+createProposal) ⇒ <code>\*</code>
    * [.ClientErc20Methods#voteProposal(params, vote)](#ClientErc20.ClientErc20Methods+voteProposal) ⇒ <code>\*</code>
    * [.ClientErc20Methods#executeProposal(params)](#ClientErc20.ClientErc20Methods+executeProposal) ⇒ <code>\*</code>
    * [.ClientErc20Methods#getMembers()](#ClientErc20.ClientErc20Methods+getMembers) ⇒ <code>\*</code>
    * [.ClientErc20Methods#getProposal(proposalId)](#ClientErc20.ClientErc20Methods+getProposal) ⇒ <code>\*</code>
    * [.ClientErc20Methods#getProposals(params)](#ClientErc20.ClientErc20Methods+getProposals) ⇒ <code>\*</code>
    * [.ClientErc20Methods#getSettings(pluginAddress)](#ClientErc20.ClientErc20Methods+getSettings) ⇒ <code>\*</code>
    * [.ClientErc20Methods#getToken(pluginAddress)](#ClientErc20.ClientErc20Methods+getToken) ⇒ <code>\*</code>

<a name="ClientErc20.getPluginInstallItem"></a>

### ClientErc20.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>IErc20PluginInstall</code> | 

<a name="ClientErc20.ClientErc20Methods+createProposal"></a>

### ClientErc20.ClientErc20Methods#createProposal(params) ⇒ <code>\*</code>
<p>Creates a new proposal on the given ERC20 plugin contract</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ProposalCreationStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateProposalParams</code> | 

<a name="ClientErc20.ClientErc20Methods+voteProposal"></a>

### ClientErc20.ClientErc20Methods#voteProposal(params, vote) ⇒ <code>\*</code>
<p>Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<VoteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 
| vote | <code>VoteValues</code> | 

<a name="ClientErc20.ClientErc20Methods+executeProposal"></a>

### ClientErc20.ClientErc20Methods#executeProposal(params) ⇒ <code>\*</code>
<p>Executes the given proposal, provided that it has already passed</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ExecuteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IExecuteProposalParams</code> | 

<a name="ClientErc20.ClientErc20Methods+getMembers"></a>

### ClientErc20.ClientErc20Methods#getMembers() ⇒ <code>\*</code>
<p>Returns the list of wallet addresses holding tokens from the underlying ERC20 contract used by the plugin</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise&lt;string[]&gt;}</p>  
<a name="ClientErc20.ClientErc20Methods+getProposal"></a>

### ClientErc20.ClientErc20Methods#getProposal(proposalId) ⇒ <code>\*</code>
<p>Returns the details of the given proposal</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise<Erc20Proposal>}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="ClientErc20.ClientErc20Methods+getProposals"></a>

### ClientErc20.ClientErc20Methods#getProposals(params) ⇒ <code>\*</code>
<p>Returns a list of proposals on the Plugin, filtered by the given criteria</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise&lt;Erc20ProposalListItem[]&gt;}</p>  

| Param | Type |
| --- | --- |
| params | <code>IProposalQueryParams</code> | 

<a name="ClientErc20.ClientErc20Methods+getSettings"></a>

### ClientErc20.ClientErc20Methods#getSettings(pluginAddress) ⇒ <code>\*</code>
<p>Returns the settings of a plugin given the address of the plugin instance</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise<IPluginSettings>}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="ClientErc20.ClientErc20Methods+getToken"></a>

### ClientErc20.ClientErc20Methods#getToken(pluginAddress) ⇒ <code>\*</code>
<p>Returns the details of the token used in a specific plugin instance</p>

**Kind**: static method of [<code>ClientErc20</code>](#ClientErc20)  
**Returns**: <code>\*</code> - <p>{Promise&lt;Erc20TokenDetails | null&gt;}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="ClientErc20Decoding"></a>

## ClientErc20Decoding
<p>Decoding module the SDK ERC20 Client</p>

**Kind**: global class  

* [ClientErc20Decoding](#ClientErc20Decoding)
    * [.updatePluginSettingsAction(data)](#ClientErc20Decoding+updatePluginSettingsAction) ⇒ <code>\*</code>
    * [.mintTokenAction(data)](#ClientErc20Decoding+mintTokenAction) ⇒ <code>\*</code>
    * [.findInterface(data)](#ClientErc20Decoding+findInterface) ⇒ <code>\*</code>

<a name="ClientErc20Decoding+updatePluginSettingsAction"></a>

### clientErc20Decoding.updatePluginSettingsAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata from an encoded update metadata action</p>

**Kind**: instance method of [<code>ClientErc20Decoding</code>](#ClientErc20Decoding)  
**Returns**: <code>\*</code> - <p>{IPluginSettings}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientErc20Decoding+mintTokenAction"></a>

### clientErc20Decoding.mintTokenAction(data) ⇒ <code>\*</code>
<p>Decodes the mint token params from an encoded mint token action</p>

**Kind**: instance method of [<code>ClientErc20Decoding</code>](#ClientErc20Decoding)  
**Returns**: <code>\*</code> - <p>{IMintTokenParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientErc20Decoding+findInterface"></a>

### clientErc20Decoding.findInterface(data) ⇒ <code>\*</code>
<p>Returns the decoded function info given the encoded data of an action</p>

**Kind**: instance method of [<code>ClientErc20Decoding</code>](#ClientErc20Decoding)  
**Returns**: <code>\*</code> - <p>{(IInterfaceParams | null)}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientErc20Encoding"></a>

## ClientErc20Encoding
<p>Encoding module the SDK ERC20 Client</p>

**Kind**: global class  

* [ClientErc20Encoding](#ClientErc20Encoding)
    * _instance_
        * [.updatePluginSettingsAction(pluginAddress, params)](#ClientErc20Encoding+updatePluginSettingsAction) ⇒ <code>\*</code>
        * [.mintTokenAction(minterAddress, params)](#ClientErc20Encoding+mintTokenAction) ⇒ <code>\*</code>
    * _static_
        * [.getPluginInstallItem(params)](#ClientErc20Encoding.getPluginInstallItem) ⇒ <code>\*</code>

<a name="ClientErc20Encoding+updatePluginSettingsAction"></a>

### clientErc20Encoding.updatePluginSettingsAction(pluginAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that updates the governance configuration</p>

**Kind**: instance method of [<code>ClientErc20Encoding</code>](#ClientErc20Encoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| params | <code>IPluginSettings</code> | 

<a name="ClientErc20Encoding+mintTokenAction"></a>

### clientErc20Encoding.mintTokenAction(minterAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that mints an amount of ERC-20 tokens to an address</p>

**Kind**: instance method of [<code>ClientErc20Encoding</code>](#ClientErc20Encoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| minterAddress | <code>string</code> | 
| params | <code>IMintTokenParams</code> | 

<a name="ClientErc20Encoding.getPluginInstallItem"></a>

### ClientErc20Encoding.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>ClientErc20Encoding</code>](#ClientErc20Encoding)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>IErc20PluginInstall</code> | 

<a name="ClientErc20Estimation"></a>

## ClientErc20Estimation
<p>Estimation module the SDK ERC20 Client</p>

**Kind**: global class  

* [ClientErc20Estimation](#ClientErc20Estimation)
    * [.createProposal(params)](#ClientErc20Estimation+createProposal) ⇒ <code>\*</code>
    * [.voteProposal(_params)](#ClientErc20Estimation+voteProposal) ⇒ <code>\*</code>
    * [.executeProposal(_params)](#ClientErc20Estimation+executeProposal) ⇒ <code>\*</code>

<a name="ClientErc20Estimation+createProposal"></a>

### clientErc20Estimation.createProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a proposal on the plugin</p>

**Kind**: instance method of [<code>ClientErc20Estimation</code>](#ClientErc20Estimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateProposalParams</code> | 

<a name="ClientErc20Estimation+voteProposal"></a>

### clientErc20Estimation.voteProposal(_params) ⇒ <code>\*</code>
<p>Estimates the gas fee of casting a vote on a proposal</p>

**Kind**: instance method of [<code>ClientErc20Estimation</code>](#ClientErc20Estimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>IVoteProposalParams</code> | 

<a name="ClientErc20Estimation+executeProposal"></a>

### clientErc20Estimation.executeProposal(_params) ⇒ <code>\*</code>
<p>Estimates the gas fee of executing an ERC20 proposal</p>

**Kind**: instance method of [<code>ClientErc20Estimation</code>](#ClientErc20Estimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>IExecuteProposalParams</code> | 

<a name="ClientErc20Methods"></a>

## ClientErc20Methods
<p>Methods module the SDK ERC20 Client</p>

**Kind**: global class  
<a name="ClientErc20Methods+canVote"></a>

### clientErc20Methods.canVote(params) ⇒ <code>\*</code>
<p>Checks if an user can vote in a proposal</p>

**Kind**: instance method of [<code>ClientErc20Methods</code>](#ClientErc20Methods)  
**Returns**: <code>\*</code> - <p>{Promise<boolean>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICanVoteParams</code> | 

