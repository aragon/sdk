## Classes

<dl>
<dt><a href="#TokenVotingClient">TokenVotingClient</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact an Token Voting plugin installed in a DAO</p></dd>
<dt><a href="#TokenVotingClientDecoding">TokenVotingClientDecoding</a></dt>
<dd><p>Decoding module the SDK Token Client</p></dd>
<dt><a href="#TokenVotingClientEncoding">TokenVotingClientEncoding</a></dt>
<dd><p>Encoding module the SDK Token Client</p></dd>
<dt><a href="#TokenVotingClientEstimation">TokenVotingClientEstimation</a></dt>
<dd><p>Estimation module the SDK Token Client</p></dd>
<dt><a href="#TokenVotingClientMethods">TokenVotingClientMethods</a></dt>
<dd><p>Methods module the SDK Token Client</p></dd>
</dl>

<a name="TokenVotingClient"></a>

## TokenVotingClient
<p>Provider a generic client with high level methods to manage and interact an Token Voting plugin installed in a DAO</p>

**Kind**: global class  

- [Classes](#classes)
- [TokenVotingClient](#tokenvotingclient)
  - [TokenVotingClient.getPluginInstallItem(params) ⇒ \*](#tokenvotingclientgetplugininstallitemparams--)
  - [TokenVotingClient.TokenVotingClientMethods#createProposal(params) ⇒ \*](#tokenvotingclienttokenvotingclientmethodscreateproposalparams--)
  - [TokenVotingClient.TokenVotingClientMethods#voteProposal(params, vote) ⇒ \*](#tokenvotingclienttokenvotingclientmethodsvoteproposalparams-vote--)
  - [TokenVotingClient.TokenVotingClientMethods#executeProposal(params) ⇒ \*](#tokenvotingclienttokenvotingclientmethodsexecuteproposalparams--)
  - [TokenVotingClient.TokenVotingClientMethods#getMembers(pluginAddress) ⇒ \*](#tokenvotingclienttokenvotingclientmethodsgetmemberspluginaddress--)
  - [TokenVotingClient.TokenVotingClientMethods#getProposal(proposalId) ⇒ \*](#tokenvotingclienttokenvotingclientmethodsgetproposalproposalid--)
  - [TokenVotingClient.TokenVotingClientMethods#getProposals(params) ⇒ \*](#tokenvotingclienttokenvotingclientmethodsgetproposalsparams--)
  - [TokenVotingClient.TokenVotingClientMethods#getSettings(pluginAddress) ⇒ \*](#tokenvotingclienttokenvotingclientmethodsgetsettingspluginaddress--)
  - [TokenVotingClient.TokenVotingClientMethods#getToken(pluginAddress) ⇒ \*](#tokenvotingclienttokenvotingclientmethodsgettokenpluginaddress--)
- [TokenVotingClientDecoding](#tokenvotingclientdecoding)
  - [TokenVotingClientDecoding.updatePluginSettingsAction(data) ⇒ \*](#tokenvotingclientdecodingupdatepluginsettingsactiondata--)
  - [TokenVotingClientDecoding.mintTokenAction(data) ⇒ \*](#tokenvotingclientdecodingminttokenactiondata--)
  - [TokenVotingClientDecoding.findInterface(data) ⇒ \*](#tokenvotingclientdecodingfindinterfacedata--)
- [TokenVotingClientEncoding](#tokenvotingclientencoding)
  - [TokenVotingClientEncoding.updatePluginSettingsAction(pluginAddress, params) ⇒ \*](#tokenvotingclientencodingupdatepluginsettingsactionpluginaddress-params--)
  - [TokenVotingClientEncoding.mintTokenAction(minterAddress, params) ⇒ \*](#tokenvotingclientencodingminttokenactionminteraddress-params--)
  - [TokenVotingClientEncoding.getPluginInstallItem(params) ⇒ \*](#tokenvotingclientencodinggetplugininstallitemparams--)
- [TokenVotingClientEstimation](#tokenvotingclientestimation)
  - [TokenVotingClientEstimation.createProposal(params) ⇒ \*](#tokenvotingclientestimationcreateproposalparams--)
  - [TokenVotingClientEstimation.voteProposal(params) ⇒ \*](#tokenvotingclientestimationvoteproposalparams--)
  - [TokenVotingClientEstimation.executeProposal(params) ⇒ \*](#tokenvotingclientestimationexecuteproposalparams--)
- [TokenVotingClientMethods](#tokenvotingclientmethods)
  - [TokenVotingClientMethods.canVote(params) ⇒ \*](#tokenvotingclientmethodscanvoteparams--)

<a name="TokenVotingClient.getPluginInstallItem"></a>

### TokenVotingClient.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>ITokenPluginInstall</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+createProposal"></a>

### TokenVotingClient.TokenVotingClientMethods#createProposal(params) ⇒ <code>\*</code>
<p>Creates a new proposal on the given Token plugin contract</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ProposalCreationStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateProposalParams</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+voteProposal"></a>

### TokenVotingClient.TokenVotingClientMethods#voteProposal(params, vote) ⇒ <code>\*</code>
<p>Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<VoteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 
| vote | <code>VoteValues</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+executeProposal"></a>

### TokenVotingClient.TokenVotingClientMethods#executeProposal(params) ⇒ <code>\*</code>
<p>Executes the given proposal, provided that it has already passed</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ExecuteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IExecuteProposalParams</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+getMembers"></a>

### TokenVotingClient.TokenVotingClientMethods#getMembers(pluginAddress) ⇒ <code>\*</code>
<p>Returns the list of wallet addresses holding tokens from the underlying Token contract used by the plugin</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{Promise&lt;string[]&gt;}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+getProposal"></a>

### TokenVotingClient.TokenVotingClientMethods#getProposal(proposalId) ⇒ <code>\*</code>
<p>Returns the details of the given proposal</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{Promise<TokenProposal>}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+getProposals"></a>

### TokenVotingClient.TokenVotingClientMethods#getProposals(params) ⇒ <code>\*</code>
<p>Returns a list of proposals on the Plugin, filtered by the given criteria</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{Promise&lt;TokenProposalListItem[]&gt;}</p>  

| Param | Type |
| --- | --- |
| params | <code>IProposalQueryParams</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+getSettings"></a>

### TokenVotingClient.TokenVotingClientMethods#getSettings(pluginAddress) ⇒ <code>\*</code>
<p>Returns the settings of a plugin given the address of the plugin instance</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{Promise<IPluginSettings>}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+getToken"></a>

### TokenVotingClient.TokenVotingClientMethods#getToken(pluginAddress) ⇒ <code>\*</code>
<p>Returns the details of the token used in a specific plugin instance</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{Promise&lt;TokenTokenDetails | null&gt;}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="TokenVotingClientDecoding"></a>

## TokenVotingClientDecoding
<p>Decoding module the SDK Token Client</p>

**Kind**: global class  

* [TokenVotingClientDecoding](#TokenVotingClientDecoding)
    * [.updatePluginSettingsAction(data)](#TokenVotingClientDecoding+updatePluginSettingsAction) ⇒ <code>\*</code>
    * [.mintTokenAction(data)](#TokenVotingClientDecoding+mintTokenAction) ⇒ <code>\*</code>
    * [.findInterface(data)](#TokenVotingClientDecoding+findInterface) ⇒ <code>\*</code>

<a name="TokenVotingClientDecoding+updatePluginSettingsAction"></a>

### TokenVotingClientDecoding.updatePluginSettingsAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata from an encoded update metadata action</p>

**Kind**: instance method of [<code>TokenVotingClientDecoding</code>](#TokenVotingClientDecoding)  
**Returns**: <code>\*</code> - <p>{IPluginSettings}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="TokenVotingClientDecoding+mintTokenAction"></a>

### TokenVotingClientDecoding.mintTokenAction(data) ⇒ <code>\*</code>
<p>Decodes the mint token params from an encoded mint token action</p>

**Kind**: instance method of [<code>TokenVotingClientDecoding</code>](#TokenVotingClientDecoding)  
**Returns**: <code>\*</code> - <p>{IMintTokenParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="TokenVotingClientDecoding+findInterface"></a>

### TokenVotingClientDecoding.findInterface(data) ⇒ <code>\*</code>
<p>Returns the decoded function info given the encoded data of an action</p>

**Kind**: instance method of [<code>TokenVotingClientDecoding</code>](#TokenVotingClientDecoding)  
**Returns**: <code>\*</code> - <p>{(IInterfaceParams | null)}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="TokenVotingClientEncoding"></a>

## TokenVotingClientEncoding
<p>Encoding module the SDK Token Client</p>

**Kind**: global class  

* [TokenVotingClientEncoding](#TokenVotingClientEncoding)
    * _instance_
        * [.updatePluginSettingsAction(pluginAddress, params)](#TokenVotingClientEncoding+updatePluginSettingsAction) ⇒ <code>\*</code>
        * [.mintTokenAction(minterAddress, params)](#TokenVotingClientEncoding+mintTokenAction) ⇒ <code>\*</code>
    * _static_
        * [.getPluginInstallItem(params)](#TokenVotingClientEncoding.getPluginInstallItem) ⇒ <code>\*</code>

<a name="TokenVotingClientEncoding+updatePluginSettingsAction"></a>

### TokenVotingClientEncoding.updatePluginSettingsAction(pluginAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that updates the governance configuration</p>

**Kind**: instance method of [<code>TokenVotingClientEncoding</code>](#TokenVotingClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| params | <code>IPluginSettings</code> | 

<a name="TokenVotingClientEncoding+mintTokenAction"></a>

### TokenVotingClientEncoding.mintTokenAction(minterAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that mints an amount of ERC-20 tokens to an address</p>

**Kind**: instance method of [<code>TokenVotingClientEncoding</code>](#TokenVotingClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| minterAddress | <code>string</code> | 
| params | <code>IMintTokenParams</code> | 

<a name="TokenVotingClientEncoding.getPluginInstallItem"></a>

### TokenVotingClientEncoding.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>TokenVotingClientEncoding</code>](#TokenVotingClientEncoding)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>ITokenPluginInstall</code> | 

<a name="TokenVotingClientEstimation"></a>

## TokenVotingClientEstimation
<p>Estimation module the SDK Token Client</p>

**Kind**: global class  

* [TokenVotingClientEstimation](#TokenVotingClientEstimation)
    * [.createProposal(params)](#TokenVotingClientEstimation+createProposal) ⇒ <code>\*</code>
    * [.voteProposal(params)](#TokenVotingClientEstimation+voteProposal) ⇒ <code>\*</code>
    * [.executeProposal(params)](#TokenVotingClientEstimation+executeProposal) ⇒ <code>\*</code>

<a name="TokenVotingClientEstimation+createProposal"></a>

### TokenVotingClientEstimation.createProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a proposal on the plugin</p>

**Kind**: instance method of [<code>TokenVotingClientEstimation</code>](#TokenVotingClientEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateProposalParams</code> | 

<a name="TokenVotingClientEstimation+voteProposal"></a>

### TokenVotingClientEstimation.voteProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of casting a vote on a proposal</p>

**Kind**: instance method of [<code>TokenVotingClientEstimation</code>](#TokenVotingClientEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 

<a name="TokenVotingClientEstimation+executeProposal"></a>

### TokenVotingClientEstimation.executeProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of executing an Token proposal</p>

**Kind**: instance method of [<code>TokenVotingClientEstimation</code>](#TokenVotingClientEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IExecuteProposalParams</code> | 

<a name="TokenVotingClientMethods"></a>

## TokenVotingClientMethods
<p>Methods module the SDK Token Client</p>

**Kind**: global class  
<a name="TokenVotingClientMethods+canVote"></a>

### TokenVotingClientMethods.canVote(params) ⇒ <code>\*</code>
<p>Checks if an user can vote in a proposal</p>

**Kind**: instance method of [<code>TokenVotingClientMethods</code>](#TokenVotingClientMethods)  
**Returns**: <code>\*</code> - <p>{Promise<boolean>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICanVoteParams</code> | 

