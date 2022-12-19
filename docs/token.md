## Classes

<dl>
<dt><a href="#ClientToken">ClientToken</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact an Token Voting plugin installed in a DAO</p></dd>
<dt><a href="#ClientTokenDecoding">ClientTokenDecoding</a></dt>
<dd><p>Decoding module the SDK Token Client</p></dd>
<dt><a href="#ClientTokenEncoding">ClientTokenEncoding</a></dt>
<dd><p>Encoding module the SDK Token Client</p></dd>
<dt><a href="#ClientTokenEstimation">ClientTokenEstimation</a></dt>
<dd><p>Estimation module the SDK Token Client</p></dd>
<dt><a href="#ClientTokenMethods">ClientTokenMethods</a></dt>
<dd><p>Methods module the SDK Token Client</p></dd>
</dl>

<a name="ClientToken"></a>

## ClientToken
<p>Provider a generic client with high level methods to manage and interact an Token Voting plugin installed in a DAO</p>

**Kind**: global class  

* [ClientToken](#ClientToken)
    * [.getPluginInstallItem(params)](#ClientToken.getPluginInstallItem) ⇒ <code>\*</code>
    * [.ClientTokenMethods#createProposal(params)](#ClientToken.ClientTokenMethods+createProposal) ⇒ <code>\*</code>
    * [.ClientTokenMethods#voteProposal(params, vote)](#ClientToken.ClientTokenMethods+voteProposal) ⇒ <code>\*</code>
    * [.ClientTokenMethods#executeProposal(params)](#ClientToken.ClientTokenMethods+executeProposal) ⇒ <code>\*</code>
    * [.ClientTokenMethods#getMembers(pluginAddress)](#ClientToken.ClientTokenMethods+getMembers) ⇒ <code>\*</code>
    * [.ClientTokenMethods#getProposal(proposalId)](#ClientToken.ClientTokenMethods+getProposal) ⇒ <code>\*</code>
    * [.ClientTokenMethods#getProposals(params)](#ClientToken.ClientTokenMethods+getProposals) ⇒ <code>\*</code>
    * [.ClientTokenMethods#getSettings(pluginAddress)](#ClientToken.ClientTokenMethods+getSettings) ⇒ <code>\*</code>
    * [.ClientTokenMethods#getToken(pluginAddress)](#ClientToken.ClientTokenMethods+getToken) ⇒ <code>\*</code>

<a name="ClientToken.getPluginInstallItem"></a>

### ClientToken.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>ClientToken</code>](#ClientToken)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>ITokenPluginInstall</code> | 

<a name="ClientToken.ClientTokenMethods+createProposal"></a>

### ClientToken.ClientTokenMethods#createProposal(params) ⇒ <code>\*</code>
<p>Creates a new proposal on the given Token plugin contract</p>

**Kind**: static method of [<code>ClientToken</code>](#ClientToken)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ProposalCreationStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateProposalParams</code> | 

<a name="ClientToken.ClientTokenMethods+voteProposal"></a>

### ClientToken.ClientTokenMethods#voteProposal(params, vote) ⇒ <code>\*</code>
<p>Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.</p>

**Kind**: static method of [<code>ClientToken</code>](#ClientToken)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<VoteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 
| vote | <code>VoteValues</code> | 

<a name="ClientToken.ClientTokenMethods+executeProposal"></a>

### ClientToken.ClientTokenMethods#executeProposal(params) ⇒ <code>\*</code>
<p>Executes the given proposal, provided that it has already passed</p>

**Kind**: static method of [<code>ClientToken</code>](#ClientToken)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ExecuteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IExecuteProposalParams</code> | 

<a name="ClientToken.ClientTokenMethods+getMembers"></a>

### ClientToken.ClientTokenMethods#getMembers(pluginAddress) ⇒ <code>\*</code>
<p>Returns the list of wallet addresses holding tokens from the underlying Token contract used by the plugin</p>

**Kind**: static method of [<code>ClientToken</code>](#ClientToken)  
**Returns**: <code>\*</code> - <p>{Promise&lt;string[]&gt;}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="ClientToken.ClientTokenMethods+getProposal"></a>

### ClientToken.ClientTokenMethods#getProposal(proposalId) ⇒ <code>\*</code>
<p>Returns the details of the given proposal</p>

**Kind**: static method of [<code>ClientToken</code>](#ClientToken)  
**Returns**: <code>\*</code> - <p>{Promise<TokenProposal>}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="ClientToken.ClientTokenMethods+getProposals"></a>

### ClientToken.ClientTokenMethods#getProposals(params) ⇒ <code>\*</code>
<p>Returns a list of proposals on the Plugin, filtered by the given criteria</p>

**Kind**: static method of [<code>ClientToken</code>](#ClientToken)  
**Returns**: <code>\*</code> - <p>{Promise&lt;TokenProposalListItem[]&gt;}</p>  

| Param | Type |
| --- | --- |
| params | <code>IProposalQueryParams</code> | 

<a name="ClientToken.ClientTokenMethods+getSettings"></a>

### ClientToken.ClientTokenMethods#getSettings(pluginAddress) ⇒ <code>\*</code>
<p>Returns the settings of a plugin given the address of the plugin instance</p>

**Kind**: static method of [<code>ClientToken</code>](#ClientToken)  
**Returns**: <code>\*</code> - <p>{Promise<IPluginSettings>}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="ClientToken.ClientTokenMethods+getToken"></a>

### ClientToken.ClientTokenMethods#getToken(pluginAddress) ⇒ <code>\*</code>
<p>Returns the details of the token used in a specific plugin instance</p>

**Kind**: static method of [<code>ClientToken</code>](#ClientToken)  
**Returns**: <code>\*</code> - <p>{Promise&lt;TokenTokenDetails | null&gt;}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="ClientTokenDecoding"></a>

## ClientTokenDecoding
<p>Decoding module the SDK Token Client</p>

**Kind**: global class  

* [ClientTokenDecoding](#ClientTokenDecoding)
    * [.updatePluginSettingsAction(data)](#ClientTokenDecoding+updatePluginSettingsAction) ⇒ <code>\*</code>
    * [.mintTokenAction(data)](#ClientTokenDecoding+mintTokenAction) ⇒ <code>\*</code>
    * [.findInterface(data)](#ClientTokenDecoding+findInterface) ⇒ <code>\*</code>

<a name="ClientTokenDecoding+updatePluginSettingsAction"></a>

### clientTokenDecoding.updatePluginSettingsAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata from an encoded update metadata action</p>

**Kind**: instance method of [<code>ClientTokenDecoding</code>](#ClientTokenDecoding)  
**Returns**: <code>\*</code> - <p>{IPluginSettings}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientTokenDecoding+mintTokenAction"></a>

### clientTokenDecoding.mintTokenAction(data) ⇒ <code>\*</code>
<p>Decodes the mint token params from an encoded mint token action</p>

**Kind**: instance method of [<code>ClientTokenDecoding</code>](#ClientTokenDecoding)  
**Returns**: <code>\*</code> - <p>{IMintTokenParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientTokenDecoding+findInterface"></a>

### clientTokenDecoding.findInterface(data) ⇒ <code>\*</code>
<p>Returns the decoded function info given the encoded data of an action</p>

**Kind**: instance method of [<code>ClientTokenDecoding</code>](#ClientTokenDecoding)  
**Returns**: <code>\*</code> - <p>{(IInterfaceParams | null)}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientTokenEncoding"></a>

## ClientTokenEncoding
<p>Encoding module the SDK Token Client</p>

**Kind**: global class  

* [ClientTokenEncoding](#ClientTokenEncoding)
    * _instance_
        * [.updatePluginSettingsAction(pluginAddress, params)](#ClientTokenEncoding+updatePluginSettingsAction) ⇒ <code>\*</code>
        * [.mintTokenAction(minterAddress, params)](#ClientTokenEncoding+mintTokenAction) ⇒ <code>\*</code>
    * _static_
        * [.getPluginInstallItem(params)](#ClientTokenEncoding.getPluginInstallItem) ⇒ <code>\*</code>

<a name="ClientTokenEncoding+updatePluginSettingsAction"></a>

### clientTokenEncoding.updatePluginSettingsAction(pluginAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that updates the governance configuration</p>

**Kind**: instance method of [<code>ClientTokenEncoding</code>](#ClientTokenEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| params | <code>IPluginSettings</code> | 

<a name="ClientTokenEncoding+mintTokenAction"></a>

### clientTokenEncoding.mintTokenAction(minterAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that mints an amount of ERC-20 tokens to an address</p>

**Kind**: instance method of [<code>ClientTokenEncoding</code>](#ClientTokenEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| minterAddress | <code>string</code> | 
| params | <code>IMintTokenParams</code> | 

<a name="ClientTokenEncoding.getPluginInstallItem"></a>

### ClientTokenEncoding.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>ClientTokenEncoding</code>](#ClientTokenEncoding)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>ITokenPluginInstall</code> | 

<a name="ClientTokenEstimation"></a>

## ClientTokenEstimation
<p>Estimation module the SDK Token Client</p>

**Kind**: global class  

* [ClientTokenEstimation](#ClientTokenEstimation)
    * [.createProposal(params)](#ClientTokenEstimation+createProposal) ⇒ <code>\*</code>
    * [.voteProposal(params)](#ClientTokenEstimation+voteProposal) ⇒ <code>\*</code>
    * [.executeProposal(params)](#ClientTokenEstimation+executeProposal) ⇒ <code>\*</code>

<a name="ClientTokenEstimation+createProposal"></a>

### clientTokenEstimation.createProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a proposal on the plugin</p>

**Kind**: instance method of [<code>ClientTokenEstimation</code>](#ClientTokenEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateProposalParams</code> | 

<a name="ClientTokenEstimation+voteProposal"></a>

### clientTokenEstimation.voteProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of casting a vote on a proposal</p>

**Kind**: instance method of [<code>ClientTokenEstimation</code>](#ClientTokenEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 

<a name="ClientTokenEstimation+executeProposal"></a>

### clientTokenEstimation.executeProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of executing an Token proposal</p>

**Kind**: instance method of [<code>ClientTokenEstimation</code>](#ClientTokenEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IExecuteProposalParams</code> | 

<a name="ClientTokenMethods"></a>

## ClientTokenMethods
<p>Methods module the SDK Token Client</p>

**Kind**: global class  
<a name="ClientTokenMethods+canVote"></a>

### clientTokenMethods.canVote(params) ⇒ <code>\*</code>
<p>Checks if an user can vote in a proposal</p>

**Kind**: instance method of [<code>ClientTokenMethods</code>](#ClientTokenMethods)  
**Returns**: <code>\*</code> - <p>{Promise<boolean>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICanVoteParams</code> | 

