## Classes

<dl>
<dt><a href="#ClientAdmin">ClientAdmin</a></dt>
<dd><p>Provides a generic client with high level methods to manage and interact an Admin plugin installed in a DAO</p></dd>
<dt><a href="#ClientAdminEncoding">ClientAdminEncoding</a></dt>
<dd><p>Encoding module for the SDK Admin Client</p></dd>
<dt><a href="#ClientAdminEstimation">ClientAdminEstimation</a></dt>
<dd><p>Estimation module for the SDK Admin Client</p></dd>
<dt><a href="#ClientAdminMethods">ClientAdminMethods</a></dt>
<dd><p>Methods module for the SDK Admin Client</p></dd>
</dl>

<a name="ClientAdmin"></a>

## ClientAdmin
<p>Provides a generic client with high level methods to manage and interact an Admin plugin installed in a DAO</p>

**Kind**: global class  
<a name="ClientAdmin.getPluginInstallItem"></a>

### ClientAdmin.getPluginInstallItem(addressOrEns) ⇒ <code>\*</code>
<p>Computes the parameters to be given when creating the DAO,
so that the plugin is configured</p>

**Kind**: static method of [<code>ClientAdmin</code>](#ClientAdmin)  
**Returns**: <code>\*</code> - <p>{IPluginInstallItem}</p>  

| Param | Type |
| --- | --- |
| addressOrEns | <code>string</code> | 

<a name="ClientAdminEncoding"></a>

## ClientAdminEncoding
<p>Encoding module for the SDK Admin Client</p>

**Kind**: global class  
<a name="ClientAdminEstimation"></a>

## ClientAdminEstimation
<p>Estimation module for the SDK Admin Client</p>

**Kind**: global class  
<a name="ClientAdminEstimation+executeProposal"></a>

### clientAdminEstimation.executeProposal(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of executing a proposal</p>

**Kind**: instance method of [<code>ClientAdminEstimation</code>](#ClientAdminEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ExecuteProposalParams</code> | 

<a name="ClientAdminMethods"></a>

## ClientAdminMethods
<p>Methods module for the SDK Admin Client</p>

**Kind**: global class  

* [ClientAdminMethods](#ClientAdminMethods)
    * [.executeProposal(params)](#ClientAdminMethods+executeProposal) ⇒ <code>\*</code>
    * [.pinMetadata(params)](#ClientAdminMethods+pinMetadata) ⇒ <code>\*</code>
    * [.getProposals()](#ClientAdminMethods+getProposals) ⇒ <code>\*</code>

<a name="ClientAdminMethods+executeProposal"></a>

### clientAdminMethods.executeProposal(params) ⇒ <code>\*</code>
<p>Executes the given proposal if the user has</p>

**Kind**: instance method of [<code>ClientAdminMethods</code>](#ClientAdminMethods)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<ExecuteProposalStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ExecuteProposalParams</code> | 

<a name="ClientAdminMethods+pinMetadata"></a>

### clientAdminMethods.pinMetadata(params) ⇒ <code>\*</code>
<p>Pins a metadata object into IPFS and retruns the generated hash</p>

**Kind**: instance method of [<code>ClientAdminMethods</code>](#ClientAdminMethods)  
**Returns**: <code>\*</code> - <p>{Promise<string>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ProposalMetadata</code> | 

<a name="ClientAdminMethods+getProposals"></a>

### clientAdminMethods.getProposals() ⇒ <code>\*</code>
<p>Returns a list of proposals on the Plugin, filtered by the given criteria</p>

**Kind**: instance method of [<code>ClientAdminMethods</code>](#ClientAdminMethods)  
**Returns**: <code>\*</code> - <p>{Promise&lt;AdminProposalListItem[]&gt;}</p>  

| Param | Type |
| --- | --- |
|  | <code>IAdminProposalQueryParams</code> | 

