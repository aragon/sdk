## Classes

<dl>
<dt><a href="#AdminClient">AdminClient</a></dt>
<dd><p>Provides a generic client with high level methods to manage and interact an Admin plugin installed in a DAO</p></dd>
<dt><a href="#AdminClientEncoding">AdminClientEncoding</a></dt>
<dd><p>Encoding module for the SDK Admin Client</p></dd>
<dt><a href="#AdminClientEstimation">AdminClientEstimation</a></dt>
<dd><p>Estimation module for the SDK Admin Client</p></dd>
<dt><a href="#AdminClientMethods">AdminClientMethods</a></dt>
<dd><p>Methods module for the SDK Admin Client</p></dd>
</dl>

<a name="AdminClient"></a>

## AdminClient
<p>Provides a generic client with high level methods to manage and interact an Admin plugin installed in a DAO</p>

**Kind**: global class  
<a name="AdminClient.getPluginInstallItem"></a>

### AdminClient.getPluginInstallItem(addressOrEns) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>AdminClient</code>](#AdminClient)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| addressOrEns | <code>string</code> | 

<a name="AdminClientEncoding"></a>

## AdminClientEncoding
<p>Encoding module for the SDK Admin Client</p>

**Kind**: global class  
<a name="AdminClientEstimation"></a>

## AdminClientEstimation
<p>Estimation module for the SDK Admin Client</p>

**Kind**: global class  
<a name="AdminClientEstimation+executeProposal"></a>

### adminClientEstimation.executeProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of executing a proposal</p>

**Kind**: instance method of [<code>AdminClientEstimation</code>](#AdminClientEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ExecuteProposalParams</code> | 

<a name="AdminClientMethods"></a>

## AdminClientMethods
<p>Methods module for the SDK Admin Client</p>

**Kind**: global class  

* [AdminClientMethods](#AdminClientMethods)
    * [.executeProposal(params)](#AdminClientMethods+executeProposal) ⇒ <code>\*</code>
    * [.pinMetadata(params)](#AdminClientMethods+pinMetadata) ⇒ <code>\*</code>
    * [.getProposals()](#AdminClientMethods+getProposals) ⇒ <code>\*</code>

<a name="AdminClientMethods+executeProposal"></a>

### adminClientMethods.executeProposal(params) ⇒ <code>\*</code>
<p>Executes the given proposal if the user has</p>

**Kind**: instance method of [<code>AdminClientMethods</code>](#AdminClientMethods)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ExecuteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ExecuteProposalParams</code> | 

<a name="AdminClientMethods+pinMetadata"></a>

### adminClientMethods.pinMetadata(params) ⇒ <code>\*</code>
<p>Pins a metadata object into IPFS and retruns the generated hash</p>

**Kind**: instance method of [<code>AdminClientMethods</code>](#AdminClientMethods)  
**Returns**: <code>\*</code> - <p>{Promise<string>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ProposalMetadata</code> | 

<a name="AdminClientMethods+getProposals"></a>

### adminClientMethods.getProposals() ⇒ <code>\*</code>
<p>Returns a list of proposals on the Plugin, filtered by the given criteria</p>

**Kind**: instance method of [<code>AdminClientMethods</code>](#AdminClientMethods)  
**Returns**: <code>\*</code> - <p>{Promise&lt;AdminProposalListItem[]&gt;}</p>  

| Param | Type |
| --- | --- |
|  | <code>IAdminProposalQueryParams</code> | 

