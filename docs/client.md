## Classes

<dl>
<dt><a href="#Client">Client</a></dt>
<dd><p>Provider a generic client with high level methods to manage and interact with DAO's</p></dd>
<dt><a href="#ClientDecoding">ClientDecoding</a></dt>
<dd><p>Decoding module the SDK Generic Client</p></dd>
<dt><a href="#ClientEncoding">ClientEncoding</a></dt>
<dd><p>Encoding module the SDK Generic Client</p></dd>
<dt><a href="#ClientEstimation">ClientEstimation</a></dt>
<dd><p>Estimation module the SDK Generic Client</p></dd>
<dt><a href="#ClientMethods">ClientMethods</a></dt>
<dd><p>Methods module the SDK Generic Client</p></dd>
</dl>

<a name="Client"></a>

## Client
<p>Provider a generic client with high level methods to manage and interact with DAO's</p>

**Kind**: global class  
<a name="ClientDecoding"></a>

## ClientDecoding
<p>Decoding module the SDK Generic Client</p>

**Kind**: global class  

* [ClientDecoding](#ClientDecoding)
    * [.grantAction(data)](#ClientDecoding+grantAction) ⇒ <code>\*</code>
    * [.revokeAction(data)](#ClientDecoding+revokeAction) ⇒ <code>\*</code>
    * [.freezeAction(data)](#ClientDecoding+freezeAction) ⇒ <code>\*</code>
    * [.withdrawAction(data)](#ClientDecoding+withdrawAction) ⇒ <code>\*</code>
    * [.updateMetadataRawAction(data)](#ClientDecoding+updateMetadataRawAction) ⇒ <code>\*</code>
    * [.updateMetadataAction(data)](#ClientDecoding+updateMetadataAction) ⇒ <code>\*</code>
    * [.findInterface(data)](#ClientDecoding+findInterface) ⇒ <code>\*</code>

<a name="ClientDecoding+grantAction"></a>

### clientDecoding.grantAction(data) ⇒ <code>\*</code>
<p>Decodes the permission parameters from an encoded grant action</p>

**Kind**: instance method of [<code>ClientDecoding</code>](#ClientDecoding)  
**Returns**: <code>\*</code> - <p>{IGrantPermissionDecodedParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientDecoding+revokeAction"></a>

### clientDecoding.revokeAction(data) ⇒ <code>\*</code>
<p>Decodes the permission parameters from an encoded revoke action</p>

**Kind**: instance method of [<code>ClientDecoding</code>](#ClientDecoding)  
**Returns**: <code>\*</code> - <p>{IRevokePermissionDecodedParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientDecoding+freezeAction"></a>

### clientDecoding.freezeAction(data) ⇒ <code>\*</code>
<p>Decodes the freeze parameters from an encoded freeze action</p>

**Kind**: instance method of [<code>ClientDecoding</code>](#ClientDecoding)  
**Returns**: <code>\*</code> - <p>{IFreezePermissionDecodedParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientDecoding+withdrawAction"></a>

### clientDecoding.withdrawAction(data) ⇒ <code>\*</code>
<p>Decodes the withdraw parameters from an encoded withdraw action</p>

**Kind**: instance method of [<code>ClientDecoding</code>](#ClientDecoding)  
**Returns**: <code>\*</code> - <p>{IWithdrawParams}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientDecoding+updateMetadataRawAction"></a>

### clientDecoding.updateMetadataRawAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata ipfs uri from an encoded update metadata action</p>

**Kind**: instance method of [<code>ClientDecoding</code>](#ClientDecoding)  
**Returns**: <code>\*</code> - <p>{string}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientDecoding+updateMetadataAction"></a>

### clientDecoding.updateMetadataAction(data) ⇒ <code>\*</code>
<p>Decodes a dao metadata from an encoded update metadata raw action</p>

**Kind**: instance method of [<code>ClientDecoding</code>](#ClientDecoding)  
**Returns**: <code>\*</code> - <p>{Promise<IMetadata>}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientDecoding+findInterface"></a>

### clientDecoding.findInterface(data) ⇒ <code>\*</code>
<p>Returns the decoded function info given the encoded data of an action</p>

**Kind**: instance method of [<code>ClientDecoding</code>](#ClientDecoding)  
**Returns**: <code>\*</code> - <p>{(IInterfaceParams | null)}</p>  

| Param | Type |
| --- | --- |
| data | <code>Uint8Array</code> | 

<a name="ClientEncoding"></a>

## ClientEncoding
<p>Encoding module the SDK Generic Client</p>

**Kind**: global class  

* [ClientEncoding](#ClientEncoding)
    * [.grantAction(daoAddress, params)](#ClientEncoding+grantAction) ⇒ <code>\*</code>
    * [.revokeAction(daoAddress, params)](#ClientEncoding+revokeAction) ⇒ <code>\*</code>
    * [.freezeAction(daoAddress, params)](#ClientEncoding+freezeAction) ⇒ <code>\*</code>
    * [.withdrawAction(daoAddressOrEns, params)](#ClientEncoding+withdrawAction) ⇒ <code>\*</code>
    * [.updateMetadataAction(daoAddressOrEns, params)](#ClientEncoding+updateMetadataAction) ⇒ <code>\*</code>

<a name="ClientEncoding+grantAction"></a>

### clientEncoding.grantAction(daoAddress, params) ⇒ <code>\*</code>
<p>Computes the payload to be given when creating a proposal that grants a permission within a DAO</p>

**Kind**: instance method of [<code>ClientEncoding</code>](#ClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| daoAddress | <code>string</code> | 
| params | <code>IGrantPermissionParams</code> | 

<a name="ClientEncoding+revokeAction"></a>

### clientEncoding.revokeAction(daoAddress, params) ⇒ <code>\*</code>
<p>Computes the payload to be given when creating a proposal that revokes a permission within a DAO</p>

**Kind**: instance method of [<code>ClientEncoding</code>](#ClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| daoAddress | <code>string</code> | 
| params | <code>IRevokePermissionParams</code> | 

<a name="ClientEncoding+freezeAction"></a>

### clientEncoding.freezeAction(daoAddress, params) ⇒ <code>\*</code>
<p>Computes the payload to be given when creating a proposal that freezes a permission within a DAO</p>

**Kind**: instance method of [<code>ClientEncoding</code>](#ClientEncoding)  
**Returns**: <code>\*</code> - <p>{DaoAction}</p>  

| Param | Type |
| --- | --- |
| daoAddress | <code>string</code> | 
| params | <code>IFreezePermissionParams</code> | 

<a name="ClientEncoding+withdrawAction"></a>

### clientEncoding.withdrawAction(daoAddressOrEns, params) ⇒ <code>\*</code>
<p>Computes the payload to be given when creating a proposal that withdraws ether or an ERC20 token from the DAO</p>

**Kind**: instance method of [<code>ClientEncoding</code>](#ClientEncoding)  
**Returns**: <code>\*</code> - <p>{Promise<DaoAction>}</p>  

| Param | Type |
| --- | --- |
| daoAddressOrEns | <code>string</code> | 
| params | <code>IWithdrawParams</code> | 

<a name="ClientEncoding+updateMetadataAction"></a>

### clientEncoding.updateMetadataAction(daoAddressOrEns, params) ⇒ <code>\*</code>
<p>Computes the payload to be given when creating a proposal that updates the metadata the DAO</p>

**Kind**: instance method of [<code>ClientEncoding</code>](#ClientEncoding)  
**Returns**: <code>\*</code> - <p>{Promise<DaoAction>}</p>  

| Param | Type |
| --- | --- |
| daoAddressOrEns | <code>string</code> | 
| params | <code>IMetadata</code> | 

<a name="ClientEstimation"></a>

## ClientEstimation
<p>Estimation module the SDK Generic Client</p>

**Kind**: global class  

* [ClientEstimation](#ClientEstimation)
    * [.create(_params)](#ClientEstimation+create) ⇒ <code>\*</code>
    * [.deposit(params)](#ClientEstimation+deposit) ⇒ <code>\*</code>
    * [.updateAllowance(_params)](#ClientEstimation+updateAllowance) ⇒ <code>\*</code>

<a name="ClientEstimation+create"></a>

### clientEstimation.create(_params) ⇒ <code>\*</code>
<p>Estimates the gas fee of creating a DAO</p>

**Kind**: instance method of [<code>ClientEstimation</code>](#ClientEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>ICreateParams</code> | 

<a name="ClientEstimation+deposit"></a>

### clientEstimation.deposit(params) ⇒ <code>\*</code>
<p>Estimates the gas fee of depositing ether or an ERC20 token into the DAO
This does not estimate the gas cost of updating the allowance of an ERC20 token</p>

**Kind**: instance method of [<code>ClientEstimation</code>](#ClientEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IDepositParams</code> | 

<a name="ClientEstimation+updateAllowance"></a>

### clientEstimation.updateAllowance(_params) ⇒ <code>\*</code>
<p>Estimates the gas fee of updating the allowance of an ERC20 token</p>

**Kind**: instance method of [<code>ClientEstimation</code>](#ClientEstimation)  
**Returns**: <code>\*</code> - <p>{Promise<GasFeeEstimation>}</p>  

| Param | Type |
| --- | --- |
| _params | <code>IDepositParams</code> | 

<a name="ClientMethods"></a>

## ClientMethods
<p>Methods module the SDK Generic Client</p>

**Kind**: global class  

* [ClientMethods](#ClientMethods)
    * [.create(params)](#ClientMethods+create) ⇒ <code>\*</code>
    * [.deposit(params)](#ClientMethods+deposit) ⇒ <code>\*</code>
    * [.hasPermission(params)](#ClientMethods+hasPermission) ⇒ <code>\*</code>
    * [.getDao(daoAddressOrEns)](#ClientMethods+getDao) ⇒ <code>\*</code>
    * [.getDaos({)](#ClientMethods+getDaos) ⇒ <code>\*</code>
    * [.getBalances(daoAddressorEns, _tokenAddresses)](#ClientMethods+getBalances) ⇒ <code>\*</code>
    * [.getTransfers({)](#ClientMethods+getTransfers) ⇒ <code>\*</code>

<a name="ClientMethods+create"></a>

### clientMethods.create(params) ⇒ <code>\*</code>
<p>Creates a DAO with the given settings and plugins</p>

**Kind**: instance method of [<code>ClientMethods</code>](#ClientMethods)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<DaoCreationStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>ICreateParams</code> | 

<a name="ClientMethods+deposit"></a>

### clientMethods.deposit(params) ⇒ <code>\*</code>
<p>Deposits ether or an ERC20 token into the DAO</p>

**Kind**: instance method of [<code>ClientMethods</code>](#ClientMethods)  
**Returns**: <code>\*</code> - <p>{AsyncGenerator<DaoDepositStepValue>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IDepositParams</code> | 

<a name="ClientMethods+hasPermission"></a>

### clientMethods.hasPermission(params) ⇒ <code>\*</code>
<p>Checks whether a role is granted by the current DAO's ACL settings</p>

**Kind**: instance method of [<code>ClientMethods</code>](#ClientMethods)  
**Returns**: <code>\*</code> - <p>{Promise<boolean>}</p>  

| Param | Type |
| --- | --- |
| params | <code>IHasPermissionParams</code> | 

<a name="ClientMethods+getDao"></a>

### clientMethods.getDao(daoAddressOrEns) ⇒ <code>\*</code>
<p>Retrieves metadata for DAO with given identifier (address or ens domain)</p>

**Kind**: instance method of [<code>ClientMethods</code>](#ClientMethods)  
**Returns**: <code>\*</code> - <p>{(Promise&lt;DaoDetails | null&gt;)}</p>  

| Param | Type |
| --- | --- |
| daoAddressOrEns | <code>string</code> | 

<a name="ClientMethods+getDaos"></a>

### clientMethods.getDaos({) ⇒ <code>\*</code>
<p>Retrieves metadata for DAO with given identifier (address or ens domain)</p>

**Kind**: instance method of [<code>ClientMethods</code>](#ClientMethods)  
**Returns**: <code>\*</code> - <p>{Promise&lt;DaoListItem[]&gt;}</p>  

| Param | Type | Description |
| --- | --- | --- |
| { | <code>IDaoQueryParams</code> | <p>limit = 10, skip = 0, direction = SortDirection.ASC, sortBy = DaoSortBy.CREATED_AT, }</p> |

<a name="ClientMethods+getBalances"></a>

### clientMethods.getBalances(daoAddressorEns, _tokenAddresses) ⇒ <code>\*</code>
<p>Retrieves the asset balances of the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet</p>

**Kind**: instance method of [<code>ClientMethods</code>](#ClientMethods)  
**Returns**: <code>\*</code> - <p>{(Promise&lt;AssetBalance[] | null&gt;)}</p>  

| Param | Type |
| --- | --- |
| daoAddressorEns | <code>string</code> | 
| _tokenAddresses | <code>Array.&lt;string&gt;</code> | 

<a name="ClientMethods+getTransfers"></a>

### clientMethods.getTransfers({) ⇒ <code>\*</code>
<p>Retrieves the list of asset transfers to and from the given DAO (by default, from ETH, DAI, USDC and USDT, on Mainnet)</p>

**Kind**: instance method of [<code>ClientMethods</code>](#ClientMethods)  
**Returns**: <code>\*</code> - <p>{(Promise&lt;Transfer[] | null&gt;)}</p>  

| Param | Type | Description |
| --- | --- | --- |
| { | <code>ITransferQueryParams</code> | <p>daoAddressOrEns, type, limit = 10, skip = 0, direction = SortDirection.ASC, sortBy = TransferSortBy.CREATED_AT, }</p> |

