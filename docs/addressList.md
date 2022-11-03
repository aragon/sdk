## Classes

<dl>
<dt><a href="#ClientAddressList">ClientAddressList</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO</p></dd>
<dt><a href="#ClientAddressListDecoding">ClientAddressListDecoding</a></dt>
<dd><p>Decoding module for the SDK AddressList Client</p></dd>
<dt><a href="#ClientAddressListEncoding">ClientAddressListEncoding</a></dt>
<dd><p>Encoding module for the SDK AddressList Client</p></dd>
<dt><a href="#ClientAddressListEstimation">ClientAddressListEstimation</a></dt>
<dd><p>Estimation module the SDK Address List Client</p></dd>
<dt><a href="#ClientAddressListMethods">ClientAddressListMethods</a></dt>
<dd><p>Methods module the SDK Address List Client</p></dd>
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

<a name="ClientAddressListDecoding"></a>

## ClientAddressListDecoding
<p>Decoding module for the SDK AddressList Client</p>

**Kind**: global class  

* [ClientAddressListDecoding](#ClientAddressListDecoding)
    * [.updatePluginSettingsAction(data)](#ClientAddressListDecoding+updatePluginSettingsAction) ⇒ <code>\*</code>
    * [.addMembersAction(data)](#ClientAddressListDecoding+addMembersAction) ⇒ <code>\*</code>
    * [.removeMembersAction(data)](#ClientAddressListDecoding+removeMembersAction) ⇒ <code>\*</code>
    * [.findInterface(data)](#ClientAddressListDecoding+findInterface) ⇒ <code>\*</code>

<a name="ClientAddressListDecoding+updatePluginSettingsAction"></a>

### clientAddressListDecoding.updatePluginSettingsAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata from an encoded update metadata action</p>

**Kind**: instance method of [<code>ClientAddressListDecoding</code>](#ClientAddressListDecoding)  
**Returns**: <code>\*</code> - <p>{IPluginSettings}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientAddressListDecoding+addMembersAction"></a>

### clientAddressListDecoding.addMembersAction(data) ⇒ <code>\*</code>
<p>Decodes a list of addresses from an encoded add members action</p>

**Kind**: instance method of [<code>ClientAddressListDecoding</code>](#ClientAddressListDecoding)  
**Returns**: <code>\*</code> - <p>{string[]}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientAddressListDecoding+removeMembersAction"></a>

### clientAddressListDecoding.removeMembersAction(data) ⇒ <code>\*</code>
<p>Decodes a list of addresses from an encoded remove members action</p>

**Kind**: instance method of [<code>ClientAddressListDecoding</code>](#ClientAddressListDecoding)  
**Returns**: <code>\*</code> - <p>{string[]}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientAddressListDecoding+findInterface"></a>

### clientAddressListDecoding.findInterface(data) ⇒ <code>\*</code>
<p>Returns the decoded function info given the encoded data of an action</p>

**Kind**: instance method of [<code>ClientAddressListDecoding</code>](#ClientAddressListDecoding)  
**Returns**: <code>\*</code> - <p>{(IInterfaceParams | null)}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientAddressListEncoding"></a>

## ClientAddressListEncoding
<p>Encoding module for the SDK AddressList Client</p>

**Kind**: global class  

* [ClientAddressListEncoding](#ClientAddressListEncoding)
    * _instance_
        * [.updatePluginSettingsAction(pluginAddress, params)](#ClientAddressListEncoding+updatePluginSettingsAction) ⇒ <code>\*</code>
        * [.addMembersAction(pluginAddress, members)](#ClientAddressListEncoding+addMembersAction) ⇒ <code>\*</code>
        * [.removeMembersAction(pluginAddress, members)](#ClientAddressListEncoding+removeMembersAction) ⇒ <code>\*</code>
    * _static_
        * [.getPluginInstallItem(params)](#ClientAddressListEncoding.getPluginInstallItem) ⇒ <code>\*</code>

<a name="ClientAddressListEncoding+updatePluginSettingsAction"></a>

### clientAddressListEncoding.updatePluginSettingsAction(pluginAddress, params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that updates the governance configuration</p>

**Kind**: instance method of [<code>ClientAddressListEncoding</code>](#ClientAddressListEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| params | <code>IPluginSettings</code> | 

<a name="ClientAddressListEncoding+addMembersAction"></a>

### clientAddressListEncoding.addMembersAction(pluginAddress, members) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that adds addresses to address list</p>

**Kind**: instance method of [<code>ClientAddressListEncoding</code>](#ClientAddressListEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| members | <code>Array.&lt;string&gt;</code> | 

<a name="ClientAddressListEncoding+removeMembersAction"></a>

### clientAddressListEncoding.removeMembersAction(pluginAddress, members) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that removes addresses from the address list</p>

**Kind**: instance method of [<code>ClientAddressListEncoding</code>](#ClientAddressListEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| members | <code>Array.&lt;string&gt;</code> | 

<a name="ClientAddressListEncoding.getPluginInstallItem"></a>

### ClientAddressListEncoding.getPluginInstallItem(params) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>ClientAddressListEncoding</code>](#ClientAddressListEncoding)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| params | <code>IAddressListPluginInstall</code> | 

<a name="ClientAddressListEstimation"></a>

## ClientAddressListEstimation
<p>Estimation module the SDK Address List Client</p>

**Kind**: global class  

* [ClientAddressListEstimation](#ClientAddressListEstimation)
    * [.createProposal(_params)](#ClientAddressListEstimation+createProposal) ⇒ <code>\*</code>
    * [.voteProposal(_params)](#ClientAddressListEstimation+voteProposal) ⇒ <code>\*</code>
    * [.executeProposal(_params)](#ClientAddressListEstimation+executeProposal) ⇒ <code>\*</code>

<a name="ClientAddressListEstimation+createProposal"></a>

### clientAddressListEstimation.createProposal(_params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a proposal on the plugin</p>

**Kind**: instance method of [<code>ClientAddressListEstimation</code>](#ClientAddressListEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>ICreateProposalParams</code> | 

<a name="ClientAddressListEstimation+voteProposal"></a>

### clientAddressListEstimation.voteProposal(_params) ⇒ <code>\*</code>
<p>Estimates the gas fee of casting a vote on a proposal</p>

**Kind**: instance method of [<code>ClientAddressListEstimation</code>](#ClientAddressListEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>IVoteProposalParams</code> | 

<a name="ClientAddressListEstimation+executeProposal"></a>

### clientAddressListEstimation.executeProposal(_params) ⇒ <code>\*</code>
<p>Estimates the gas fee of executing an AddressList proposal</p>

**Kind**: instance method of [<code>ClientAddressListEstimation</code>](#ClientAddressListEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>IExecuteProposalParams</code> | 

<a name="ClientAddressListMethods"></a>

## ClientAddressListMethods
<p>Methods module the SDK Address List Client</p>

**Kind**: global class  

* [ClientAddressListMethods](#ClientAddressListMethods)
    * [.createProposal(_params)](#ClientAddressListMethods+createProposal) ⇒ <code>\*</code>
    * [.voteProposal(_params)](#ClientAddressListMethods+voteProposal) ⇒ <code>\*</code>
    * [.executeProposal(_params)](#ClientAddressListMethods+executeProposal) ⇒ <code>\*</code>
    * [.canVote(params)](#ClientAddressListMethods+canVote) ⇒ <code>\*</code>
    * [.getMembers(_daoAddressOrEns)](#ClientAddressListMethods+getMembers) ⇒ <code>\*</code>
    * [.getProposal(proposalId)](#ClientAddressListMethods+getProposal) ⇒ <code>\*</code>
    * [.getProposals({)](#ClientAddressListMethods+getProposals) ⇒ <code>\*</code>
    * [.getSettings(pluginAddress)](#ClientAddressListMethods+getSettings) ⇒ <code>\*</code>

<a name="ClientAddressListMethods+createProposal"></a>

### clientAddressListMethods.createProposal(_params) ⇒ <code>\*</code>
<p>Creates a new proposal on the given AddressList plugin contract</p>

**Kind**: instance method of [<code>ClientAddressListMethods</code>](#ClientAddressListMethods)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ProposalCreationStepValue>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>ICreateProposalParams</code> | 

<a name="ClientAddressListMethods+voteProposal"></a>

### clientAddressListMethods.voteProposal(_params) ⇒ <code>\*</code>
<p>Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.</p>

**Kind**: instance method of [<code>ClientAddressListMethods</code>](#ClientAddressListMethods)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<VoteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>IVoteProposalParams</code> | 

<a name="ClientAddressListMethods+executeProposal"></a>

### clientAddressListMethods.executeProposal(_params) ⇒ <code>\*</code>
<p>Executes the given proposal, provided that it has already passed</p>

**Kind**: instance method of [<code>ClientAddressListMethods</code>](#ClientAddressListMethods)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ExecuteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>IExecuteProposalParams</code> | 

<a name="ClientAddressListMethods+canVote"></a>

### clientAddressListMethods.canVote(params) ⇒ <code>\*</code>
<p>Checks if an user can vote in a proposal</p>

**Kind**: instance method of [<code>ClientAddressListMethods</code>](#ClientAddressListMethods)  
**Returns**: <code>\*</code> - <p>{Promise<boolean>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICanVoteParams</code> | 

<a name="ClientAddressListMethods+getMembers"></a>

### clientAddressListMethods.getMembers(_daoAddressOrEns) ⇒ <code>\*</code>
<p>Returns the list of wallet addresses with signing capabilities on the plugin</p>

**Kind**: instance method of [<code>ClientAddressListMethods</code>](#ClientAddressListMethods)  
**Returns**: <code>\*</code> - <p>{Promise&lt;string[]&gt;}</p>  

| Param | Type |
| --- | --- |
| _daoAddressOrEns | <code>string</code> | 

<a name="ClientAddressListMethods+getProposal"></a>

### clientAddressListMethods.getProposal(proposalId) ⇒ <code>\*</code>
<p>Returns the details of the given proposal</p>

**Kind**: instance method of [<code>ClientAddressListMethods</code>](#ClientAddressListMethods)  
**Returns**: <code>\*</code> - <p>{(Promise&lt;AddressListProposal | null&gt;)}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="ClientAddressListMethods+getProposals"></a>

### clientAddressListMethods.getProposals({) ⇒ <code>\*</code>
<p>Returns a list of proposals on the Plugin, filtered by the given criteria</p>

**Kind**: instance method of [<code>ClientAddressListMethods</code>](#ClientAddressListMethods)  
**Returns**: <code>\*</code> - <p>{Promise&lt;AddressListProposalListItem[]&gt;}</p>  

| Param | Type | Description |
| --- | --- | --- |
| { | <code>IProposalQueryParams</code> | <p>daoAddressOrEns, limit = 10, status, skip = 0, direction = SortDirection.ASC, sortBy = ProposalSortBy.CREATED_AT, }</p> |

<a name="ClientAddressListMethods+getSettings"></a>

### clientAddressListMethods.getSettings(pluginAddress) ⇒ <code>\*</code>
<p>Returns the settings of a plugin given the address of the plugin instance</p>

**Kind**: instance method of [<code>ClientAddressListMethods</code>](#ClientAddressListMethods)  
**Returns**: <code>\*</code> - <p>{(Promise&lt;IPluginSettings | null&gt;)}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 

