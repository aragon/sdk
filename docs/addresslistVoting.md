## Classes

<dl>
<dt><a href="#AddresslistVotingClient">AddresslistVotingClient</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO</p></dd>
<dt><a href="#AddresslistVotingClientDecoding">AddresslistVotingClientDecoding</a></dt>
<dd><p>Decoding module for the SDK AddressList Client</p></dd>
<dt><a href="#AddresslistVotingClientEncoding">AddresslistVotingClientEncoding</a></dt>
<dd><p>Encoding module for the SDK AddressList Client</p></dd>
<dt><a href="#AddresslistVotingClientEstimation">AddresslistVotingClientEstimation</a></dt>
<dd><p>Estimation module the SDK Address List Client</p></dd>
<dt><a href="#AddresslistVotingClientMethods">AddresslistVotingClientMethods</a></dt>
<dd><p>Methods module the SDK Address List Client</p></dd>
</dl>

<a name="AddresslistVotingClient"></a>

## AddresslistVotingClient
<p>Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO</p>

**Kind**: global class  
<a name="AddresslistVotingClient.getPluginInstallItem"></a>

### AddresslistVotingClient.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>AddresslistVotingClient</code>](#AddresslistVotingClient)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>IAddresslistVotingPluginInstall</code> | 

<a name="AddresslistVotingClientDecoding"></a>

## AddresslistVotingClientDecoding
<p>Decoding module for the SDK AddressList Client</p>

**Kind**: global class  

* [AddresslistVotingClientDecoding](#AddresslistVotingClientDecoding)
    * [.updatePluginSettingsAction(data)](#AddresslistVotingClientDecoding+updatePluginSettingsAction) ⇒ <code>\*</code>
    * [.addMembersAction(data)](#AddresslistVotingClientDecoding+addMembersAction) ⇒ <code>\*</code>
    * [.removeMembersAction(data)](#AddresslistVotingClientDecoding+removeMembersAction) ⇒ <code>\*</code>
    * [.findInterface(data)](#AddresslistVotingClientDecoding+findInterface) ⇒ <code>\*</code>

<a name="AddresslistVotingClientDecoding+updatePluginSettingsAction"></a>

### addresslistVotingClientDecoding.updatePluginSettingsAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata from an encoded update metadata action</p>

**Kind**: instance method of [<code>AddresslistVotingClientDecoding</code>](#AddresslistVotingClientDecoding)  
**Returns**: <code>\*</code> - <p>{VotingSettings}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="AddresslistVotingClientDecoding+addMembersAction"></a>

### addresslistVotingClientDecoding.addMembersAction(data) ⇒ <code>\*</code>
<p>Decodes a list of addresses from an encoded add members action</p>

**Kind**: instance method of [<code>AddresslistVotingClientDecoding</code>](#AddresslistVotingClientDecoding)  
**Returns**: <code>\*</code> - <p>{string[]}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="AddresslistVotingClientDecoding+removeMembersAction"></a>

### addresslistVotingClientDecoding.removeMembersAction(data) ⇒ <code>\*</code>
<p>Decodes a list of addresses from an encoded remove members action</p>

**Kind**: instance method of [<code>AddresslistVotingClientDecoding</code>](#AddresslistVotingClientDecoding)  
**Returns**: <code>\*</code> - <p>{string[]}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="AddresslistVotingClientDecoding+findInterface"></a>

### addresslistVotingClientDecoding.findInterface(data) ⇒ <code>\*</code>
<p>Returns the decoded function info given the encoded data of an action</p>

**Kind**: instance method of [<code>AddresslistVotingClientDecoding</code>](#AddresslistVotingClientDecoding)  
**Returns**: <code>\*</code> - <p>{(IInterfaceParams | null)}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="AddresslistVotingClientEncoding"></a>

## AddresslistVotingClientEncoding
<p>Encoding module for the SDK AddressList Client</p>

**Kind**: global class  

* [AddresslistVotingClientEncoding](#AddresslistVotingClientEncoding)
    * _instance_
        * [.updatePluginSettingsAction(pluginAddress, params)](#AddresslistVotingClientEncoding+updatePluginSettingsAction) ⇒ <code>\*</code>
        * [.addMembersAction(pluginAddress, members)](#AddresslistVotingClientEncoding+addMembersAction) ⇒ <code>\*</code>
        * [.removeMembersAction(pluginAddress, members)](#AddresslistVotingClientEncoding+removeMembersAction) ⇒ <code>\*</code>
    * _static_
        * [.getPluginInstallItem(params)](#AddresslistVotingClientEncoding.getPluginInstallItem) ⇒ <code>\*</code>

<a name="AddresslistVotingClientEncoding+updatePluginSettingsAction"></a>

### addresslistVotingClientEncoding.updatePluginSettingsAction(pluginAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that updates the governance configuration</p>

**Kind**: instance method of [<code>AddresslistVotingClientEncoding</code>](#AddresslistVotingClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| params | <code>VotingSettings</code> | 

<a name="AddresslistVotingClientEncoding+addMembersAction"></a>

### addresslistVotingClientEncoding.addMembersAction(pluginAddress, members) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that adds addresses to address list</p>

**Kind**: instance method of [<code>AddresslistVotingClientEncoding</code>](#AddresslistVotingClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| members | <code>Array.&lt;string&gt;</code> | 

<a name="AddresslistVotingClientEncoding+removeMembersAction"></a>

### addresslistVotingClientEncoding.removeMembersAction(pluginAddress, members) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that removes addresses from the address list</p>

**Kind**: instance method of [<code>AddresslistVotingClientEncoding</code>](#AddresslistVotingClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| members | <code>Array.&lt;string&gt;</code> | 

<a name="AddresslistVotingClientEncoding.getPluginInstallItem"></a>

### AddresslistVotingClientEncoding.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>AddresslistVotingClientEncoding</code>](#AddresslistVotingClientEncoding)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>IAddresslistVotingPluginInstall</code> | 

<a name="AddresslistVotingClientEstimation"></a>

## AddresslistVotingClientEstimation
<p>Estimation module the SDK Address List Client</p>

**Kind**: global class  

* [AddresslistVotingClientEstimation](#AddresslistVotingClientEstimation)
    * [.createProposal(params)](#AddresslistVotingClientEstimation+createProposal) ⇒ <code>\*</code>
    * [.voteProposal(params)](#AddresslistVotingClientEstimation+voteProposal) ⇒ <code>\*</code>
    * [.executeProposal(proposalId)](#AddresslistVotingClientEstimation+executeProposal) ⇒ <code>\*</code>

<a name="AddresslistVotingClientEstimation+createProposal"></a>

### addresslistVotingClientEstimation.createProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a proposal on the plugin</p>

**Kind**: instance method of [<code>AddresslistVotingClientEstimation</code>](#AddresslistVotingClientEstimation)  
**Returns**: <code>\*</code> - <p>`{Promise<GasFeeEstimation>}`</p>  

| Param | Type |
| --- | --- |
| params | <code>CreateMajorityVotingProposalParams</code> | 

<a name="AddresslistVotingClientEstimation+voteProposal"></a>

### addresslistVotingClientEstimation.voteProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of casting a vote on a proposal</p>

**Kind**: instance method of [<code>AddresslistVotingClientEstimation</code>](#AddresslistVotingClientEstimation)  
**Returns**: <code>\*</code> - <p>`{Promise<GasFeeEstimation>}`</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 

<a name="AddresslistVotingClientEstimation+executeProposal"></a>

### addresslistVotingClientEstimation.executeProposal(proposalId) ⇒ <code>\*</code>
<p>Estimates the gas fee of executing an AddressList proposal</p>

**Kind**: instance method of [<code>AddresslistVotingClientEstimation</code>](#AddresslistVotingClientEstimation)  
**Returns**: <code>\*</code> - <p>`{Promise<GasFeeEstimation>}`</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="AddresslistVotingClientMethods"></a>

## AddresslistVotingClientMethods
<p>Methods module the SDK Address List Client</p>

**Kind**: global class  

* [AddresslistVotingClientMethods](#AddresslistVotingClientMethods)
    * [.createProposal(params)](#AddresslistVotingClientMethods+createProposal) ⇒ <code>\*</code>
    * [.voteProposal(params)](#AddresslistVotingClientMethods+voteProposal) ⇒ <code>\*</code>
    * [.executeProposal(proposalId)](#AddresslistVotingClientMethods+executeProposal) ⇒ <code>\*</code>
    * [.canVote(params)](#AddresslistVotingClientMethods+canVote) ⇒ <code>\*</code>
    * [.canExecute(proposalId)](#AddresslistVotingClientMethods+canExecute) ⇒ <code>\*</code>
    * [.getMembers(pluginAddress)](#AddresslistVotingClientMethods+getMembers) ⇒ <code>\*</code>
    * [.getProposal(proposalId)](#AddresslistVotingClientMethods+getProposal) ⇒ <code>\*</code>
    * [.getProposals({)](#AddresslistVotingClientMethods+getProposals) ⇒ <code>\*</code>
    * [.getVotingSettings(pluginAddress)](#AddresslistVotingClientMethods+getVotingSettings) ⇒ <code>\*</code>

<a name="AddresslistVotingClientMethods+createProposal"></a>

### addresslistVotingClientMethods.createProposal(params) ⇒ <code>\*</code>
<p>Creates a new proposal on the given AddressList plugin contract</p>

**Kind**: instance method of [<code>AddresslistVotingClientMethods</code>](#AddresslistVotingClientMethods)  
**Returns**: <code>\*</code> - <p>`{AsyncGenerator<ProposalCreationStepValue>}`</p>  

| Param | Type |
| --- | --- |
| params | <code>CreateMajorityVotingProposalParams</code> | 

<a name="AddresslistVotingClientMethods+voteProposal"></a>

### addresslistVotingClientMethods.voteProposal(params) ⇒ <code>\*</code>
<p>Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.</p>

**Kind**: instance method of [<code>AddresslistVotingClientMethods</code>](#AddresslistVotingClientMethods)  
**Returns**: <code>\*</code> - <p>`{AsyncGenerator<VoteProposalStepValue>}`</p>  

| Param | Type |
| --- | --- |
| params | <code>IVoteProposalParams</code> | 

<a name="AddresslistVotingClientMethods+executeProposal"></a>

### addresslistVotingClientMethods.executeProposal(proposalId) ⇒ <code>\*</code>
<p>Executes the given proposal, provided that it has already passed</p>

**Kind**: instance method of [<code>AddresslistVotingClientMethods</code>](#AddresslistVotingClientMethods)  
**Returns**: <code>\*</code> - <p>`{AsyncGenerator<ExecuteProposalStepValue>}`</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="AddresslistVotingClientMethods+canVote"></a>

### addresslistVotingClientMethods.canVote(params) ⇒ <code>\*</code>
<p>Checks if an user can vote in a proposal</p>

**Kind**: instance method of [<code>AddresslistVotingClientMethods</code>](#AddresslistVotingClientMethods)  
**Returns**: <code>\*</code> - <p>`{Promise<boolean>}`</p>  

| Param | Type |
| --- | --- |
| params | <code>ICanVoteParams</code> | 

<a name="AddresslistVotingClientMethods+canExecute"></a>

### addresslistVotingClientMethods.canExecute(proposalId) ⇒ <code>\*</code>
<p>Checks whether the current proposal can be executed</p>

**Kind**: instance method of [<code>AddresslistVotingClientMethods</code>](#AddresslistVotingClientMethods)  
**Returns**: <code>\*</code> - <p>`{Promise<boolean>}`</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="AddresslistVotingClientMethods+getMembers"></a>

### addresslistVotingClientMethods.getMembers(pluginAddress) ⇒ <code>\*</code>
<p>Returns the list of wallet addresses with signing capabilities on the plugin</p>

**Kind**: instance method of [<code>AddresslistVotingClientMethods</code>](#AddresslistVotingClientMethods)  
**Returns**: <code>\*</code> - <p>{Promise&lt;string[]&gt;}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

<a name="AddresslistVotingClientMethods+getProposal"></a>

### addresslistVotingClientMethods.getProposal(proposalId) ⇒ <code>\*</code>
<p>Returns the details of the given proposal</p>

**Kind**: instance method of [<code>AddresslistVotingClientMethods</code>](#AddresslistVotingClientMethods)  
**Returns**: <code>\*</code> - <p>{(Promise&lt;AddresslistVotingProposal | null&gt;)}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="AddresslistVotingClientMethods+getProposals"></a>

### addresslistVotingClientMethods.getProposals({) ⇒ <code>\*</code>
<p>Returns a list of proposals on the Plugin, filtered by the given criteria</p>

**Kind**: instance method of [<code>AddresslistVotingClientMethods</code>](#AddresslistVotingClientMethods)  
**Returns**: <code>\*</code> - <p>{Promise&lt;AddresslistVotingProposalListItem[]&gt;}</p>  

| Param | Type | Description |
| --- | --- | --- |
| { | <code>IProposalQueryParams</code> | <p>daoAddressOrEns, limit = 10, status, skip = 0, direction = SortDirection.ASC, sortBy = ProposalSortBy.CREATED_AT, }</p> |

<a name="AddresslistVotingClientMethods+getVotingSettings"></a>

### addresslistVotingClientMethods.getVotingSettings(pluginAddress) ⇒ <code>\*</code>
<p>Returns the settings of a plugin given the address of the plugin instance</p>

**Kind**: instance method of [<code>AddresslistVotingClientMethods</code>](#AddresslistVotingClientMethods)  
**Returns**: <code>\*</code> - <p>{(Promise&lt;VotingSettings | null&gt;)}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

