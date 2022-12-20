## Classes

<dl>
<dt><a href="#MultisigClient">MultisigClient</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO</p></dd>
<dt><a href="#MultisigClientDecoding">MultisigClientDecoding</a></dt>
<dd><p>Decoding module for the SDK AddressList Client</p></dd>
<dt><a href="#MultisigClientEncoding">MultisigClientEncoding</a></dt>
<dd><p>Encoding module for the SDK Multisig Client</p></dd>
<dt><a href="#MultisigClientEstimation">MultisigClientEstimation</a></dt>
<dd><p>Estimation module the SDK Address List Client</p></dd>
<dt><a href="#MultisigClientMethods">MultisigClientMethods</a></dt>
<dd><p>Methods module the SDK Address List Client</p></dd>
</dl>

## Members

<dl>
<dt><a href="#ApproveProposalSteps">ApproveProposalSteps</a></dt>
<dd><p>Defines the shape of the AddressList client class</p></dd>
</dl>

<a name="MultisigClient"></a>

## MultisigClient
<p>Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO</p>

**Kind**: global class  
<a name="MultisigClient.getPluginInstallItem"></a>

### MultisigClient.getPluginInstallItem(members) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>MultisigClient</code>](#MultisigClient)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| members | <code>Array.&lt;string&gt;</code> | 

<a name="MultisigClientDecoding"></a>

## MultisigClientDecoding
<p>Decoding module for the SDK AddressList Client</p>

**Kind**: global class  

* [MultisigClientDecoding](#MultisigClientDecoding)
    * [.addMembersAction(data)](#MultisigClientDecoding+addMembersAction) ⇒ <code>\*</code>
    * [.removeMembersAction(data)](#MultisigClientDecoding+removeMembersAction) ⇒ <code>\*</code>
    * [.findInterface(data)](#MultisigClientDecoding+findInterface) ⇒ <code>\*</code>

<a name="MultisigClientDecoding+addMembersAction"></a>

### multisigClientDecoding.addMembersAction(data) ⇒ <code>\*</code>
<p>Decodes a list of addresses from an encoded add members action</p>

**Kind**: instance method of [<code>MultisigClientDecoding</code>](#MultisigClientDecoding)  
**Returns**: <code>\*</code> - <p>{string[]}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="MultisigClientDecoding+removeMembersAction"></a>

### multisigClientDecoding.removeMembersAction(data) ⇒ <code>\*</code>
<p>Decodes a list of addresses from an encoded remove members action</p>

**Kind**: instance method of [<code>MultisigClientDecoding</code>](#MultisigClientDecoding)  
**Returns**: <code>\*</code> - <p>{string[]}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="MultisigClientDecoding+findInterface"></a>

### multisigClientDecoding.findInterface(data) ⇒ <code>\*</code>
<p>Returns the decoded function info given the encoded data of an action</p>

**Kind**: instance method of [<code>MultisigClientDecoding</code>](#MultisigClientDecoding)  
**Returns**: <code>\*</code> - <p>{(IInterfaceParams | null)}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="MultisigClientEncoding"></a>

## MultisigClientEncoding
<p>Encoding module for the SDK Multisig Client</p>

**Kind**: global class  

* [MultisigClientEncoding](#MultisigClientEncoding)
    * _instance_
        * [.addMembersAction(pluginAddress, members)](#MultisigClientEncoding+addMembersAction) ⇒ <code>\*</code>
        * [.removeMembersAction(pluginAddress, members)](#MultisigClientEncoding+removeMembersAction) ⇒ <code>\*</code>
    * _static_
        * [.getPluginInstallItem(members)](#MultisigClientEncoding.getPluginInstallItem) ⇒ <code>\*</code>

<a name="MultisigClientEncoding+addMembersAction"></a>

### multisigClientEncoding.addMembersAction(pluginAddress, members) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that updates the governance configuration</p>

**Kind**: instance method of [<code>MultisigClientEncoding</code>](#MultisigClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| members | <code>Array.&lt;string&gt;</code> | 

<a name="MultisigClientEncoding+removeMembersAction"></a>

### multisigClientEncoding.removeMembersAction(pluginAddress, members) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating a proposal that adds addresses to address list</p>

**Kind**: instance method of [<code>MultisigClientEncoding</code>](#MultisigClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| pluginAddress | <code>string</code> | 
| members | <code>Array.&lt;string&gt;</code> | 

<a name="MultisigClientEncoding.getPluginInstallItem"></a>

### MultisigClientEncoding.getPluginInstallItem(members) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>MultisigClientEncoding</code>](#MultisigClientEncoding)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| members | <code>Array.&lt;string&gt;</code> | 

<a name="MultisigClientEstimation"></a>

## MultisigClientEstimation
<p>Estimation module the SDK Address List Client</p>

**Kind**: global class  
<a name="MultisigClientMethods"></a>

## MultisigClientMethods
<p>Methods module the SDK Address List Client</p>

**Kind**: global class  

* [MultisigClientMethods](#MultisigClientMethods)
    * [.createProposal(params)](#MultisigClientMethods+createProposal) ⇒ <code>\*</code>
    * [.pinMetadata(params)](#MultisigClientMethods+pinMetadata) ⇒ <code>\*</code>
    * [.approveProposal(params)](#MultisigClientMethods+approveProposal) ⇒ <code>\*</code>
    * [.canApprove(addressOrEns)](#MultisigClientMethods+canApprove) ⇒ <code>\*</code>
    * [.getMembers(addressOrEns)](#MultisigClientMethods+getMembers) ⇒ <code>\*</code>
    * [.getProposal(proposalId)](#MultisigClientMethods+getProposal) ⇒ <code>\*</code>
    * [.getProposals({)](#MultisigClientMethods+getProposals) ⇒ <code>\*</code>

<a name="MultisigClientMethods+createProposal"></a>

### multisigClientMethods.createProposal(params) ⇒ <code>\*</code>
<p>Creates a new proposal on the given multisig plugin contract</p>

**Kind**: instance method of [<code>MultisigClientMethods</code>](#MultisigClientMethods)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ProposalCreationStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>CreateMultisigProposalParams</code> | 

<a name="MultisigClientMethods+pinMetadata"></a>

### multisigClientMethods.pinMetadata(params) ⇒ <code>\*</code>
<p>Pins a metadata object into IPFS and retruns the generated hash</p>

**Kind**: instance method of [<code>MultisigClientMethods</code>](#MultisigClientMethods)  
**Returns**: <code>\*</code> - <p>{Promise<string>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ProposalMetadata</code> | 

<a name="MultisigClientMethods+approveProposal"></a>

### multisigClientMethods.approveProposal(params) ⇒ <code>\*</code>
<p>Allow a wallet in the multisig give approval to a proposal</p>

**Kind**: instance method of [<code>MultisigClientMethods</code>](#MultisigClientMethods)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ApproveProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ApproveMultisigProposalParams</code> | 

<a name="MultisigClientMethods+canApprove"></a>

### multisigClientMethods.canApprove(addressOrEns) ⇒ <code>\*</code>
<p>Returns the list of wallet addresses with signing capabilities on the plugin</p>

**Kind**: instance method of [<code>MultisigClientMethods</code>](#MultisigClientMethods)  
**Returns**: <code>\*</code> - <p>{Promise<boolean>}</p>  

| Param | Type |
| --- | --- |
| addressOrEns | <code>string</code> | 

<a name="MultisigClientMethods+getMembers"></a>

### multisigClientMethods.getMembers(addressOrEns) ⇒ <code>\*</code>
<p>Checks if an user can vote in a proposal</p>

**Kind**: instance method of [<code>MultisigClientMethods</code>](#MultisigClientMethods)  
**Returns**: <code>\*</code> - <p>{Promise&lt;string[]&gt;}</p>  

| Param | Type |
| --- | --- |
| addressOrEns | <code>string</code> | 

<a name="MultisigClientMethods+getProposal"></a>

### multisigClientMethods.getProposal(proposalId) ⇒ <code>\*</code>
<p>Returns the details of the given proposal</p>

**Kind**: instance method of [<code>MultisigClientMethods</code>](#MultisigClientMethods)  
**Returns**: <code>\*</code> - <p>{(Promise&lt;AddressListProposal | null&gt;)}</p>  

| Param | Type |
| --- | --- |
| proposalId | <code>string</code> | 

<a name="MultisigClientMethods+getProposals"></a>

### multisigClientMethods.getProposals({) ⇒ <code>\*</code>
<p>Returns a list of proposals on the Plugin, filtered by the given criteria</p>

**Kind**: instance method of [<code>MultisigClientMethods</code>](#MultisigClientMethods)  
**Returns**: <code>\*</code> - <p>{Promise&lt;AddressListProposalListItem[]&gt;}</p>  

| Param | Type | Description |
| --- | --- | --- |
| { | <code>IProposalQueryParams</code> | <p>daoAddressOrEns, limit = 10, status, skip = 0, direction = SortDirection.ASC, sortBy = ProposalSortBy.CREATED_AT, }</p> |

<a name="ApproveProposalSteps"></a>

## ApproveProposalSteps
<p>Defines the shape of the AddressList client class</p>

**Kind**: global variable  
