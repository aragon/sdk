## Classes

<dl>
<dt><a href="#TokenVotingClient">TokenVotingClient</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact a Token Voting plugin installed in a DAO</p></dd>
<dt><a href="#TokenVotingClientDecoding">TokenVotingClientDecoding</a></dt>
<dd><p>Decoding module the SDK TokenVoting Client</p></dd>
<dt><a href="#TokenVotingClientEncoding">TokenVotingClientEncoding</a></dt>
<dd><p>Encoding module the SDK TokenVoting Client</p></dd>
<dt><a href="#TokenVotingClientEstimation">TokenVotingClientEstimation</a></dt>
<dd><p>Estimation module the SDK TokenVoting Client</p></dd>
<dt><a href="#TokenVotingClientMethods">TokenVotingClientMethods</a></dt>
<dd><p>Methods module the SDK TokenVoting Client</p></dd>
</dl>

## Members

<dl>
<dt><a href="#SubgraphTokenType">SubgraphTokenType</a></dt>
<dd><p>Defines the shape of the Token client class</p></dd>
</dl>

<a name="TokenVotingClient"></a>

## TokenVotingClient
<p>Provider a generic client with high level methods to manage and interact a Token Voting plugin installed in a DAO</p>

**Kind**: global class  

* [TokenVotingClient](#TokenVotingClient)
    * [.getPluginInstallItem(params, [network])](#TokenVotingClient.getPluginInstallItem) ⇒ <code>\*</code>
    * [.TokenVotingClientMethods#createProposal(params)](#TokenVotingClient.TokenVotingClientMethods+createProposal) ⇒ <code>\*</code>
    * [.TokenVotingClientMethods#voteProposal(params, vote)](#TokenVotingClient.TokenVotingClientMethods+voteProposal) ⇒ <code>\*</code>
    * [.TokenVotingClientMethods#executeProposal(proposalId)](#TokenVotingClient.TokenVotingClientMethods+executeProposal) ⇒ <code>\*</code>
    * [.TokenVotingClientMethods#getMembers(pluginAddress)](#TokenVotingClient.TokenVotingClientMethods+getMembers) ⇒ <code>\*</code>
    * [.TokenVotingClientMethods#getProposal(proposalId)](#TokenVotingClient.TokenVotingClientMethods+getProposal) ⇒ <code>\*</code>
    * [.TokenVotingClientMethods#getProposals(params)](#TokenVotingClient.TokenVotingClientMethods+getProposals) ⇒ <code>\*</code>
    * [.TokenVotingClientMethods#getVotingSettings(pluginAddress)](#TokenVotingClient.TokenVotingClientMethods+getVotingSettings) ⇒ <code>\*</code>
    * [.TokenVotingClientMethods#getToken(pluginAddress)](#TokenVotingClient.TokenVotingClientMethods+getToken) ⇒ <code>\*</code>

<a name="TokenVotingClient.getPluginInstallItem"></a>

### TokenVotingClient.getPluginInstallItem(params, [network]) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type | Default |
| --- | --- | --- |
| params | <code>ITokenVotingPluginInstall</code> |  | 
| [network] | <code>SupportedNetworks</code> | <code>&quot;mainnet&quot;</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+createProposal"></a>

### TokenVotingClient.TokenVotingClientMethods#createProposal(params) ⇒ <code>\*</code>
<p>Creates a new proposal on the given TokenVoting plugin contract</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>`{AsyncGenerator<ProposalCreationStepValue>}`</p>  

| Param | Type |
| --- | --- |
| params | <code>CreateMajorityVotingProposalParams</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+voteProposal"></a>

### TokenVotingClient.TokenVotingClientMethods#voteProposal(params, vote) ⇒ <code>\*</code>
<p>Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>`{AsyncGenerator<VoteProposalStepValue>}`</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 
| vote | <code>VoteValues</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+executeProposal"></a>

### TokenVotingClient.TokenVotingClientMethods#executeProposal(proposalId) ⇒ <code>\*</code>
<p>Executes the given proposal, provided that it has already passed</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>`{AsyncGenerator<ExecuteProposalStepValue>}`</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

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
**Returns**: <code>\*</code> - <p>`{Promise<TokenVotingProposal>}`</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+getProposals"></a>

### TokenVotingClient.TokenVotingClientMethods#getProposals(params) ⇒ <code>\*</code>
<p>Returns a list of proposals on the Plugin, filtered by the given criteria</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{Promise&lt;TokenVotingProposalListItem[]&gt;}</p>  

| Param | Type |
| --- | --- |
| params | <code>IProposalQueryParams</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+getVotingSettings"></a>

### TokenVotingClient.TokenVotingClientMethods#getVotingSettings(pluginAddress) ⇒ <code>\*</code>
<p>Returns the settings of a plugin given the address of the plugin instance</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>`{Promise<VotingSettings>}`</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="TokenVotingClient.TokenVotingClientMethods+getToken"></a>

### TokenVotingClient.TokenVotingClientMethods#getToken(pluginAddress) ⇒ <code>\*</code>
<p>Returns the details of the token used in a specific plugin instance</p>

**Kind**: static method of [<code>TokenVotingClient</code>](#TokenVotingClient)  
**Returns**: <code>\*</code> - <p>{Promise&lt;Erc20TokenDetails | null&gt;}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="TokenVotingClientDecoding"></a>

## TokenVotingClientDecoding
<p>Decoding module the SDK TokenVoting Client</p>

**Kind**: global class  

* [TokenVotingClientDecoding](#TokenVotingClientDecoding)
    * [.updatePluginSettingsAction(data)](#TokenVotingClientDecoding+updatePluginSettingsAction) ⇒ <code>\*</code>
    * [.mintTokenAction(data)](#TokenVotingClientDecoding+mintTokenAction) ⇒ <code>\*</code>
    * [.findInterface(data)](#TokenVotingClientDecoding+findInterface) ⇒ <code>\*</code>

<a name="TokenVotingClientDecoding+updatePluginSettingsAction"></a>

### tokenVotingClientDecoding.updatePluginSettingsAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata from an encoded update metadata action</p>

**Kind**: instance method of [<code>TokenVotingClientDecoding</code>](#TokenVotingClientDecoding)  
**Returns**: <code>\*</code> - <p>{VotingSettings}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="TokenVotingClientDecoding+mintTokenAction"></a>

### tokenVotingClientDecoding.mintTokenAction(data) ⇒ <code>\*</code>
<p>Decodes the mint token params from an encoded mint token action</p>

**Kind**: instance method of [<code>TokenVotingClientDecoding</code>](#TokenVotingClientDecoding)  
**Returns**: <code>\*</code> - <p>{IMintTokenParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="TokenVotingClientDecoding+findInterface"></a>

### tokenVotingClientDecoding.findInterface(data) ⇒ <code>\*</code>
<p>Returns the decoded function info given the encoded data of an action</p>

**Kind**: instance method of [<code>TokenVotingClientDecoding</code>](#TokenVotingClientDecoding)  
**Returns**: <code>\*</code> - <p>{(IInterfaceParams | null)}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="TokenVotingClientEncoding"></a>

## TokenVotingClientEncoding
<p>Encoding module the SDK TokenVoting Client</p>

**Kind**: global class  

* [TokenVotingClientEncoding](#TokenVotingClientEncoding)
    * _instance_
        * [.updatePluginSettingsAction(pluginAddress, params)](#TokenVotingClientEncoding+updatePluginSettingsAction) ⇒ <code>\*</code>
        * [.mintTokenAction(minterAddress, params)](#TokenVotingClientEncoding+mintTokenAction) ⇒ <code>\*</code>
    * _static_
        * [.getPluginInstallItem(params, network)](#TokenVotingClientEncoding.getPluginInstallItem) ⇒ <code>\*</code>

<a name="TokenVotingClientEncoding+updatePluginSettingsAction"></a>

### tokenVotingClientEncoding.updatePluginSettingsAction(pluginAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that updates the governance configuration</p>

**Kind**: instance method of [<code>TokenVotingClientEncoding</code>](#TokenVotingClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| params | <code>VotingSettings</code> | 

<a name="TokenVotingClientEncoding+mintTokenAction"></a>

### tokenVotingClientEncoding.mintTokenAction(minterAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that mints an amount of ERC-20 tokens to an address</p>

**Kind**: instance method of [<code>TokenVotingClientEncoding</code>](#TokenVotingClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| minterAddress | <code>string</code> | 
| params | <code>IMintTokenParams</code> | 

<a name="TokenVotingClientEncoding.getPluginInstallItem"></a>

### TokenVotingClientEncoding.getPluginInstallItem(params, network) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>TokenVotingClientEncoding</code>](#TokenVotingClientEncoding)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>ITokenVotingPluginInstall</code> | 
| network | <code>SupportedNetworks</code> | 

<a name="TokenVotingClientEstimation"></a>

## TokenVotingClientEstimation
<p>Estimation module the SDK TokenVoting Client</p>

**Kind**: global class  

* [TokenVotingClientEstimation](#TokenVotingClientEstimation)
    * [.createProposal(params)](#TokenVotingClientEstimation+createProposal) ⇒ <code>\*</code>
    * [.voteProposal(params)](#TokenVotingClientEstimation+voteProposal) ⇒ <code>\*</code>
    * [.executeProposal(proposalId)](#TokenVotingClientEstimation+executeProposal) ⇒ <code>\*</code>

<a name="TokenVotingClientEstimation+createProposal"></a>

### tokenVotingClientEstimation.createProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a proposal on the plugin</p>

**Kind**: instance method of [<code>TokenVotingClientEstimation</code>](#TokenVotingClientEstimation)  
**Returns**: <code>\*</code> - <p>`{Promise<GasFeeEstimation>}`</p>  

| Param | Type |
| --- | --- |
| params | <code>CreateMajorityVotingProposalParams</code> | 

<a name="TokenVotingClientEstimation+voteProposal"></a>

### tokenVotingClientEstimation.voteProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of casting a vote on a proposal</p>

**Kind**: instance method of [<code>TokenVotingClientEstimation</code>](#TokenVotingClientEstimation)  
**Returns**: <code>\*</code> - <p>`{Promise<GasFeeEstimation>}`</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 

<a name="TokenVotingClientEstimation+executeProposal"></a>

### tokenVotingClientEstimation.executeProposal(proposalId) ⇒ <code>\*</code>
<p>Estimates the gas fee of executing a TokenVoting proposal</p>

**Kind**: instance method of [<code>TokenVotingClientEstimation</code>](#TokenVotingClientEstimation)  
**Returns**: <code>\*</code> - <p>`{Promise<GasFeeEstimation>}`</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="TokenVotingClientMethods"></a>

## TokenVotingClientMethods
<p>Methods module the SDK TokenVoting Client</p>

**Kind**: global class  

* [TokenVotingClientMethods](#TokenVotingClientMethods)
    * [.canVote(params)](#TokenVotingClientMethods+canVote) ⇒ <code>\*</code>
    * [.canExecute(proposalId)](#TokenVotingClientMethods+canExecute) ⇒ <code>\*</code>

<a name="TokenVotingClientMethods+canVote"></a>

### tokenVotingClientMethods.canVote(params) ⇒ <code>\*</code>
<p>Checks if an user can vote in a proposal</p>

**Kind**: instance method of [<code>TokenVotingClientMethods</code>](#TokenVotingClientMethods)  
**Returns**: <code>\*</code> - <p>`{Promise<boolean>}`</p>  

| Param | Type |
| --- | --- |
| params | <code>CanVoteParams</code> | 

<a name="TokenVotingClientMethods+canExecute"></a>

### tokenVotingClientMethods.canExecute(proposalId) ⇒ <code>\*</code>
<p>Checks whether the current proposal can be executed</p>

**Kind**: instance method of [<code>TokenVotingClientMethods</code>](#TokenVotingClientMethods)  
**Returns**: <code>\*</code> - <p>`{Promise<boolean>}`</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="SubgraphTokenType"></a>

## SubgraphTokenType
<p>Defines the shape of the Token client class</p>

**Kind**: global variable  
